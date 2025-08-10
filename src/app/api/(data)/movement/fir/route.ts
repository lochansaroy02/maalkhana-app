import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const firNo = searchParams.get("firNo") || undefined;
    const type = searchParams.get("type");
    const srNo = searchParams.get("srNo") || undefined;


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
            const data = await prisma.malkhanaEntry.findUnique({
                where: {
                    firNo
                },
                select: selection
            });
            return NextResponse.json({ success: true, data }, { status: 200 });
        }

        if (type === "siezed vehical") {

            if (firNo) {
                const data = await prisma.seizedVehicle.findUnique({
                    where: {
                        srNo
                    },
                    select: selection
                });
                return NextResponse.json({ success: true, data }, { status: 200 });
            }
            if (srNo) {
                const data = await prisma.seizedVehicle.findUnique({
                    where: {
                        srNo
                    },
                    select: selection
                });
                return NextResponse.json({ success: true, data }, { status: 200 });
            }

        }


    } catch (error) {
        console.error("GET /api/firNo error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch data" },
            { status: 500 }
        );
    }
};
