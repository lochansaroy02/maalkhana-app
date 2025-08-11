import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const firNo = searchParams.get("firNo");
    const srNo = searchParams.get("srNo");

    if (!type || (!firNo && !srNo)) {
        return NextResponse.json({ success: false, message: "Type and either firNo or srNo are required." }, { status: 400 });
    }

    try {
        let record = null
        const whereConditions = [];
        if (firNo) {
            whereConditions.push({ firNo: firNo });
        }
        if (srNo) {
            whereConditions.push({ srNo: srNo });
        }

        const whereClause = {
            AND: whereConditions,
        };
        // --- END OF CORRECTION ---

        if (type === 'malkhana') {
            record = await prisma.malkhanaEntry.findFirst({
                where: whereClause,
            });
        } else if (type === 'siezed vehical') { // Note: 'siezed vehical' matches your frontend dropdown
            record = await prisma.seizedVehicle.findFirst({
                where: whereClause,
            });
        } else {
            return NextResponse.json({ success: false, message: "Invalid type specified." }, { status: 400 });
        }

        if (!record) {
            return NextResponse.json({ success: false, message: "Record not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: record }, { status: 200 });

    } catch (error) {
        console.error("GET /api/fetch-for-release error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
    }
}
