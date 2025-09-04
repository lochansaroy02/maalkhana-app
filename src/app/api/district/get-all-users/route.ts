import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const districtId = searchParams?.get("districtId");


    if (!districtId) {
        return NextResponse.json({ success: true, data: "District Id not found" }, { status: 200 });
    }
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            where: {
                districtId: districtId
            },
            select: {
                id: true,
                name: true,
                email: true,
                policeStation: true,
            },
        });

        return NextResponse.json({ success: true, data: users }, { status: 200 });
    } catch (error) {
        console.error("GET /api/district error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};
