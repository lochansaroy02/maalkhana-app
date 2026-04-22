

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest) => {

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");


    try {
        const data = await prisma.malkhanaEntry.updateMany({
            data: {
                srNo: 1
            },
            where: {
                userId: userId
            },
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