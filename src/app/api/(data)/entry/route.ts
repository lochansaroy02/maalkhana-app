import { prisma } from "@/lib/prisma";
import { convertMalkhanaDataTypes } from "@/utils/entryDataTypes";
import { NextRequest, NextResponse } from "next/server";



// Shared with the movement PUT handler.
const convertDataTypes = convertMalkhanaDataTypes;

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        if (Array.isArray(body)) {
            if (body.length === 0) {
                return NextResponse.json({ success: false, message: "Empty array received" }, { status: 400 });
            }

            // --- Apply type conversion and remove 'id' for each object ---
            const dataToInsert = body.map(item => {
                const cleanedItem = convertDataTypes(item);
                delete cleanedItem.id;
                return cleanedItem;
            });
            // -------------------------------------------------------------

            const result = await prisma.malkhanaEntry.createMany({
                data: dataToInsert,
                skipDuplicates: true,
            });

            return NextResponse.json({ success: true, count: result.count }, { status: 201 });
        }

        // Single entry logic: Apply type conversion to the single object
        const convertedBody = convertDataTypes(body);

        // Destructure the converted object for Prisma insertion
        const newEntry = await prisma.malkhanaEntry.create({
            data: {
                ...convertedBody,
                dbName: "m",
                // Remove 'id' if present to avoid Prisma error on create
                ...(convertedBody.id && { id: undefined }),
            }
        });

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        console.error("POST /api/entry error:", error);
        return NextResponse.json({ success: false, error: "Failed to create entry" }, { status: 500 });
    }
};
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

export const PUT = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await req.json();
        // Drop the id so a stray id in the body can never rewrite the primary key.
        const { id: _ignoredId, ...rest } = body;
        const data = convertMalkhanaDataTypes(rest);

        if (!id) {
            return NextResponse.json({ success: false, message: "FIR No. is required" }, { status: 400 });
        }

        const updatedEntry = await prisma.malkhanaEntry.update({
            where: { id },
            data: data
        });

        return NextResponse.json({ success: true, data: updatedEntry }, { status: 200 });
    } catch (error) {
        console.error("Error while updating the data :", error);
        return NextResponse.json({ success: false, error: "Failed to update data" }, { status: 500 });
    }
};