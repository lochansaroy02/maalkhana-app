import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// POST /api/district — Create new district
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Name, email, and password are required" },
                { status: 400 }
            );
        }
        const newPass = "baghpatAdmin123"

        // Check if district already exists
        const existing = await prisma.district.findUnique({ where: { email } });
        if (!existing) {
            return NextResponse.json(
                { success: false, error: "District with this email doenst exists" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(newPass, 10);

        const newDistrict = await prisma.district.update({
            data: {

                passwordHash: passwordHash,
            },
            where: {
                email: email
            }
        });
        return NextResponse.json({ success: true, message: "password reset" }, { status: 201 });
    } catch (error) {
        console.error("POST /api/district error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create district" },
            { status: 500 }
        );
    }
};