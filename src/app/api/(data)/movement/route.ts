// app/api/movement/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET Movement data by FIR No
export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const firNo = searchParams.get("firNo");

    if (!firNo) {
        return NextResponse.json({ success: false, message: "Please enter FIR No." }, { status: 400 });
    }

    try {
        const data = await prisma.malkhanaEntry.findUnique({
            where: { firNo },
            select: {
                id: true,
                srNo: true,
                isReturned: true,
                caseProperty: true,
                moveDate: true,
                underSection: true,
                takenOutBy: true,
                moveTrackingNo: true,
                movePurpose: true,
                name: true,
                receivedBy: true,
                returnDate: true,
                returnBackFrom: true
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
