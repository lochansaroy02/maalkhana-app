// app/api/movement/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            srNo,
            moveDate,
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
            releaseItemNam,
            photo,
            document,
        } = body;

        const newEntry = await prisma.maalkhanaRelease.create({
            data: {
                srNo,
                moveDate,
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
                releaseItemNam,
                photo,
                document,
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

export async function GET() {
    try {
        const entries = await prisma.maalkhanaRelease.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        console.error('GET /api/movement error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch entries', error },
            { status: 500 }
        );
    }
}
