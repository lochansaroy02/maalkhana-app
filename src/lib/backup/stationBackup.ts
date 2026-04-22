// lib/stationBackup.ts
import { prisma } from "@/lib/prisma";


export async function generateStationBackup(userId: string | undefined) {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    const entries = await prisma.malkhanaEntry.findMany({
        where: {
            userId: userId || undefined
        }, orderBy: { createdAt: "desc" },
    })

    const vehicles = await prisma.seizedVehicle.findMany({
        where: {
            userId: userId || undefined
        }, orderBy: { createdAt: "desc" },
    })

    if (!user) throw new Error("User not found");
    const backup = {
        metadata: {
            userId: user.id,
            policeStation: user.policeStation,
            createdAt: new Date().toISOString(),
        },
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            policeStation: user.policeStation,
            rank: user.rank,
            role: user.role,
            mobileNo: user.mobileNo,
        },
        vehicleData: vehicles,
        entryData: entries,
    };


    console.log(backup)
    return JSON.stringify(backup, null, 2);
}
