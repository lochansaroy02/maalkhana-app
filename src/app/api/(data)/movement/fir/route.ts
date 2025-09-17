import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const firNo = searchParams.get("firNo");
    const type = searchParams.get("type");
    const srNo = searchParams.get("srNo");
    const userId = searchParams.get("userId")


    try {
        const selection = {
            id: true,
            firNo: true,
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
            returnBackFrom: true,
            userId: true
        };
        if (type === 'malkhana') {
            let data;
            if (firNo) {
                data = await prisma.malkhanaEntry.findMany({
                    where: {
                        firNo, userId
                    },
                    select: selection
                });
            }
            if (srNo) {
                data = await prisma.malkhanaEntry.findMany({
                    where: {
                        srNo: parseInt(srNo), userId
                    },
                    select: selection
                });
            }

            return NextResponse.json({ success: true, data }, { status: 200 });
        }

        if (type === "seizedVehicle") {

            if (firNo) {
                const data = await prisma.seizedVehicle.findMany({
                    where: {
                        firNo, userId
                    },
                    select: selection
                });
                return NextResponse.json({ success: true, data }, { status: 200 });
            }
            if (srNo) {
                const data = await prisma.seizedVehicle.findFirst({
                    where: {
                        srNo
                    },
                    select: selection
                });
                return NextResponse.json({ success: true, data }, { status: 200 });
            }

        }

        return NextResponse.json({ success: true, message: "No data found" }, { status: 500 });



    } catch (error) {
        console.error("GET /api/firNo error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch data" },
            { status: 500 }
        );
    }
};