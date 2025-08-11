import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (req: NextRequest) => {

    try {
        const { searchParams } = new URL(req.url);
        const districtId = searchParams?.get("id");
        if (!districtId) {
            return NextResponse.json({ success: true, data: "please pass the districtId" }, { status: 200 });
        }
        const policeStation = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            where: {
                districtId
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ success: true, data: policeStation }, { status: 200 });
    } catch (error) {
        console.error("GET /api/district error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};
