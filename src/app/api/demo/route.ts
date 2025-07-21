import { PrismaClient } from "@/generated/prisma"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

// POST: Create a new record in Demo table
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const {
            gdNo,
            policeStation,
            vadiName,
            accusedName,
            underSection,
            status,
            place
        } = body

        const newDemo = await prisma.demo.create({
            data: {
                gdNo,
                policeStation,
                vadiName,
                accusedName,
                underSection,
                status,
                place
            }
        })

        return NextResponse.json({ success: true, data: newDemo }, { status: 201 })
    } catch (error) {
        console.error("POST /api/demo error:", error)
        return NextResponse.json({ success: false, error: "Failed to create demo" }, { status: 500 })
    }
}

// GET: Return all records from Demo table
export const GET = async () => {
    try {
        const demos = await prisma.demo.findMany()
        return NextResponse.json({ success: true, data: demos }, { status: 200 })
    } catch (error) {
        console.error("GET /api/demo error:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch demos" }, { status: 500 })
    }
}
