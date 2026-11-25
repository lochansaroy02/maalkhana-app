// Builds backup files for the logged-in account:
//   • <name>.bak – gzip-compressed JSON with every record (a full, restorable copy)
//   • <name>_malkhana_entries.csv and <name>_seized_vehicles.csv – open in Excel
//
// The recipient is always the account's own email, looked up from the database;
// it is never taken from the request.

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { gzipSync } from "node:zlib";

export type BackupRole = "policeStation" | "asp" | "district";
export type BackupFormat = "bak" | "csv";

export interface BackupOwner {
    email: string;
    name: string;
    label: string; // police station or district name, used in file names / email
    role: BackupRole;
    where: Prisma.MalkhanaEntryWhereInput & Prisma.SeizedVehicleWhereInput;
}

export class BackupError extends Error {
    constructor(message: string, public status = 400) {
        super(message);
    }
}

// Entries added from the entry form don't store districtId, so district-wide
// backups also match records whose police-station user is in the district.
const districtScope = (districtId: string) => ({ OR: [{ districtId }, { User: { districtId } }] });

/** Resolves the account and the data it is allowed to back up. */
export async function resolveBackupOwner(userId: string | null, role: string | null): Promise<BackupOwner> {
    if (!userId) throw new BackupError("userId is required");

    if (role === "district") {
        const district = await prisma.district.findUnique({ where: { id: userId } });
        if (!district) throw new BackupError("District account not found", 404);
        return { email: district.email, name: district.name, label: district.name, role: "district", where: districtScope(district.id) };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BackupError("User not found", 404);
    // An ASP oversees the whole district; a police station only its own records.
    if (role === "asp") {
        return { email: user.email, name: user.name, label: user.policeStation || user.name, role: "asp", where: districtScope(user.districtId) };
    }
    return { email: user.email, name: user.name, label: user.policeStation || user.name, role: "policeStation", where: { userId: user.id } };
}

export async function backupSummary(owner: BackupOwner) {
    const [entries, vehicles] = await Promise.all([
        prisma.malkhanaEntry.count({ where: owner.where }),
        prisma.seizedVehicle.count({ where: owner.where }),
    ]);
    return { email: owner.email, label: owner.label, role: owner.role, entries, vehicles };
}

// ------------------------------------------------------------------ CSV

const csvCell = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** UTF-8 CSV with BOM so Excel shows Hindi text correctly. */
const toCsv = (columns: string[], rows: Record<string, unknown>[]) =>
    "﻿" + [columns.join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))].join("\r\n");

const safeName = (s: string) =>
    s.normalize("NFKD").replace(/[^\w-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "backup";

export interface BackupFile {
    filename: string;
    content: Buffer;
    contentType: string;
}

export async function buildBackupFiles(owner: BackupOwner, formats: BackupFormat[]) {
    const [entries, vehicles] = await Promise.all([
        prisma.malkhanaEntry.findMany({ where: owner.where, orderBy: { createdAt: "asc" } }),
        prisma.seizedVehicle.findMany({ where: owner.where, orderBy: { createdAt: "asc" } }),
    ]);

    // Name files by the ASCII form of the account email (station names are Hindi).
    const stamp = new Date().toISOString().slice(0, 10);
    const base = `${safeName(owner.email.split("@")[0])}_${stamp}`;
    const files: BackupFile[] = [];

    if (formats.includes("bak")) {
        const payload = {
            format: "digital-malkhana-backup",
            version: 1,
            createdAt: new Date().toISOString(),
            account: { email: owner.email, name: owner.name, label: owner.label, role: owner.role },
            counts: { malkhanaEntries: entries.length, seizedVehicles: vehicles.length },
            malkhanaEntries: entries,
            seizedVehicles: vehicles,
        };
        files.push({
            filename: `${base}.bak`,
            content: gzipSync(Buffer.from(JSON.stringify(payload), "utf8")),
            contentType: "application/octet-stream",
        });
    }

    if (formats.includes("csv")) {
        files.push({
            filename: `${base}_malkhana_entries.csv`,
            content: Buffer.from(toCsv(Object.values(Prisma.MalkhanaEntryScalarFieldEnum), entries), "utf8"),
            contentType: "text/csv; charset=utf-8",
        });
        files.push({
            filename: `${base}_seized_vehicles.csv`,
            content: Buffer.from(toCsv(Object.values(Prisma.SeizedVehicleScalarFieldEnum), vehicles), "utf8"),
            contentType: "text/csv; charset=utf-8",
        });
    }

    return { files, counts: { entries: entries.length, vehicles: vehicles.length } };
}
