
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
    const { id } = await params;
    const entry = await prisma.seizedVehicle.findUnique({
        where: { id }
    });
    return NextResponse.json(entry);
}
