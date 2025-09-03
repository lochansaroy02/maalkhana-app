import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const firNo = searchParams.get("firNo");
    const type = searchParams.get("type");
    const srNo = searchParams.get("srNo");
    const userId = searchParams.get("userId");



    try {
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
            mobile: true,
            releaseItemName: true,
            userId: true
        };

        if (type === 'malkhana') {

            if (!firNo) {
                return NextResponse.json({ success: true, message: "please enter FirNo." }, { status: 200 });
            }
            const data = await prisma.malkhanaEntry.findMany({
                where: {
                    firNo, userId
                },
                select: selection
            });
            return NextResponse.json({ success: true, data }, { status: 200 });
        }

        if (type === "seizedVehicle") {
            if (!firNo && !srNo) {
                return NextResponse.json({ success: true, message: "please enter FirNo." }, { status: 200 });
            }

            if (firNo) {
                const data = await prisma.seizedVehicle.findMany({
                    where: {
                        firNo,
                        userId
                    },
                    select: selection
                });
                return NextResponse.json({ success: true, data }, { status: 200 });
            }
            if (srNo) {
                const data = await prisma.seizedVehicle.findFirst({
                    where: {
                        srNo, userId
                    },
                    select: selection
                });
                return NextResponse.json({ success: true, data }, { status: 200 });
            }

        }
        return NextResponse.json({ success: false, message: "no data sent" }, { status: 200 });



    } catch (error) {
        console.error("GET /api/firNo error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch data" },
            { status: 500 }
        );
    }
};
