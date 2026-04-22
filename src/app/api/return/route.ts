import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {

    const { searchParams } = new URL(req.url);
    const userId = searchParams?.get("userId");
    if (!userId) {
        return NextResponse.json({ success: true, data: "District Id not founc" }, { status: 200 });
    }



    try {
        const users = await prisma.malkhanaEntry.findMany({

            orderBy: { createdAt: "desc" },
            where: {
                userId, isReturned: true
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