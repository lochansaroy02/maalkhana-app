import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
    

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");
        const entries = await prisma.malkhanaEntry.findMany({
            where: {
                userId
            }, orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ success: true, data: entries }, { status: 200 });
    } catch (error) {
        console.error("GET /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch seized vehicle entries" }, { status: 500 });
    }
};


