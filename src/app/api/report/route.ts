import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {

    try {


        const totalWine = await prisma.maalkhanaEntry.aggregate({
            _sum: {
                wine: true,
            },
        });
        const [entry, movement, release, siezed, wineCount, destroy, nilami] = await Promise.all([
            prisma.maalkhanaEntry.count(),
            prisma.maalkhanaMovement.count(),
            prisma.maalkhanaRelease.count(),
            prisma.seizedVehicle.count(),


            prisma.maalkhanaEntry.count({
                where: { entryType: "Wine" }
            }),
            prisma.maalkhanaEntry.count({
                where: { status: "Destroy" }
            }),
            prisma.maalkhanaEntry.count({
                where: { status: "Nilami" }
            })

        ]);

        const total = entry + movement + release + siezed;

        return NextResponse.json({
            total,
            breakdown: {
                entry: entry,
                movement: movement,
                release: release,
                siezed: siezed,
                wine: wineCount,
                nilami: nilami,
                destroy: destroy,
                wineCount: totalWine
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
