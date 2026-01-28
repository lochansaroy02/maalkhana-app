// app/api/movement/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";




export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        if (Array.isArray(body)) {
            if (body.length === 0) {
                return NextResponse.json({ success: false, message: "Empty array received" }, { status: 400 });
            }
            const result = await prisma.malkhanaEntry.createMany({
                data: body,
                skipDuplicates: true,
            });

            return NextResponse.json({ success: true, count: result.count });
        }

        const {
            userId,
            cash,
            caseProperty,
            srNo,
            photoUrl,
            gdNo,
            wine,
            wineType,
            policeStation,
            gdDate,
            underSection,
            Year,
            IOName,
            vadiName,
            HM,
            accused,
            firNo,
            status,
            entryType,
            place,
            boxNo,
            courtNo,
            courtName
        } = body;

        const newEntry = await prisma.malkhanaEntry.create({
            data: {
                userId,
                cash,
                srNo,
                gdNo,
                wine,
                wineType,
                photoUrl,
                policeStation,
                caseProperty,
                gdDate,
                underSection,
                Year,
                IOName,
                vadiName,
                HM,
                accused,
                firNo,
                status,
                entryType,
                place,
                boxNo,
                courtNo,
                courtName
            }
        });

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        console.error("POST /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to create seized vehicle entry" }, { status: 500 });
    }
};


export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const firNo = searchParams.get("firNo");

    if (!firNo) {
        return NextResponse.json({ success: false, message: "Please enter FIR No." }, { status: 400 });
    }
    try {
        const data = await prisma.malkhanaEntry.findMany({
            where: { firNo },
            select: {
                id: true,
                srNo: true,
            }
        });

        if (!data) {
            return NextResponse.json({ success: false, message: "No record found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error("GET /api/movement error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
    }
};

export const PUT = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type"); // 'malkhana' or 'seizedVehicle'

        if (!id) {
            return NextResponse.json(
                { success: false, message: "ID is required" },
                { status: 400 }
            );
        }

        const body = await req.json();

        // We extract the data. Using a spread here allows the frontend to 
        // send fields like isRelease, releaseDate, etc., dynamically.
        const updateData = { ...body };

        let updatedEntry;

        if (type === 'malkhana') {
            updatedEntry = await prisma.malkhanaEntry.update({
                where: { id },
                data: updateData,
            });
        } else if (type === 'seizedVehicle') {
            updatedEntry = await prisma.seizedVehicle.update({
                where: { id },
                data: updateData,
            });
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid type provided" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Entry updated successfully",
            data: updatedEntry
        }, { status: 200 });

    } catch (error: any) {
        console.error("PUT /api/movement error:", error);

        // Specific handling for Prisma record not found
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: "Record not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to update data" },
            { status: 500 }
        );
    }
};