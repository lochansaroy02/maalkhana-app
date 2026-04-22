import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { email, password, role } = body;
        if (!email || !password || !role) {
            return NextResponse.json({ success: false, error: "Required fields missing" }, { status: 400 });
        }

        let entity: any = null;
        let entityType: "district" | "policeStation" | "asp";

        if (role === "District") {
            entity = await prisma.district.findUnique({ where: { email } });
            entityType = 'district';
        } else {
            // Both ASP and Police Station users live in the 'User' table
            entity = await prisma.user.findUnique({ where: { email } });

            // Logic to determine if it's a PS or ASP based on the dropdown selection
            if (role === "asp") {
                entityType = 'asp';
            } else {
                entityType = 'policeStation';
            }
        }

        if (!entity) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, entity.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "Invalid password" }, { status: 400 });
        }

        // Include districtId in token so ASP knows which district they oversee
        const token = jwt.sign(
            {
                id: entity.id,
                email: entity.email,
                role: entityType,
                districtId: entityType === 'district' ? entity.id : entity.districtId,
            },
            process.env.JWT_TOKEN as string,
            { expiresIn: "7d" }
        );

        const userResponse = {
            id: entity.id,
            name: entity.name,
            email: entity.email,
            role: entityType,
            districtId: entityType === 'district' ? entity.id : entity.districtId,
            ...(entityType !== 'district' && {
                policeStation: entity.policeStation,
                rank: entity.rank,
            }),
        };

        return NextResponse.json({ success: true, token, user: userResponse });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
};