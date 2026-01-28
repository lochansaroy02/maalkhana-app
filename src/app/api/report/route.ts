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
        // 1. Run Aggregations (Sums)
        const [totalCash, totalDesiWine, totalAngreziWine, totalWine, totalYellowItem] = await Promise.all([
            prisma.malkhanaEntry.aggregate({ _sum: { cash: true }, where: { userId } }),
            prisma.malkhanaEntry.aggregate({ _sum: { wine: true }, where: { wineType: 'Desi', userId } }),
            prisma.malkhanaEntry.aggregate({ _sum: { wine: true }, where: { wineType: 'Angrezi', userId } }),
            prisma.malkhanaEntry.aggregate({ _sum: { wine: true }, where: { userId } }),
            prisma.malkhanaEntry.aggregate({ _sum: { yellowItemPrice: true }, where: { userId } }),
        ]);

        // 2. Run All Counts in Parallel
        const [
            // Malkhana Entry Counts
            malkhanaCount,
            malkhanaReleased,
            malkhanaMovement,
            malkhanaDestroy,
            malkhanaNilami,
            malkhanaReturned,

            // Seized Vehicle Counts
            vehicleCount,
            vehicleReleased,
            vehicleMovement,
            vehicleDestroy,
            vehicleNilami,
            vehicleReturned
        ] = await Promise.all([
            // Malkhana
            prisma.malkhanaEntry.count({ where: { userId } }),
            prisma.malkhanaEntry.count({ where: { isRelease: true, userId } }),
            prisma.malkhanaEntry.count({ where: { isMovement: true, userId } }),
            prisma.malkhanaEntry.count({ where: { OR: [{ isDestroy: true }, { status: "destroy" }], userId } }),
            prisma.malkhanaEntry.count({ where: { isNilami: true, userId } }),
            prisma.malkhanaEntry.count({ where: { isReturned: true, userId } }),

            // Vehicles
            prisma.seizedVehicle.count({ where: { userId } }),
            prisma.seizedVehicle.count({ where: { isRelease: true, userId } }),
            prisma.seizedVehicle.count({ where: { isMovement: true, userId } }),
            prisma.seizedVehicle.count({ where: { isDestroy: true, userId } }), // Added
            prisma.seizedVehicle.count({ where: { isNilami: true, userId } }),  // Added
            prisma.seizedVehicle.count({ where: { isReturned: true, userId } }),
        ]);

        return NextResponse.json({
            success: true,
            breakdown: {
                // Totals (Combined)
                totalEntries: malkhanaCount + vehicleCount,
                totalReturn: malkhanaReturned + vehicleReturned,
                totalMovement: malkhanaMovement + vehicleMovement,
                totalRelease: malkhanaReleased + vehicleReleased,

                // Malkhana Specific
                malkhana: {
                    total: malkhanaCount,
                    release: malkhanaReleased,
                    movement: malkhanaMovement,
                    destroy: malkhanaDestroy,
                    nilami: malkhanaNilami,
                    returned: malkhanaReturned
                },

                // Vehicle Specific
                seizedVehicle: {
                    total: vehicleCount,
                    release: vehicleReleased,
                    movement: vehicleMovement,
                    destroy: vehicleDestroy,
                    nilami: vehicleNilami,
                    returned: vehicleReturned
                },

                // Financials / Items
                totalCash: totalCash._sum.cash || 0,
                totalYellowItems: totalYellowItem._sum.yellowItemPrice || 0,
                wine: {
                    desi: totalDesiWine._sum.wine || 0,
                    english: totalAngreziWine._sum.wine || 0,
                    total: totalWine._sum.wine || 0,
                }
            },
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch dashboard data' },
            { status: 500 },
        );
    }
};