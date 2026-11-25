import { BackupError, buildBackupFiles, resolveBackupOwner } from "@/lib/backup/buildBackup";
import { sendBackupEmail } from "@/lib/backup/email";
import { NextRequest, NextResponse } from "next/server";

// Legacy endpoint kept for old clients; the app now uses /api/backup.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const owner = await resolveBackupOwner(searchParams.get("userId"), searchParams.get("role") || "policeStation");
        const { files, counts } = await buildBackupFiles(owner, ["bak", "csv"]);
        await sendBackupEmail({ to: owner.email, name: owner.name, label: owner.label, files, counts });
        return NextResponse.json({ success: true, message: `Backup sent to ${owner.email}` }, { status: 200 });
    } catch (error) {
        if (error instanceof BackupError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        console.error("GET /api/all:", error);
        return NextResponse.json({ success: false, message: "Failed to create backup" }, { status: 500 });
    }
}
