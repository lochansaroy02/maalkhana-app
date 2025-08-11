import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { name, email, password, districtId, mobileNo, policeStation, rank, role, } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: "Name, email, and password are required" },
                { status: 400 }
            );
        }



        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "District with this email already exists" },
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
    } catch (error) {
        console.error("POST /api/district error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create district" },
            { status: 500 }
        );
    }
};


export const GET = async (req: NextRequest) => {

    const { searchParams } = new URL(req.url);
    const districtId = searchParams?.get("districtId");
    if (!districtId) {
        return NextResponse.json({ success: true, data: "District Id not founc" }, { status: 200 });
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

//     try {
//         await prisma.user.deleteMany({
//             where: { id: { in: ids } },
//         });

//         return NextResponse.json({ success: true, message: "Users deleted successfully" });
//     } catch (error) {
//         console.error("DELETE /api/user error:", error);
//         return NextResponse.json({ success: false, error: "Failed to delete users" });
//     }
// }
