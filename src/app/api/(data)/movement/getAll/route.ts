import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ success: false, message: "Please enter FIR No." }, { status: 400 });
    }

    try {
        const data = await prisma.malkhanaEntry.findMany({
            where: { userId },
            select: {

                id: true,
                srNo: true,
                isReturned: true,
                caseProperty: true,
                moveDate: true,
                underSection: true,
                takenOutBy: true,
                moveTrackingNo: true,
                movePurpose: true,
                name: true,
                receivedBy: true,
                returnDate: true,
                returnBackFrom: true
            }
        });

        if (!data) {
            return NextResponse.json({ success: false, message: "No record found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error("GET /api/movement error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
    }
};