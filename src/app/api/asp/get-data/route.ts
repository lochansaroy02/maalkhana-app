import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (req: NextRequest) => {

    try {
        const entries = await prisma.malkhanaEntry.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};
