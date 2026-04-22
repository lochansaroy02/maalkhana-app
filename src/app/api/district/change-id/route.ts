import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const PUT = async (req: NextRequest) => {
    const body = await req.json();
    const { id } = body;


    if (!id) {
        return NextResponse.json({ success: true, data: "District Id not found" }, { status: 200 });
    }
    try {
        const users = await prisma.user.updateMany({
            data: {
                districtId: id
            }
        });

        return NextResponse.json({ success: true, data: users }, { status: 200 });
    } catch (error) {
        console.error("GET /api/district error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};
