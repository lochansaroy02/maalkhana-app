import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const {
            srNo,
            gdNo,
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

        const newEntry = await prisma.maalkhanaEntry.create({
            data: {
                srNo,
                gdNo,
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

export const GET = async () => {
    try {
        const entries = await prisma.maalkhanaEntry.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        console.error("GET /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch seized vehicle entries" }, { status: 500 });
    }
};
