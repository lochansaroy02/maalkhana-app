import nodemailer from "nodemailer";
import type { BackupFile } from "./buildBackup";

// Gmail attachments are limited to 25 MB per email (after encoding).
const MAX_ATTACHMENT_BYTES = 18 * 1024 * 1024;

/**
 * Mail transport. Credentials should be server-only EMAIL_USER / EMAIL_PASS;
 * the old NEXT_PUBLIC_* names still work as a fallback.
 * BACKUP_EMAIL_TRANSPORT=file writes the email to BACKUP_EMAIL_DIR instead of
 * sending it (for local testing).
 */
function createTransport() {
    if (process.env.BACKUP_EMAIL_TRANSPORT === "file") {
        return nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });
    }
    const user = process.env.EMAIL_USER || process.env.NEXT_PUBLIC_EMAIL_USER;
    const pass = process.env.EMAIL_PASS || process.env.NEXT_PUBLIC_EMAIL_PASS;
    if (!user || !pass) throw new Error("Email credentials are not configured");
    return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendBackupEmail(opts: {
    to: string;
    name: string;
    label: string;
    files: BackupFile[];
    counts: { entries: number; vehicles: number };
}) {
    const total = opts.files.reduce((s, f) => s + f.content.length, 0);
    if (total > MAX_ATTACHMENT_BYTES) {
        throw new Error(`Backup is too large to email (${fmtSize(total)})`);
    }

    const created = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const fileRows = opts.files.map((f) => `<li>${escapeHtml(f.filename)} <span style="color:#64748b">(${fmtSize(f.content.length)})</span></li>`).join("");
    const from = process.env.EMAIL_USER || process.env.NEXT_PUBLIC_EMAIL_USER || "digital-malkhana@localhost";

    const info = await createTransport().sendMail({
        from: `Digital Malkhana <${from}>`,
        to: opts.to,
        subject: `Digital Malkhana backup – ${opts.label} – ${created}`,
        text:
            `Namaste ${opts.name},\n\nAttached is your Digital Malkhana backup (${created} IST).\n` +
            `Malkhana entries: ${opts.counts.entries}\nSeized vehicles: ${opts.counts.vehicles}\n\n` +
            `Files:\n${opts.files.map((f) => `- ${f.filename} (${fmtSize(f.content.length)})`).join("\n")}\n\n` +
            `The .bak file is a compressed full backup (gzip JSON) kept for restoring data. The .csv files open in Excel.\n`,
        html: `
<div style="font-family:Arial,sans-serif;color:#0f172a;max-width:560px">
  <div style="background:#741e1c;color:#fef9e5;padding:14px 18px;border-radius:8px 8px 0 0;font-size:18px;font-weight:bold">Digital Malkhana — Backup</div>
  <div style="border:1px solid #e2e8f0;border-top:0;padding:18px;border-radius:0 0 8px 8px">
    <p>Namaste ${escapeHtml(opts.name)},</p>
    <p>Attached is your backup for <b>${escapeHtml(opts.label)}</b>, created on ${escapeHtml(created)} IST.</p>
    <table style="border-collapse:collapse;margin:8px 0">
      <tr><td style="padding:4px 12px 4px 0">Malkhana entries</td><td><b>${opts.counts.entries}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0">Seized vehicles</td><td><b>${opts.counts.vehicles}</b></td></tr>
    </table>
    <p style="margin-bottom:4px">Attached files:</p>
    <ul style="margin-top:0">${fileRows}</ul>
    <p style="color:#64748b;font-size:13px">The <b>.bak</b> file is a compressed full backup (gzip JSON) kept for restoring data. The <b>.csv</b> files open in Excel.</p>
  </div>
</div>`,
        attachments: opts.files.map((f) => ({ filename: f.filename, content: f.content, contentType: f.contentType })),
    });

    if (process.env.BACKUP_EMAIL_TRANSPORT === "file" && "message" in info) {
        const { writeFileSync, mkdirSync } = await import("node:fs");
        const dir = process.env.BACKUP_EMAIL_DIR || "/tmp";
        mkdirSync(dir, { recursive: true });
        writeFileSync(`${dir}/backup-${Date.now()}.eml`, info.message as Buffer);
    }
    return { messageId: info.messageId, totalBytes: total };
}
