import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {


    try {
        const { searchParams } = new URL(req.url);

        const dbName = searchParams.get("dbName");
        const firNo = searchParams.get("firNo");
        const srNo = searchParams.get("srNo");

        if (dbName === "malkhana") {
            const data = await prisma.malkhanaEntry.findMany({
                where: {
                    firNo
                }, orderBy: { createdAt: "desc" },
            })
            return NextResponse.json({ success: true, data: data }, { status: 200 });
        }
        if (dbName === "vehicle") {
            let data;
            if (firNo) {
                data = await prisma.seizedVehicle.findMany({
                    where: {
                        firNo
                    }, orderBy: { createdAt: "desc" },
                })
            }
            if (srNo) {
                data = await prisma.seizedVehicle.findMany({
                    where: {
                        firNo
                    }, orderBy: { createdAt: "desc" },
                })
            }

            return NextResponse.json({ success: true, data: data }, { status: 200 });
        }

    } catch (error) {
        console.error("GET /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch seized vehicle entries" }, { status: 500 });
    }
};


