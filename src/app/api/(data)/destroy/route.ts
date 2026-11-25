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


// PUT: Mark a Malkhana entry or seized vehicle as destroyed.
//   ?id=<record id>&type=malkhana|seizedVehicle (default malkhana)
// Destroy photo/document go into the destroy* columns; the item's own
// photoUrl/documentUrl are never touched.
export const PUT = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type") || "malkhana";

        if (!id) {
            return NextResponse.json({ success: false, message: "Record ID is required for updating destruction details" }, { status: 400 });
        }
        if (type !== "malkhana" && type !== "seizedVehicle") {
            return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
        }

        const body = await req.json();
        const { destroyOrderedBy, destroyPurpose } = body;
        // Accept the new names and the old ones the page used to send.
        const photo = body.destroyPhotoUrl || body.photoUrl || undefined;
        const document = body.destroyDocumentUrl || body.documentUrl || undefined;

        const common = {
            isDestroy: true,
            status: "destroy",
            destroyOrderedBy,
            destroyPurpose,
            destroyDate: new Date(),
            ...(photo && { destroyPhotoUrl: photo }),
        };

        const updatedEntry = type === "seizedVehicle"
            ? await prisma.seizedVehicle.update({
                where: { id },
                data: { ...common, ...(document && { destroyDocUrl: document }) },
            })
            : await prisma.malkhanaEntry.update({
                where: { id },
                data: { ...common, ...(document && { destroyDocumentUrl: document }) },
            });

        return NextResponse.json({ success: true, data: updatedEntry }, { status: 200 });
    } catch (error: any) {
        console.error("PUT /api/destroy error:", error);
        if (error?.code === "P2025") {
            return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
        }
        return NextResponse.json({ success: false, error: "Failed to update destruction details" }, { status: 500 });
    }
};
