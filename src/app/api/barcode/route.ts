// pages/api/seized.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const dbName = searchParams.get("dbName");
        const firNo = searchParams.get("firNo");
        const srNo = searchParams.get("srNo"); // This can be optional now

        // Check for required parameters for the initial search
        if (!dbName || !firNo) {
            return NextResponse.json(
                { success: false, error: "Missing required parameters: dbName and firNo" },
                { status: 400 }
            );
        }

        let data = null;

        switch (dbName) {
            case "m":
                // If a specific srNo is provided, find that single record
                if (srNo) {
                    data = await prisma.malkhanaEntry.findFirst({
                        where: { firNo: String(firNo), srNo: String(srNo) },
                    });
                } else {
                    // Otherwise, find all entries for that firNo
                    data = await prisma.malkhanaEntry.findMany({
                        where: { firNo: String(firNo) },
                        orderBy: { createdAt: "desc" }
                    });
                }
                break;
            case "v":
                // If a specific srNo is provided, find that single record
                if (srNo) {
                    data = await prisma.seizedVehicle.findFirst({
                        where: { firNo: String(firNo), srNo: String(srNo) },
                    });
                } else {
                    // Otherwise, find all entries for that firNo
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
            // Return the data as an array for multiple results, or a single object
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
