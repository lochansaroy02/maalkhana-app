import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


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


// PUT: Update Malkhana Entry with destruction details
export const PUT = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id"); // The ID of the specific MalkhanaEntry to destroy

        if (!id) {
            return NextResponse.json({ success: false, message: "Record ID is required for updating destruction details" }, { status: 400 });
        }

        const body = await req.json();

        // Extract and format the destruction-specific data from the request body
        const {
            destroyOrderedBy,
            destroyPurpose,
            photoUrl,
            documentUrl,
            ...rest // Catch any unexpected fields
        } = body;

        // Prepare the dat  a structure for Prisma update
        const updateData: any = {
            isDestroy: true,
            status: "destroy",
            destroyOrderedBy,
            destroyPurpose,
            destroyDate: new Date().toISOString(),
            photoUrl,
            documentUrl,
        };


        const updatedEntry = await prisma.malkhanaEntry.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updatedEntry }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/destroy error:", error);
        return NextResponse.json({ success: false, error: "Failed to update destruction details" }, { status: 500 });
    }
};