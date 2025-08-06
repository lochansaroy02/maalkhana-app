import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();

        await prisma.malkhanaMovement.deleteMany({
            where: {
                id: { in: ids },
            },
        });

        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
