// Filtering helpers shared by the Malkhana and Seized-vehicle reports.

import { categoryForEntryType } from "./maalCategories";

type Row = Record<string, any>;

export const ACTIVITY_KEYS = ["movement", "release", "return", "nilami", "destroy"] as const;
export type ActivityKey = (typeof ACTIVITY_KEYS)[number];

const norm = (v: unknown) => String(v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Movement / release / return / nilami / destroy, from flags with field fallbacks. */
export const matchesActivity = (row: Row, activity: string) => {
    const status = norm(row.status);
    switch (activity) {
        case "movement":
            return row.isMovement === true || Boolean(row.moveDate || row.movePurpose || row.moveTrackingNo);
        case "release":
            return row.isRelease === true || status === "released" || Boolean(row.releaseDate || row.releaseItemName);
        case "return":
            return row.isReturned === true || Boolean(row.returnDate || row.receivedBy || row.returnBackFrom);
        case "destroy":
            return row.isDestroy === true || status === "destroy" || status === "destroyed" || Boolean(row.destroyDate);
        case "nilami":
            return row.isNilami === true || status === "nilami" || status === "auctioned" || Boolean(row.nilamiDate);
        default:
            return true;
    }
};

export const STATUS_KEYS = ["pending", "released", "destroy", "nilami", "auctioned", "onCourt", "other"] as const;

export const matchesStatus = (row: Row, filter: string) => {
    const status = norm(row.status);
    const f = norm(filter);
    if (status === f) return true;
    switch (f) {
        case "released":
            return row.isRelease === true || Boolean(row.releaseDate);
        case "nilami":
        case "auctioned":
            return row.isNilami === true || status === "nilami" || status === "auctioned" || Boolean(row.nilamiDate);
        case "destroy":
            return row.isDestroy === true || status === "destroyed" || Boolean(row.destroyDate);
        case "oncourt":
            return status === "court";
        case "pending":
            return status === "" || status === "pending";
        default:
            return false;
    }
};

/**
 * Entry-type filter. "other" covers every custom type typed in the form
 * (stored as the entryType itself), matching the dashboard categories.
 */
export const matchesEntryType = (row: Row, filter: string) => categoryForEntryType(row.entryType) === filter;

/**
 * Every word in the query must appear in at least one of the fields
 * ("315 बोर 2021" finds rows containing all three). Case-insensitive.
 */
export const matchesSearch = (row: Row, query: string, fields: string[]) => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    const hay = fields.map((f) => String(row[f] ?? "")).join(" \u0001 ").toLowerCase();
    return words.every((w) => hay.includes(w));
};

/** Year from the Year column, or from a date field when there is none (vehicles). */
export const rowYear = (row: Row, dateField = "gdDate"): number | null => {
    const y = Number.parseInt(String(row.Year ?? ""), 10);
    if (!Number.isNaN(y) && y > 1900) return y;
    const raw = String(row[dateField] ?? "");
    const m = raw.match(/(19|20)\d{2}/);
    return m ? Number(m[0]) : null;
};

export const matchesYearRange = (row: Row, from?: string, to?: string, dateField?: string) => {
    if (!from && !to) return true;
    const y = rowYear(row, dateField);
    if (y === null) return false;
    if (from && y < Number(from)) return false;
    if (to && y > Number(to)) return false;
    return true;
};
