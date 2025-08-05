// app/api/movement/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();


        if (Array.isArray(body)) {
            if (body.length === 0) {
                return NextResponse.json({ success: false, message: "Empty array received" }, { status: 400 });
            }

            const result = await prisma.seizedVehicle.createMany({
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
            photo,
            document,
            isReturned,
            receviedBy,
            returnBackFrom,
            returnDate,
        } = body;

        const newEntry = await prisma.malkhanaMovement.create({
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
                photo,
                document,
                isReturned,
                receviedBy,
                returnBackFrom,
                returnDate,
            },

        });

        return NextResponse.json({ success: true, data: newEntry });
    } catch (error) {
        console.error('POST /api/movement error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create entry', error },
            { status: 500 }
        );
    }
}

interface DistrictParams {
    districtId: string;
}

export async function GET(context: { params: { districtId: string } }) {
    const districtId = context.params?.districtId;
    try {

        const entries = await prisma.malkhanaMovement.findMany({
            where: {
                districtId
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        console.error('GET /api/movement error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch entries', error },
            { status: 500 }
        );
    }
}
