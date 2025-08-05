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
            districtId,
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
                districtId,
                srNo,
                gdNo,
                wine,
                wineType,
                photoUrl,
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
            }
        });

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        console.error("POST /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to create seized vehicle entry" }, { status: 500 });
    }
};


interface Params {
    districtId: string;
}
export const GET = async (context: { params: { districtId: string } }) => {

    try {
        const districtId = context.params?.districtId;
        const entries = await prisma.malkhanaEntry.findMany({
            where: {
                districtId
            }
        })

        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        console.error("GET /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch seized vehicle entries" }, { status: 500 });
    }
};
