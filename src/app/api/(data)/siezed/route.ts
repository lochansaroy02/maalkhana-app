import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        // ✅ Handle bulk import
        if (Array.isArray(body)) {
            if (body.length === 0) {
                return NextResponse.json({ success: false, message: "Empty array received" }, { status: 400 });
            }

            const result = await prisma.seizedVehicle.createMany({
                data: body,
                skipDuplicates: true,
            });

            return NextResponse.json({ success: true, count: result.count });
        }

        // ✅ Handle single object
        const {
            srNo,
            firNo,
            gdNo,
            gdDate,
            underSection,
            userId,
            vehicleType,
            colour,
            registrationNo,
            engineNo,
            description,
            status,
            policeStation,
            ownerName,
            seizedBy,
            caseProperty,
        } = body;

        const newEntry = await prisma.seizedVehicle.create({
            data: {
                srNo,
                gdNo,
                firNo,
                gdDate,
                userId,
                underSection,
                vehicleType,
                colour,
                registrationNo,
                engineNo,
                description,
                status,
                policeStation,
                ownerName,
                seizedBy,
                caseProperty,
                dbName: "vehicle"
            },
        });

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        console.error("POST /api/siezed error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create seized vehicle entry" },
            { status: 500 }
        );
    }
};

// GET: Fetch all seized vehicle entries

interface Params {
    districtId: string;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "District ID is required" },
                { status: 400 }
            );
        }

        const entries = await prisma.seizedVehicle.findMany({
            where: {
                userId,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        console.error("GET /api/siezed/[districtId] error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch seized vehicle entries" },
            { status: 500 }
        );
    }



};



export const PUT = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await req.json();
        const { ...data } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "FIR No. is required" }, { status: 400 });
        }

        const updatedEntry = await prisma.seizedVehicle.update({
            where: { id },
            data: data
        });

        return NextResponse.json({ success: true, data: updatedEntry }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/movement error:", error);
        return NextResponse.json({ success: false, error: "Failed to update data" }, { status: 500 });
    }
};