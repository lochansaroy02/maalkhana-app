import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const firNo = searchParams.get("firNo");


    if (!firNo) {
        return NextResponse.json({ success: false, message: "Please enter FirNo." }, { status: 200 });
    }

    try {

        if (type === "entry") {
            const entryData = await prisma.malkhanaEntry.findMany({
                where: { firNo }
            })
            return NextResponse.json({ success: true, data: entryData }, { status: 200 });
        } else if (type === "movement") {
            const movmentData = await prisma.malkhanaMovement.findMany({
                where: { firNo }
            })
            return NextResponse.json({ success: true, data: movmentData }, { status: 200 });

        } else if (type === "release") {
            const releaseData = await prisma.malkhanaRelease.findMany({
                where: { firNo }
            })
            return NextResponse.json({ success: true, data: releaseData }, { status: 200 });

        } else if (type === "seized") {
            const seizedData = await prisma.seizedVehicle.findMany({
                where: { firNo }
            })
            return NextResponse.json({ success: true, data: seizedData }, { status: 200 });

        }
        return NextResponse.json({ success: true, data: [] }, { status: 500 });

    } catch (error) {
        console.error("GET /api/firNo error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};