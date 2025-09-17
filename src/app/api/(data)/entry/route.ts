import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



// Helper function to handle type conversion based on the schema
const convertDataTypes = (data: any) => {
    const convertedData = { ...data };

    // Fields that should be numbers (Int in Prisma schema)
    const numberFields = [
        "wine", "srNo", "gdNo", "Year", "boxNo", "cash", "yellowItemPrice"
    ];

    // Fields that should be booleans
    const booleanFields = [
        "isReturned", "isMovement", "isRelease"
    ];

    // Convert number fields
    numberFields.forEach(field => {
        if (typeof convertedData[field] === "string" && convertedData[field] !== "") {
            const parsed = parseInt(convertedData[field], 10);
            if (!isNaN(parsed)) {
                convertedData[field] = parsed;
            } else {
                // If parsing fails, set to null to match schema 'Int?'
                convertedData[field] = null;
            }
        }
    });

    // Convert boolean fields
    booleanFields.forEach(field => {
        if (typeof convertedData[field] === "string") {
            convertedData[field] = convertedData[field].toLowerCase() === "true";
        }
    });

    // Handle string conversion for 'firNo' to avoid 'null' string
    if (convertedData.firNo === null || convertedData.firNo === "null") {
        convertedData.firNo = null;
    }

    // Handle string conversion for 'releaseOrderedBy' to avoid 'null' string
    if (convertedData.releaseOrderedBy === null || convertedData.releaseOrderedBy === "null") {
        convertedData.releaseOrderedBy = null;
    }

    return convertedData;
};

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
        const { ...data } = body;

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