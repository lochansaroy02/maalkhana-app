import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {

    const { searchParams } = new URL(req.url);
    const srNo = searchParams.get("srNo");
    const userId = searchParams.get("userId");

    try {
        const selection = {
            id: true,
            srNo: true,
            firNo: true,
            gdNo: true,
            gdDate: true,
            underSection: true,
            vehicleType: true,
            colour: true,

            engineNo: true,
            description: true,
            status: true,
            policeStation: true,
            ownerName: true,
            seizedBy: true,
            caseProperty: true,
            receviedBy: true,
            returnBackFrom: true,
            takenOutBy: true,
            moveTrackingNo: true,
            returnDate: true,
            movePurpose: true,
            name: true,
            photoUrl: true,
            document: true,
            moveDate: true,
            receivedBy: true,
            documentUrl: true,
            receiverName: true,
            fathersName: true,
            address: true,
            mobile: true,
            releaseItemName: true,

        }
        const data = await prisma.seizedVehicle.findFirst({
            where: {
                srNo, userId
            },
            select: selection
        })

        return NextResponse.json({ success: true, data: data }, { status: 200 });

    } catch (error) {
        console.error("GET /api/firNo error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};