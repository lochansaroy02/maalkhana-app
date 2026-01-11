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
            courtName,

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

// UPDATE Movement data
export const PUT = async (req: NextRequest) => {
    try {

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type")
        const body = await req.json();
        const { ...movementData } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "FIR No. is required" }, { status: 400 });
        }

        const updatedEntry = await prisma.malkhanaEntry.update({

            where: { id },
            data: movementData
        });

        return NextResponse.json({ success: true, data: updatedEntry }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/movement error:", error);
        return NextResponse.json({ success: false, error: "Failed to update data" }, { status: 500 });
    }
};
