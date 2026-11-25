import { createHmac } from "node:crypto";

export type MediaKind = "photos" | "documents";

/** Ticket payload the media server checks (keep in sync with media-server/server.mjs). */
export interface MediaTicketPayload {
    /** district folder */
    d: string;
    /** police-station folder */
    p: string;
    /** human-readable names, written to _info.json on the server */
    dn: string;
    pn: string;
    k: MediaKind;
    /** uploader user id (logged by the media server) */
    u: string;
    /** expiry, unix seconds */
    exp: number;
}

export const TICKET_TTL_SECONDS = 10 * 60;

export const mediaConfig = () => {
    const serverUrl = (process.env.MEDIA_SERVER_URL || "").replace(/\/+$/, "");
    const secret = process.env.MEDIA_UPLOAD_SECRET || "";
    return serverUrl && secret.length >= 32 ? { serverUrl, secret } : null;
};

/**
 * Folder name for a district / police station: readable ASCII part + short id,
 * so renames never mix folders and Hindi-only names still get a folder
 * ("Bulandshahr" → "bulandshahr-3f9a1c", "थाना कोतवाली" → "ps-3f9a1c").
 */
export const mediaFolder = (name: string | null | undefined, id: string, fallbackPrefix: string) => {
    const slug = (name || "")
        .normalize("NFKD")
        .replace(/[^\x00-\x7F]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
    const shortId = id.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 6) || "x";
    return `${slug || fallbackPrefix}-${shortId}`;
};

export const signMediaTicket = (payload: MediaTicketPayload, secret: string) => {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = createHmac("sha256", secret).update(body).digest("base64url");
    return `${body}.${sig}`;
};
