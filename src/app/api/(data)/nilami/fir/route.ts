import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const firNo = searchParams.get("firNo");
    const srNo = searchParams.get("srNo");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    try {
        if (!type) {
            return NextResponse.json(
                { success: false, message: "Type is required" },
                { status: 400 }
            );
        }

        const modelMap: Record<string, any> = {
            malkhana: prisma.malkhanaEntry,
            seizedVehicle: prisma.seizedVehicle,
        };

        const model = modelMap[type];
        if (!model) {
            return NextResponse.json(
                { success: false, message: "Invalid type. Use 'malkhana' or 'seizedVehicle'" },
                { status: 400 }
            );
        }

        if (!firNo && !srNo) {
            return NextResponse.json(
                { success: false, message: "Please enter FirNo or SrNo" },
                { status: 400 }
            );
        }

        // Selection updated to focus on Nilami (Auction) fields
        const selection = {
            id: true,
            firNo: true,
            srNo: true,
            caseProperty: true,
            underSection: true,
            policeStation: true,
            userId: true,
            // Nilami Specific Fields from your Schema
            isNilami: true,
            nilamiOrderedBy: true,
            nilamiValue: true,
            nilamiDate: true,
            nilamiItemName: true,
            status: true,
            description: true,
        };

        let data = null;

        // Build the query filter
        const whereClause: any = { userId };
        if (firNo) whereClause.firNo = firNo;
        // Handle srNo as Int for malkhana if necessary (based on your schema Int vs String)
        if (srNo) whereClause.srNo = type === "malkhana" ? parseInt(srNo) : srNo;

        if (firNo) {
            data = await model.findMany({
                where: whereClause,
                select: selection,
            });
        } else if (srNo) {
            data = await model.findFirst({
                where: whereClause,
                select: selection,
            });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error("GET /api/nilami error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch Nilami data" },
            { status: 500 }
        );
    }
};