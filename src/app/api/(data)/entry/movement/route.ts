import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const entries = await prisma.malkhanaEntry.findMany({
            where: {
                userId
            }, orderBy: { createdAt: "desc" },
            select: {
                firNo: true,
                srNo: true,
                id: true,
                caseProperty: true,
                isReturned: true,
                moveDate: true,
                underSection: true,
                moveTrackingNo: true,
                movePurpose: true,
                policeStation: true,
                returnBackFrom: true,
                returnDate: true,
            }
        })

        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        console.error("GET /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch seized vehicle entries" }, { status: 500 });
    }
};