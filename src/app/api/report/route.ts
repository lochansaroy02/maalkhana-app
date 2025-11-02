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




        const totalCash = await prisma.malkhanaEntry.aggregate({
            _sum: {
                cash: true,
            },
            where: {
                userId: userId, // optional if filtering by user
            },
        });
        const totalDesiWine = await prisma.malkhanaEntry.aggregate({
            _sum: {
                wine: true,
            },
            where: {
                wineType: 'Desi',
                userId: userId, // optional if filtering by user
            },
        });

        const totalAngreziWine = await prisma.malkhanaEntry.aggregate({
            _sum: {
                wine: true,
            },
            where: {
                wineType: 'Angrezi',
                userId: userId,
                // optional if filtering by user
            },
        });
        const totalWine = await prisma.malkhanaEntry.aggregate({
            _sum: {
                wine: true,
            },
            where: {
                userId: userId,
            },
        });

        const releaseCountVehicle = await prisma.malkhanaEntry.count({
            where: {
                isRelease: true,
                userId: userId
            }
        })
        const isMovementVehical = await prisma.malkhanaEntry.count({
            where: {
                isMovement: true,
                userId: userId
            }
        })
        const releaseCountMalkhana = await prisma.seizedVehicle.count({
            where: {
                isRelease: true,
                userId: userId
            }
        })
        const isMovementMalkhana = await prisma.seizedVehicle.count({
            where: {
                isMovement: true,
                userId: userId
            },
        })

        const totalYellowItem = await prisma.malkhanaEntry.aggregate({
            _sum: {
                yellowItemPrice: true
            },
            where: {
                userId
            }
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
            prisma.malkhanaEntry.count({ where: { userId } }),
            prisma.seizedVehicle.count({ where: { userId } }),


            prisma.malkhanaEntry.count({ where: { status: "Destroy", userId } }),
            prisma.malkhanaEntry.count({ where: { status: "Nilami", userId } }),

            prisma.seizedVehicle.count({ where: { isReturned: true, userId } }),
            prisma.malkhanaEntry.count({ where: { isReturned: true, userId } }),

        ]);


        const totalEntries = malkhanaEntryCount + seizedVehicleCount;

        // ✅ FIXED: The response object now uses the correct keys expected by the frontend.
        return NextResponse.json({
            success: true,
            breakdown: {

                totalEntries: totalEntries,
                entry: malkhanaEntryCount,
                totalReturn: returnedVehicleCount + returnedMalkhanaCount,
                movement: totalMovement,
                malkhanaMovement: isMovementMalkhana,
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