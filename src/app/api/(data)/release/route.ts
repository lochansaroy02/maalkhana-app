// app/api/movement/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (Array.isArray(body)) {
            if (body.length === 0) {
                return NextResponse.json({ success: false, message: "Empty array received" }, { status: 400 });
            }
            const result = await prisma.malkhanaRelease.createMany({
                data: body,
                skipDuplicates: true,
            });

            return NextResponse.json({ success: true, count: result.count });
        }

        const {
            srNo,
            moveDate,
            districtId,
            firNo,
            underSection,
            takenOutBy,
            moveTrackingNo,
            movePurpose,
            name,
            recevierName,
            fathersName,
            address,
            mobile,
            releaseItemName,
            photo,
            document,
        } = body;

        const newEntry = await prisma.malkhanaRelease.create({
            data: {
                srNo,
                moveDate,
                districtId,
                firNo,
                underSection,
                takenOutBy,
                moveTrackingNo,
                movePurpose,
                name,
                recevierName,
                fathersName,
                address,
                mobile,
                releaseItemName,
                photo,
                document,
            },

        });

        return NextResponse.json({ success: true, data: newEntry });
    } catch (error) {
        console.error('POST /api/relase error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create entry', error },
            { status: 500 }
        );
    }
}

interface DistrictParams {
    districtId: string;
}

export async function GET(req: NextRequest) {

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "District ID is required" },
                { status: 400 }
            );
        }
        const entries = await prisma.malkhanaRelease.findMany({
            where: {
                userId
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        console.error('GET  error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch entries', error },
            { status: 500 }
        );
    }
}
