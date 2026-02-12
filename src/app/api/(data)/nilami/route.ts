
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// UPDATE Movement data
export const PUT = async (req: NextRequest) => {
    try {

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type"); // 'malkhana' or 'seizedVehicle'



        if (!id) {
            return NextResponse.json({ success: false, message: "FIR No. is required" }, { status: 400 });
        }
        const body = await req.json();
        const { ...nilamiData } = body;
        let updatedData;
        if (type == 'malkhana') {
            updatedData = await prisma.malkhanaEntry.update({
                where: { id },
                data: nilamiData,
            });
        } else if (type === 'seizedVehicle') {
            updatedData = await prisma.seizedVehicle.update({
                where: { id },
                data: nilamiData,
            });
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid type provided" },
                { status: 400 }
            );
        }
        return NextResponse.json({ success: true, data: updatedData }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/movement error:", error);
        return NextResponse.json({ success: false, error: "Failed to update data" }, { status: 500 });
    }
};
