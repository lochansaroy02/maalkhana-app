import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles changing a user's password.
 * Expects a POST request with { userId, currentPassword, newPassword } in the body.
 */
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { email, newPassword } = body;

        // 1. Validate input from the request body
        if (!email || !newPassword) {
            return NextResponse.json(
                { success: false, error: "userId, currentPassword, and newPassword are required." },
                { status: 400 }
            );
        }

        // 2. Find the user in the database
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
        });

        // 3. Check if user exists and has a password set
        if (!user || !user.passwordHash) {
            return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
        }




        // 5. Hash the 'newPassword' before saving it
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // 6. Update the user's password in the database
        await prisma.user.update({
            where: { email: email },
            data: { passwordHash: newPasswordHash },
        });

        return NextResponse.json({ success: true, message: "Password updated successfully." }, { status: 200 });

    } catch (error) {
        console.error("CHANGE PASSWORD ERROR:", error);
        return NextResponse.json(
            { success: false, error: "An internal server error occurred." },
            { status: 500 }
        );
    }
};

