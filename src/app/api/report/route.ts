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
        // Run all Prisma queries concurrently for better performance
        const [
            totals,
            malkhanaEntryCount,
            seizedVehicleCount,
            wineEntryCount,
            destroyCount,
            nilamiCount,
            returnedVehicleCount,
            returnedMalkhanaCount,
            desiWineCount,
            englishWineCount,
            movementCount
        ] = await Promise.all([
            // Get sum of wine and cash in one query
            prisma.malkhanaEntry.aggregate({
                _sum: { wine: true, cash: true, },
                where: { userId }
            }),
            // Get counts for different entry types and statuses
            prisma.malkhanaEntry.count({ where: { userId } }),
            prisma.seizedVehicle.count({ where: { userId } }),
            prisma.malkhanaEntry.count({ where: { entryType: "Wine", userId } }),
            prisma.malkhanaEntry.count({ where: { status: "Destroy", userId } }),
            prisma.malkhanaEntry.count({ where: { status: "Nilami", userId } }),
            prisma.seizedVehicle.count({ where: { isReturned: true, userId } }),
            prisma.malkhanaEntry.count({ where: { isReturned: true, userId } }),
            prisma.malkhanaEntry.count({ where: { wineType: "Desi", userId } }),
            prisma.malkhanaEntry.count({ where: { wineType: "Angrezi", userId } }),
            prisma.malkhanaEntry.count({ where: { movePurpose: { not: null }, userId } })
        ]);

        // Calculate derived totals
        const releaseCount = destroyCount + nilamiCount;
        const totalEntries = malkhanaEntryCount + seizedVehicleCount;

        // ✅ FIXED: The response object now uses the correct keys expected by the frontend.
        return NextResponse.json({
            success: true,
            total: totalEntries,
            breakdown: {
                entry: malkhanaEntryCount,
                returnVehical: returnedVehicleCount,
                returnMalkhana: returnedMalkhanaCount,
                movement: movementCount,
                release: releaseCount,
                siezed: seizedVehicleCount,
                destroy: destroyCount, // Changed from 'distroyCount'
                nilami: nilamiCount,   // Changed from 'nilamiCount'
                wine: wineEntryCount,
                totalWine: totals._sum.wine || 0,
                totalCash: totals._sum.cash || 0,
                desi: desiWineCount,
                english: englishWineCount
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