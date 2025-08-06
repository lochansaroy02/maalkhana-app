import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// POST /api/district — Create new district
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        // Check if district already exists
        const existing = await prisma.district.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "District with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        const newDistrict = await prisma.district.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });
        return NextResponse.json({ success: true, data: newDistrict }, { status: 201 });
    } catch (error) {
        console.error("POST /api/district error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create district" },
            { status: 500 }
        );
    }
};

export const GET = async () => {
    try {
        const districts = await prisma.district.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }, // exclude passwordHash
        });

        return NextResponse.json({ success: true, data: districts }, { status: 200 });
    } catch (error) {
        console.error("GET /api/district error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};
