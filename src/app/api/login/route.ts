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
        const existedPolice = await prisma.user.findUnique({ where: { email } })

        const user = existedDistrict || existedPolice
        const role = existedDistrict ? "district" : "police"

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(password, user?.passwordHash)
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "Invalid Password" }, { status: 400 });

        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name
            },
            //here is the errror
            process.env.JWT_TOKEN as string,
            { expiresIn: "7d" }

        )

        return NextResponse.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role
            }
        });
    } catch (error) {

    }
}