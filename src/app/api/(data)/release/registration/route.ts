import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const registrationNo = searchParams.get("registrationNo");
    const srNo = searchParams.get("srNo");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    try {


        if (!registrationNo) {
            return NextResponse.json(
                { success: false, message: "Please enter FirNo or SrNo" },
                { status: 400 }
            );
        }

        const selection = {
            id: true,
            firNo: true,
            srNo: true,
            caseProperty: true,
            moveDate: true,
            underSection: true,
            takenOutBy: true,
            moveTrackingNo: true,
            movePurpose: true,
            receiverName: true,
            address: true,
            policeStation: true,
            mobile: true,
            releaseItemName: true,
            userId: true,
        };

        let data = null;

        if (registrationNo) {
            data = await prisma.seizedVehicle.findMany({
                where: { registrationNo, userId },
                select: selection,
            });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error("GET /api/firNo error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch data" },
            { status: 500 }
        );
    }
};
