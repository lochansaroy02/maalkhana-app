import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {

    try {

        const totalPoliceStation = await prisma.user.count()
        const totalCash = await prisma.malkhanaEntry.aggregate({
            _sum: {
                cash: true,
            },
        });
        const totalDesiWine = await prisma.malkhanaEntry.aggregate({
            _sum: {
                wine: true,
            },
            where: {
                wineType: 'Desi',
            },
        });

        const totalAngreziWine = await prisma.malkhanaEntry.aggregate({
            _sum: {
                wine: true,
            },
            where: {
                wineType: 'Angrezi',
            },
        });
        const totalWine = await prisma.malkhanaEntry.aggregate({
            _sum: {
                wine: true,
            },
        });

        const releaseCountVehicle = await prisma.malkhanaEntry.count({
            where: {
                isRelease: true,
            }
        })
        const isMovementVehical = await prisma.malkhanaEntry.count({
            where: {
                isMovement: true,
            }
        })
        const releaseCountMalkhana = await prisma.seizedVehicle.count({
            where: {
                isRelease: true,
            }
        })
        const isMovementMalkhana = await prisma.seizedVehicle.count({
            where: {
                isMovement: true,
            },
        })

        const totalYellowItem = await prisma.malkhanaEntry.aggregate({
            _sum: {
                yellowItemPrice: true
            },
        })
        const totalMovement = isMovementMalkhana + isMovementVehical;
        const totalRelease = releaseCountMalkhana + releaseCountVehicle;

        const [
            malkhanaEntryCount,
            seizedVehicleCount,


            destroyCount,
            nilamiCount,

            returnedVehicleCount,
            returnedMalkhanaCount

        ] = await Promise.all([
            prisma.malkhanaEntry.count(),
            prisma.seizedVehicle.count(),


            prisma.malkhanaEntry.count({ where: { status: "Destroy", } }),
            prisma.malkhanaEntry.count({ where: { status: "Nilami", } }),

            prisma.seizedVehicle.count({ where: { isReturned: true, } }),
            prisma.malkhanaEntry.count({ where: { isReturned: true, } }),

        ]);


        const totalEntries = malkhanaEntryCount + seizedVehicleCount;

        // ✅ FIXED: The response object now uses the correct keys expected by the frontend.
        return NextResponse.json({
            success: true,
            breakdown: {
                totalPoliceStation: totalPoliceStation,
                totalEntries: totalEntries,

                entry: malkhanaEntryCount,
                totalReturn: returnedVehicleCount + returnedMalkhanaCount,
                movement: totalMovement,
                release: totalRelease,
                siezed: seizedVehicleCount,
                destroy: destroyCount,
                nilami: nilamiCount,
                totalCash: totalCash,
                totalYellowItems: totalYellowItem,

                desi: totalDesiWine,
                english: totalAngreziWine,
                totalWine: totalWine,

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