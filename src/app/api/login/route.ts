import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { email, password, role } = body;

        // 1. Validate that all required fields are present
        if (!email || !password || !role) {
            return NextResponse.json({ success: false, error: "Email, password, and role are required" }, { status: 400 });
        }

        let entity: any = null;
        let entityType: "district" | "policeStation";

        // 2. Find the entity (user or district) based on the provided role
        if (role === "District") {
            entity = await prisma.district.findUnique({ where: { email } });
            entityType = 'district';
        } else if (role === "Police Station") {
            entity = await prisma.user.findUnique({ where: { email } });
            entityType = 'policeStation';
        } else {
            return NextResponse.json({ success: false, error: "Invalid role specified" }, { status: 400 });
        }

        // 3. Check if the entity was found
        if (!entity) {
            return NextResponse.json({ success: false, error: "Credentials not found for the specified role" }, { status: 404 });
        }

        // 4. Compare the provided password with the stored hash
        // Note: This assumes your 'district' model also has a 'passwordHash' field.
        const isMatch = await bcrypt.compare(password, entity.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "Invalid password" }, { status: 400 });
        }

        // 5. Create a JWT token with the entity's details, including the role
        const token = jwt.sign(
            {
                id: entity.id,
                email: entity.email,
                name: entity.name,
                role: entityType, // Include the role in the token payload
            },
            process.env.JWT_TOKEN as string,
            { expiresIn: "7d" }
        );

        // 6. Construct a consistent user object to send to the frontend
        const userResponse = {
            id: entity.id,
            name: entity.name,
            email: entity.email,
            role: entityType, // Include the role in the response
           
            ...(entityType === 'policeStation' && {
                mobile: entity.mobileNo,
                rank: entity.rank,
                policeStation: entity.policeStation,
            }),
        };

        return NextResponse.json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse,
        });

    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ success: false, error: "An internal server error occurred" }, { status: 500 });
    }
};
