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
            description,
            firNo,
            status,
            entryType,
            isRelease,
            isMovement,
            place,
            boxNo,
            courtNo,
            courtName,
            yellowItemPrice,
            releaseOrderedBy
        } = body;

        const newEntry = await prisma.malkhanaEntry.create({
            data: {
                userId,
                cash,
                srNo,
                gdNo,
                wine,
                description,
                isMovement,
                isRelease,
                yellowItemPrice,
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
                courtName,
                releaseOrderedBy,
                dbName: "m"
            }
        });

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        console.error("POST /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to create seized vehicle entry" }, { status: 500 });
    }
};


export async function GET(req: NextRequest) {

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");
        const entries = await prisma.malkhanaEntry.findMany({
            where: {
                userId
            }, orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        console.error("GET /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch seized vehicle entries" }, { status: 500 });
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

        const updatedEntry = await prisma.malkhanaEntry.update({
            where: { id },
            data: data
        });

        return NextResponse.json({ success: true, data: updatedEntry }, { status: 200 });
    } catch (error) {
        console.error("Error while updating the data :", error);
        return NextResponse.json({ success: false, error: "Failed to update data" }, { status: 500 });
    }
};