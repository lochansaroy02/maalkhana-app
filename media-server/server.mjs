// Maalkhana media server — stores photos and documents per district / police station.
//
//   <MEDIA_ROOT>/<district>/<police-station>/<photos|documents>/<yyyy>/<mm>/<random>-<name>.<ext>
//
// The Next.js app hands the browser a short-lived upload ticket (HMAC-signed
// with MEDIA_UPLOAD_SECRET) that fixes the district/station folder and the
// kind, so a browser can only write into its own station's folder.
// Files are served by nginx (and any CDN in front of it); set SERVE_FILES=1
// to let this process serve them itself during local development.
//
// No npm dependencies. Node >= 20.  Start: node --env-file=.env server.mjs

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { Readable, Transform } from "node:stream";

// ------------------------------------------------------------------ config
const env = (name, fallback) => {
    const v = process.env[name];
    if (v === undefined || v === "") {
        if (fallback === undefined) {
            console.error(`Missing required environment variable ${name}`);
            process.exit(1);
        }
        return fallback;
    }
    return v;
};

const PORT = Number(env("PORT", "4100"));
const HOST = env("HOST", "127.0.0.1");
const MEDIA_ROOT = resolve(env("MEDIA_ROOT"));
const PUBLIC_BASE_URL = env("PUBLIC_BASE_URL").replace(/\/+$/, "");
const SECRET = env("MEDIA_UPLOAD_SECRET");
const MAX_BYTES = Number(env("MAX_UPLOAD_MB", "20")) * 1024 * 1024;
const ALLOWED_ORIGINS = env("ALLOWED_ORIGINS", "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
const SERVE_FILES = env("SERVE_FILES", "0") === "1";

if (SECRET.length < 32) {
    console.error("MEDIA_UPLOAD_SECRET must be at least 32 characters.");
    process.exit(1);
}

// ------------------------------------------------------------------ file types
// Checked by extension AND by the file's first bytes (never trust the browser's type).
const startsWith = (buf, bytes, offset = 0) => bytes.every((b, i) => buf[offset + i] === b);
const ascii = (buf, from, to) => buf.subarray(from, to).toString("latin1");

const TYPES = {
    jpg: { mime: "image/jpeg", test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
    jpeg: { mime: "image/jpeg", test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
    png: { mime: "image/png", test: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
    gif: { mime: "image/gif", test: (b) => ascii(b, 0, 6) === "GIF87a" || ascii(b, 0, 6) === "GIF89a" },
    webp: { mime: "image/webp", test: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP" },
    heic: { mime: "image/heic", test: (b) => ascii(b, 4, 8) === "ftyp" && /^(heic|heix|hevc|mif1|msf1)$/.test(ascii(b, 8, 12)) },
    pdf: { mime: "application/pdf", test: (b) => ascii(b, 0, 5) === "%PDF-" },
    docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", test: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]) },
    xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", test: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]) },
    doc: { mime: "application/msword", test: (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) },
    xls: { mime: "application/vnd.ms-excel", test: (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) },
};
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "heic"];
const ALLOWED = {
    photos: IMAGE_EXTS,
    // Scanned documents are often photos, so images are allowed here too.
    documents: ["pdf", "doc", "docx", "xls", "xlsx", ...IMAGE_EXTS],
};

// ------------------------------------------------------------------ tickets
const b64url = (buf) => Buffer.from(buf).toString("base64url");

/** Ticket = base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload)). */
const verifyTicket = (ticket) => {
    if (typeof ticket !== "string" || !ticket.includes(".")) return null;
    const [body, sig] = ticket.split(".");
    const expected = createHmac("sha256", SECRET).update(body).digest();
    let given;
    try {
        given = Buffer.from(sig, "base64url");
    } catch {
        return null;
    }
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    let payload;
    try {
        payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    } catch {
        return null;
    }
    if (!payload || typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    if (!ALLOWED[payload.k]) return null;
    // Folder names come from the app, but are re-checked so a ticket can never escape MEDIA_ROOT.
    const folderOk = (s) => typeof s === "string" && /^[a-z0-9][a-z0-9_-]{0,80}$/.test(s);
    if (!folderOk(payload.d) || !folderOk(payload.p)) return null;
    return payload;
};

// ------------------------------------------------------------------ helpers
const send = (res, status, body, headers = {}) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
    res.end(JSON.stringify(body));
};

const corsHeaders = (req) => {
    const origin = (req.headers.origin || "").replace(/\/+$/, "");
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "600",
        Vary: "Origin",
    };
};

/** Readable that errors once more than `max` bytes have passed through. */
const limitStream = (max) => {
    let seen = 0;
    return new Transform({
        transform(chunk, _enc, cb) {
            seen += chunk.length;
            if (seen > max) cb(Object.assign(new Error("too large"), { code: "TOO_LARGE" }));
            else cb(null, chunk);
        },
    });
};

const safeBaseName = (name) =>
    (name || "file")
        .replace(/\.[^.]*$/, "")
        .normalize("NFKD")
        .replace(/[^\x00-\x7F]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "file";

// ------------------------------------------------------------------ handlers
const handleUpload = async (req, res, cors) => {
    const auth = req.headers.authorization || "";
    const ticket = verifyTicket(auth.startsWith("Bearer ") ? auth.slice(7) : "");
    if (!ticket) return send(res, 401, { success: false, error: "Invalid or expired upload ticket" }, cors);

    const type = req.headers["content-type"] || "";
    if (!type.startsWith("multipart/form-data")) {
        return send(res, 400, { success: false, error: "Expected multipart/form-data" }, cors);
    }
    // Multipart overhead is small; allow 1 MB on top of the file limit.
    if (Number(req.headers["content-length"] || 0) > MAX_BYTES + 1024 * 1024) {
        return send(res, 413, { success: false, error: `File is larger than ${MAX_BYTES / 1024 / 1024} MB` }, cors);
    }

    let form;
    try {
        const body = Readable.toWeb(req.pipe(limitStream(MAX_BYTES + 1024 * 1024)));
        form = await new Request("http://local/upload", { method: "POST", headers: { "content-type": type }, body, duplex: "half" }).formData();
    } catch (err) {
        if (err?.code === "TOO_LARGE" || err?.cause?.code === "TOO_LARGE") {
            return send(res, 413, { success: false, error: `File is larger than ${MAX_BYTES / 1024 / 1024} MB` }, cors);
        }
        return send(res, 400, { success: false, error: "Could not read the upload" }, cors);
    }

    const file = form.get("file");
    if (!file || typeof file === "string") return send(res, 400, { success: false, error: "No file in field 'file'" }, cors);
    if (file.size === 0) return send(res, 400, { success: false, error: "File is empty" }, cors);
    if (file.size > MAX_BYTES) return send(res, 413, { success: false, error: `File is larger than ${MAX_BYTES / 1024 / 1024} MB` }, cors);

    const ext = extname(file.name || "").slice(1).toLowerCase();
    if (!ALLOWED[ticket.k].includes(ext)) {
        return send(res, 415, { success: false, error: `.${ext || "?"} files are not allowed in ${ticket.k}. Allowed: ${ALLOWED[ticket.k].join(", ")}` }, cors);
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!TYPES[ext].test(bytes)) {
        return send(res, 415, { success: false, error: `File content does not match .${ext}` }, cors);
    }

    const now = new Date();
    const relDir = [ticket.d, ticket.p, ticket.k, String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0")].join("/");
    const fileName = `${b64url(randomBytes(12))}-${safeBaseName(file.name)}.${ext}`;
    const absDir = join(MEDIA_ROOT, ...relDir.split("/"));
    await mkdir(absDir, { recursive: true, mode: 0o755 });
    await writeFile(join(absDir, fileName), bytes, { mode: 0o644, flag: "wx" });

    // Human-readable names next to the slug folders (for browsing on the server).
    await writeInfo(join(MEDIA_ROOT, ticket.d), { district: ticket.dn });
    await writeInfo(join(MEDIA_ROOT, ticket.d, ticket.p), { district: ticket.dn, policeStation: ticket.pn });

    const path = `${relDir}/${fileName}`;
    console.log(`${now.toISOString()} saved ${path} (${bytes.length} bytes) by ${ticket.u || "?"}`);
    return send(res, 201, { success: true, url: `${PUBLIC_BASE_URL}/${path}`, path, size: bytes.length, mime: TYPES[ext].mime }, cors);
};

const writeInfo = async (dir, info) => {
    const file = join(dir, "_info.json");
    if (existsSync(file)) return;
    try {
        await writeFile(file, JSON.stringify(info, null, 2), { flag: "wx" });
    } catch {
        /* written by a parallel upload */
    }
};

/** Development only: nginx serves files in production. */
const handleFile = async (req, res, urlPath) => {
    const rel = normalize(decodeURIComponent(urlPath.replace(/^\/files\//, ""))).replace(/^(\.\.(\/|\\|$))+/, "");
    const abs = join(MEDIA_ROOT, rel);
    if (!abs.startsWith(MEDIA_ROOT + sep) || rel.endsWith("_info.json")) return send(res, 404, { error: "Not found" });
    try {
        const s = await stat(abs);
        if (!s.isFile()) throw new Error();
        const ext = extname(abs).slice(1).toLowerCase();
        res.writeHead(200, {
            "Content-Type": TYPES[ext]?.mime || "application/octet-stream",
            "Content-Length": s.size,
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
        });
        createReadStream(abs).pipe(res);
    } catch {
        send(res, 404, { error: "Not found" });
    }
};

// ------------------------------------------------------------------ server
const server = createServer(async (req, res) => {
    const cors = corsHeaders(req);
    const urlPath = new URL(req.url || "/", "http://local").pathname;
    try {
        if (req.method === "OPTIONS") {
            res.writeHead(204, cors);
            return res.end();
        }
        if (urlPath === "/health" && req.method === "GET") {
            return send(res, 200, { ok: true, root: existsSync(MEDIA_ROOT) });
        }
        if (urlPath === "/upload" && req.method === "POST") {
            return await handleUpload(req, res, cors);
        }
        if (SERVE_FILES && urlPath.startsWith("/files/") && (req.method === "GET" || req.method === "HEAD")) {
            return await handleFile(req, res, urlPath);
        }
        return send(res, 404, { error: "Not found" }, cors);
    } catch (err) {
        console.error("Request failed:", err);
        if (!res.headersSent) send(res, 500, { success: false, error: "Upload failed" }, cors);
        else res.end();
    }
});

await mkdir(MEDIA_ROOT, { recursive: true });
server.requestTimeout = 5 * 60 * 1000;
server.listen(PORT, HOST, () => {
    console.log(`Media server on http://${HOST}:${PORT}  root=${MEDIA_ROOT}  public=${PUBLIC_BASE_URL}  serveFiles=${SERVE_FILES}`);
});
