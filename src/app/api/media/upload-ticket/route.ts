import { prisma } from "@/lib/prisma";
import { mediaConfig, mediaFolder, MediaKind, signMediaTicket, TICKET_TTL_SECONDS } from "@/lib/media/ticket";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface SessionToken {
    id: string;
    role: "district" | "policeStation" | "asp";
    districtId: string;
}

/**
 * POST /api/media/upload-ticket
 *   Authorization: Bearer <login token>
 *   body: { kind: "photos" | "documents", stationUserId?: string }
 *
 * Returns a 10-minute ticket that lets the browser upload ONE kind of file into
 * its own district / police-station folder on the media server.
 *   - police station users: always their own station
 *   - district / ASP users: the station picked in the header (must be in
 *     their district), otherwise the district office folder
 * 503 { configured: false } when the media server is not set up (the client
 * then falls back to ImageKit).
 */
export const POST = async (req: NextRequest) => {
    const config = mediaConfig();
    if (!config) {
        return NextResponse.json({ success: false, configured: false, error: "Media server is not configured" }, { status: 503 });
    }

    const auth = req.headers.get("authorization") || "";
    let session: SessionToken;
    try {
        session = jwt.verify(auth.replace(/^Bearer\s+/i, ""), process.env.JWT_TOKEN as string) as SessionToken;
    } catch {
        return NextResponse.json({ success: false, error: "Please log in again" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const kind: MediaKind = body?.kind === "documents" ? "documents" : "photos";
    const stationUserId: string | undefined = typeof body?.stationUserId === "string" && body.stationUserId ? body.stationUserId : undefined;

    try {
        let districtId: string;
        let station: { id: string; policeStation: string | null; name: string } | null = null;

        if (session.role === "policeStation") {
            const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, policeStation: true, name: true, districtId: true } });
            if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
            districtId = user.districtId;
            station = user;
        } else {
            // district login: its id is the district id; ASP: the district they oversee
            districtId = session.role === "district" ? session.id : session.districtId;
            if (stationUserId) {
                const user = await prisma.user.findUnique({ where: { id: stationUserId }, select: { id: true, policeStation: true, name: true, districtId: true } });
                if (!user || user.districtId !== districtId) {
                    return NextResponse.json({ success: false, error: "Police station is not in your district" }, { status: 403 });
                }
                station = user;
            }
        }

        const district = await prisma.district.findUnique({ where: { id: districtId }, select: { id: true, name: true } });
        if (!district) return NextResponse.json({ success: false, error: "District not found" }, { status: 400 });

        const stationName = station ? station.policeStation || station.name : "District Office";
        const ticket = signMediaTicket(
            {
                d: mediaFolder(district.name, district.id, "district"),
                p: station ? mediaFolder(stationName, station.id, "ps") : "district-office",
                dn: district.name,
                pn: stationName,
                k: kind,
                u: session.id,
                exp: Math.floor(Date.now() / 1000) + TICKET_TTL_SECONDS,
            },
            config.secret
        );

        return NextResponse.json({ success: true, uploadUrl: `${config.serverUrl}/upload`, ticket, kind });
    } catch (error) {
        console.error("POST /api/media/upload-ticket error:", error);
        return NextResponse.json({ success: false, error: "Could not prepare the upload" }, { status: 500 });
    }
};
