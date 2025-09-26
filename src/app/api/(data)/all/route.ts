import { sendBackupEmail } from "@/lib/backup/email";
import { generateStationBackup } from "@/lib/backup/stationBackup";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";




export async function GET(req: NextRequest) {
    try {

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({
                success: true, message: "userId not found"
            }, { status: 200 });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })


        const backupData = await generateStationBackup(userId)
        await sendBackupEmail(user?.email, backupData, userId, user?.name);

        return NextResponse.json({
            success: true,
            message: "Backup created successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("GET /api/all:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch entries" }, { status: 500 });
    }
};