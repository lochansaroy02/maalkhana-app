// pages/api/seized.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const dbName = searchParams.get("dbName");
        const firNo = searchParams.get("firNo");
        const srNo = searchParams.get("srNo");
        const userId = searchParams.get("userId");

        // Licensed-weapon and unclaimed entries have no FIR; their labels encode
        // "m--<srNo>", so an empty firNo is allowed when srNo is present.
        if (!dbName || !userId || (!firNo && !srNo)) {
            return NextResponse.json(
                { success: false, error: "Missing required parameters: userID , dbName and firNo or srNo" },
                { status: 400 }
            );
        }
        const firFilter = firNo ? { firNo: String(firNo) } : { OR: [{ firNo: null }, { firNo: "" }] };

        let data = null;

        switch (dbName) {
            case "m":
                if (srNo && srNo.length > 0) {
                    data = await prisma.malkhanaEntry.findMany({
                        where: {
                            ...firFilter, srNo: Number(srNo),
                            userId
                        },
                    });
                } else {
                    data = await prisma.malkhanaEntry.findMany({
                        where: {
                            firNo: String(firNo),
                            userId: userId
                        },
                        orderBy: { createdAt: "desc" }
                    });
                }
                break;
            case "v":
                if (srNo) {
                    data = await prisma.seizedVehicle.findFirst({
                        where: { firNo: String(firNo), srNo: String(srNo) },
                    });
                } else {
                    data = await prisma.seizedVehicle.findMany({
                        where: { firNo: String(firNo) },
                        orderBy: { createdAt: "desc" }
                    });
                }
                break;
            default:
                return NextResponse.json(
                    { success: false, error: `Invalid dbName: ${dbName}` },
                    { status: 400 }
                );
        }

        if (data && (Array.isArray(data) ? data.length > 0 : data)) {
            return NextResponse.json({ success: true, data }, { status: 200 });
        } else {
            return NextResponse.json(
                { success: false, data: null, message: "Record(s) not found." },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error("GET /api/seized error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch seized entries" },
            { status: 500 }
        );
    }
}
