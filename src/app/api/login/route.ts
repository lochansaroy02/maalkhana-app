import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest) => {
    const body = await req.json()
    const { email, password } = body;

    try {

        if (!email || !password) {
            return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
        }

        const existedDistrict = await prisma.district.findUnique({
            where: {
                email
            }
        })

        if (!existedDistrict) {
            return NextResponse.json({ success: false, error: "User Not Found" }, { status: 400 });

        }

        const isMatch = await bcrypt.compare(password, existedDistrict.passwordHash)
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "Invalid Password" }, { status: 400 });

        }

        const token = jwt.sign(
            {
                districtId: existedDistrict.id,
                email: existedDistrict.email,
                name: existedDistrict.name
            },
            //here is the errror
            process.env.JWT_TOKEN as string,
            { expiresIn: "7d" }

        )

        return NextResponse.json({
            success: true,
            message: "Login successful",
            token,
            district: {
                id: existedDistrict.id,
                name: existedDistrict.name,
                email: existedDistrict.email
            }
        });
    } catch (error) {

    }
}