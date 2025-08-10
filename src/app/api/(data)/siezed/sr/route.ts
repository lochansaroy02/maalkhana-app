import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {

    const { searchParams } = new URL(req.url);
    const srNo = searchParams.get("srNo");
    try {
        const selection = {
            // movement entry
            id: true,
            userId: true
        }
        const data = await prisma.seizedVehicle.findFirst({
            where: {
                srNo
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