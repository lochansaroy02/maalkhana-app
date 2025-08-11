import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({
            success: false, message: "please enter userId"
        })
    }
    try {
        const totalWine = await prisma.malkhanaEntry.aggregate({
            _sum: {
                wine: true,
            }, where: {
                userId
            }
        });
        const totalCash = await prisma.malkhanaEntry.aggregate({
            _sum: {
                cash: true
            },
            where: {
                userId
            }
        })
        const [entry, movement, release, siezed, wineCount, returnVehical, returnMalkhana, english, desi] = await Promise.all([
            prisma.malkhanaEntry.count(
                {
                    where: {
                        userId
                    }
                }
            ),
            prisma.seizedVehicle.count(
                {
                    where: {
                        userId
                    }
                }
            ),
            prisma.malkhanaEntry.count({
                where: { entryType: "Wine", userId }
            }),
            prisma.malkhanaEntry.count({
                where: { status: "Destroy", userId }
            }),
            prisma.malkhanaEntry.count({
                where: { status: "Nilami", userId }
            }),
            prisma.seizedVehicle.count({
                where: { isReturned: true, userId }
            }),
            prisma.malkhanaEntry.count({
                where: { isReturned: true, userId }
            }),
            prisma.malkhanaEntry.count({
                where: { wineType: "Desi", userId }
            }),
            prisma.malkhanaEntry.count({
                where: { wineType: "Angrezi", userId }
            }),
        ]);
        const total = entry + movement + release + siezed;
        return NextResponse.json({
            total,
            breakdown: {
                entry: entry,
                returnVehical: returnVehical,
                returnMalkhana: returnMalkhana,
                movement: movement,
                release: release,
                siezed: siezed,
                wine: wineCount,
                wineCount: totalWine,
                totalCash: totalCash,
                desi: desi,
                english: english
            },
        });
    } catch (error) {
        console.error('Error fetching total entries:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch entries' },
            { status: 500 },
        );
    }
};
