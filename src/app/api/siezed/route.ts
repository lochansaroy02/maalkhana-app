import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// POST: Create a new seized vehicle entry
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const {
            srNo,
            gdNo,
            gdDate,
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
        } = body;

        const newEntry = await prisma.seizedVehicle.create({
            data: {
                srNo,
                gdNo,
                gdDate,
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
                caseProperty
            }
        });

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        console.error("POST /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to create seized vehicle entry" }, { status: 500 });
    }
};

// GET: Fetch all seized vehicle entries
export const GET = async () => {
    try {
        const entries = await prisma.seizedVehicle.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        console.error("GET /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch seized vehicle entries" }, { status: 500 });
    }
};
