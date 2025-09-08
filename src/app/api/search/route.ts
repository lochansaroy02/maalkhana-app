import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const { dbName, keyword } = body;
    const userId = searchParams.get("userId");

    if (!dbName || !keyword) {
        return NextResponse.json(
            { success: false, message: "Please provide details" },
            { status: 400 }
        );
    }

    try {
        let searchData: any[] = [];

        if (dbName === "m") {
            const malkhanaSearchIn = [
                "wineType",
                "srNo",
                "gdNo",
                "gdDate",
                "underSection",
                "Year",
                "policeStation",
                "IOName",
                "vadiName",
                "HM",
                "accused",
                "firNo",
                "status",
                "entryType",
                "place",
                "boxNo",
                "courtNo",
                "courtName",
                "address",
                "fathersName",
                "mobile",
                "movePurpose",
                "moveTrackingNo",
                "name",
                "releaseItemName",
                "returnBackFrom",
                "takenOutBy",
                "caseProperty",
                "receivedBy",
                "receiverName",
                "description",
            ];


            searchData = await prisma.malkhanaEntry.findMany({
                where: {
                    userId: userId,
                    OR: malkhanaSearchIn.map((field) => ({
                        [field]: { contains: keyword, mode: "insensitive" },
                    })),
                },
            });
        }

        if (dbName === "v") {
            const seizedVehicleSearchIn = [
                "srNo",
                "gdNo",
                "underSection",
                "vehicleType",
                "colour",
                "registrationNo",
                "engineNo",
                "description",
                "status",
                "policeStation",
                "ownerName",
                "seizedBy",
                "caseProperty",
                "firNo",
                "address",
                "fathersName",
                "mobile",
                "movePurpose",
                "moveTrackingNo",
                "name",
                "receviedBy",   // (watch spelling — your schema has `recevierName` mapped)
                "releaseItemName",
                "returnBackFrom",
                "takenOutBy",
                "moveDate",
                "receivedBy",
                "receiverName", // <- mapped from recevierName
                "dbName",
            ];


            searchData = await prisma.seizedVehicle.findMany({
                where: {
                    userId,
                    OR: seizedVehicleSearchIn.map((field) => ({
                        [field]: { contains: keyword, mode: "insensitive" },
                    })),
                },
            });
        }

        return NextResponse.json({ success: true, data: searchData }, { status: 200 });
    } catch (error) {
        console.error("POST /api/search error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch entries" },
            { status: 500 }
        );
    }
};
