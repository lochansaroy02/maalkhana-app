import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const districtId = searchParams?.get("districtId");


    if (!districtId) {
        return NextResponse.json({ success: true, data: "District Id not found" }, { status: 200 });
    }
    try {
        const entries = await prisma.malkhanaEntry.findMany({
            orderBy: { createdAt: "desc" },
            where: {
                districtId: districtId
            }
        });

        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};
