import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({
            success: false, message: "Please provide a userId"
        }, { status: 400 });
    }

    try {






        const totalDistroy = await prisma.malkhanaEntry.findMany({
            where: {
                firNo: "188/23",
                userId
            }
        })




        // ✅ FIXED: The response object now uses the correct keys expected by the frontend.
        return NextResponse.json({
            success: true,
            totalWine: totalDistroy,

        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch dashboard data' },
            { status: 500 },
        );
    }
};