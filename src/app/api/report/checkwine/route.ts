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






        const totalWine = await prisma.malkhanaEntry.aggregate({
            _sum: {
                wine: true,
            },
            where: {
                userId: userId, // optional if filtering by user
            },
        });




        // ✅ FIXED: The response object now uses the correct keys expected by the frontend.
        return NextResponse.json({
            success: true,
            totalWine: totalWine,

        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch dashboard data' },
            { status: 500 },
        );
    }
};