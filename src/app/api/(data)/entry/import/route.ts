import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        // Check if the body is an array for bulk insertion
        if (Array.isArray(body)) {
            if (body.length === 0) {
                return NextResponse.json({ success: false, message: "Empty array received" }, { status: 400 });
            }
            // Use Prisma's createMany for bulk insertion
            const result = await prisma.malkhanaEntry.createMany({
                data: body,
                skipDuplicates: true, // This will skip duplicate entries based on your unique fields
            });

            return NextResponse.json({ success: true, count: result.count });
        }

        // Handle a single entry (non-array body)
        // We use the spread operator to automatically handle any fields provided
        const newEntry = await prisma.malkhanaEntry.create({
            data: {
                ...body,
                dbName: "m", // A hardcoded field, if necessary
            },
        });

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        console.error("POST /api/siezed error:", error);
        return NextResponse.json({ success: false, error: "Failed to create seized vehicle entry" }, { status: 500 });
    }
};