import { BackupError, BackupFormat, backupSummary, buildBackupFiles, resolveBackupOwner } from "@/lib/backup/buildBackup";
import { sendBackupEmail } from "@/lib/backup/email";
import { NextRequest, NextResponse } from "next/server";

const errorResponse = (error: unknown, fallback: string) => {
    if (error instanceof BackupError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error(fallback, error);
    const message = error instanceof Error && /too large|credentials/i.test(error.message) ? error.message : fallback;
    return NextResponse.json({ success: false, message }, { status: 500 });
};

/** GET /api/backup?userId=&role= → recipient email and record counts for the modal. */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const owner = await resolveBackupOwner(searchParams.get("userId"), searchParams.get("role"));
        return NextResponse.json({ success: true, data: await backupSummary(owner) });
    } catch (error) {
        return errorResponse(error, "Failed to load backup details");
    }
}

/**
 * POST /api/backup  { userId, role, formats: ["bak", "csv"] }
 * Builds the backup and emails it to the account's own email address.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const formats = (Array.isArray(body.formats) ? body.formats : ["bak", "csv"])
            .filter((f: unknown): f is BackupFormat => f === "bak" || f === "csv");
        if (formats.length === 0) throw new BackupError("Choose at least one file type");

        const owner = await resolveBackupOwner(body.userId ?? null, body.role ?? null);
        const { files, counts } = await buildBackupFiles(owner, formats);
        const sent = await sendBackupEmail({ to: owner.email, name: owner.name, label: owner.label, files, counts });

        return NextResponse.json({
            success: true,
            message: `Backup sent to ${owner.email}`,
            data: { email: owner.email, counts, files: files.map((f) => ({ name: f.filename, size: f.content.length })), totalBytes: sent.totalBytes },
        });
    } catch (error) {
        return errorResponse(error, "Failed to create backup");
    }
}
