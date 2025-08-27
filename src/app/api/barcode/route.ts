// pages/api/seized.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const dbName = searchParams.get("dbName");
        const firNo = searchParams.get("firNo");
        const srNo = searchParams.get("srNo");

        let data = null;

        // Ensure all required parameters are present for a precise search
        if (!dbName || !firNo || !srNo) {
            return NextResponse.json(
                { success: false, error: "Missing required parameters: dbName, firNo, and srNo" },
                { status: 400 }
            );
        }

        switch (dbName) {
            case "m":
                data = await prisma.malkhanaEntry.findFirst({
                    where: { firNo: String(firNo), srNo: String(srNo) },
                });
                break;
            case "v":
                data = await prisma.seizedVehicle.findFirst({
                    where: { firNo: String(firNo), srNo: String(srNo) },
                });
                break;
            default:
                return NextResponse.json(
                    { success: false, error: `Invalid dbName: ${dbName}` },
                    { status: 400 }
                );
        }

        if (data) {
            return NextResponse.json({ success: true, data }, { status: 200 });
        } else {
            return NextResponse.json(
                { success: false, data: null, message: "Record not found." },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error("GET /api/siezed error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch seized entries" },
            { status: 500 }
        );
    }
}
