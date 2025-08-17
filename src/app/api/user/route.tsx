import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        // Check if the request is for bulk user creation (body is an array)
        if (Array.isArray(body)) {
            const users = body;

            if (users.length === 0) {
                return NextResponse.json(
                    { success: false, error: "The user array cannot be empty." },
                    { status: 400 }
                );
            }

            // Step 1: Validate all users in the array for required fields
            for (const user of users) {
                if (!user.name || !user.email || !user.password) {
                    return NextResponse.json(
                        { success: false, error: `A user object is missing required fields (name, email, password).` },
                        { status: 400 }
                    );
                }
            }

            // Step 2: Efficiently check for any existing emails in a single query
            const emails = users.map(user => user.email);
            const existingUsers = await prisma.user.findMany({
                where: { email: { in: emails } },
                select: { email: true }
            });

            if (existingUsers.length > 0) {
                const existingEmails = existingUsers.map(user => user.email);
                return NextResponse.json(
                    { success: false, error: `Users with these emails already exist: ${existingEmails.join(", ")}` },
                    { status: 409 } // 409 Conflict status
                );
            }

            // Step 3: Hash all passwords in parallel and prepare data for creation
            const usersToCreate = await Promise.all(
                users.map(async (user) => {
                    const passwordHash = await bcrypt.hash(user.password, 10);
                    return {
                        ...user,
                        passwordHash,
                        password: undefined, // ensure plain password is not stored
                    };
                })
            );

            // Step 4: Create all users in a single database transaction
            const result = await prisma.user.createMany({
                data: usersToCreate,
                skipDuplicates: true, // As an extra safeguard
            });

            return NextResponse.json(
                { success: true, message: `${result.count} users created successfully.` },
                { status: 201 }
            );

        } else {
            // Original logic for creating a single user
            const { name, email, password, districtId, mobileNo, policeStation, rank, role } = body;

            if (!name || !email || !password) {
                return NextResponse.json(
                    { success: false, error: "Name, email, and password are required" },
                    { status: 400 }
                );
            }

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return NextResponse.json(
                    { success: false, error: "A user with this email already exists" },
                    { status: 409 }
                );
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    mobileNo,
                    policeStation,
                    rank,
                    role,
                    passwordHash,
                    districtId
                },
            });
            return NextResponse.json({ success: true, data: newUser }, { status: 201 });
        }
    } catch (error) {
        console.error("POST /api/user error:", error);
        return NextResponse.json(
            { success: false, error: "An unexpected error occurred while creating user(s)." },
            { status: 500 }
        );
    }
};


export const GET = async (req: NextRequest) => {

    const { searchParams } = new URL(req.url);
    const districtId = searchParams?.get("districtId");
    if (!districtId) {
        return NextResponse.json({ success: true, data: "District Id not found" }, { status: 200 });
    }
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            where: { districtId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                mobileNo: true,
                rank: true,
                policeStation: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ success: true, data: users }, { status: 200 });
    } catch (error) {
        console.error("GET /api/district error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch districts" },
            { status: 500 }
        );
    }
};


// export const DELETE = async (req: NextRequest, res: NextResponse) => {
//     const body = await req.json()
//     const { ids } = body
//     if (!Array.isArray(ids) || ids.length === 0) {
//         return NextResponse.json({ success: false, error: "Invalid user IDs" });
//     }
//
//     try {
//         await prisma.user.deleteMany({
//             where: { id: { in: ids } },
//         });
//
//         return NextResponse.json({ success: true, message: "Users deleted successfully" });
//     } catch (error) {
//         console.error("DELETE /api/user error:", error);
//         return NextResponse.json({ success: false, error: "Failed to delete users" });
//     }
// }