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
            gdNo,
            gdDate,
            underSection,
            districtId,
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
                gdDate,
                districtId,
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
        const districtId = searchParams.get("id");

        if (!districtId) {
            return NextResponse.json(
                { success: false, error: "District ID is required" },
                { status: 400 }
            );
        }

        const entries = await prisma.seizedVehicle.findMany({
            where: {
                districtId,
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

