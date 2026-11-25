// Malkhana item categories, taken directly from the entry type chosen when the
// entry was added (the "प्रविष्टि का प्रकार / Entry type" dropdown on the
// Malkhana Entry page). No guessing from descriptions.
//
// Labels come from i18n: messages/*.json → entry.malkhanaEntryForm.entryType.options.<key>

export const ENTRY_TYPE_CATEGORIES = [
    "malkhana",
    "fsl",
    "kurki",
    "cash",
    "wine",
    "unclaimed",
    "yellowItem",
    "licensedWeapon",
    "other",
] as const;

export type MaalCategoryKey = (typeof ENTRY_TYPE_CATEGORIES)[number];

const KNOWN = new Set<string>(ENTRY_TYPE_CATEGORIES);

// Real data stores entryType as free text: dropdown keys ("malkhana"), Hindi
// ("मालखाना", "मालखाना एण्ट्री"), English labels ("Malkhana Entry"), blanks, and
// imported crime heads ("आयुद्ध अधि0", "जुआ", "हत्या"…). Values are matched after
// lower-casing and removing spaces/punctuation.
const squash = (s: string) => s.toLowerCase().replace(/[\s.,\-_/()]+/g, "");

const PREFIX_ALIASES: [MaalCategoryKey, string[]][] = [
    ["fsl", ["fsl", "एफएसएल", "एफ़एसएल", "लैब"]],
    ["cash", ["cash", "नकद", "नगद"]],
    ["wine", ["wine", "शराब", "दारू", "मदिरा", "आबकारी"]],
    ["kurki", ["kurki", "कुर्की", "कुरकी"]],
    ["unclaimed", ["unclaimed", "लावारिस"]],
    ["yellowItem", ["yellowitem", "पीलीवस्तु", "पीलीधातु"]],
    ["licensedWeapon", ["licensedweapon", "लाइसेंसीशस्त्र"]],
];
// Exact values meaning "other" (not "अन्य चोरी", which is a crime head).
const OTHER_EXACT = new Set(["other", "अन्य", "अन्यमाल", "otherentry", "अन्यप्रविष्टि"]);

/**
 * Category for an entry. Known types and their spellings map to their
 * category; everything else (including blank values and crime heads from
 * imports) is a Malkhana entry.
 */
export const categoryForEntryType = (entryType?: string | null): MaalCategoryKey => {
    const raw = (entryType || "").trim();
    if (KNOWN.has(raw)) return raw as MaalCategoryKey;
    const s = squash(raw);
    if (!s) return "malkhana";
    if (OTHER_EXACT.has(s)) return "other";
    for (const [key, prefixes] of PREFIX_ALIASES) {
        if (prefixes.some((p) => s.startsWith(p))) return key;
    }
    return "malkhana";
};

/** True when the stored text is just a spelling of the category itself (not a custom/crime-head value). */
export const isPlainCategorySpelling = (entryType?: string | null) => {
    const raw = (entryType || "").trim();
    if (!raw || KNOWN.has(raw)) return true;
    const s = squash(raw);
    return ["malkhana", "malkhanaentry", "मालखाना", "मालखानाएण्ट्री", "मालखानाएंट्री", "मालखानाप्रविष्टि", "मॉलखाना"].includes(s)
        || OTHER_EXACT.has(s)
        || PREFIX_ALIASES.some(([, ps]) => ps.includes(s));
};

export const isMaalCategory = (v: unknown): v is MaalCategoryKey =>
    typeof v === "string" && KNOWN.has(v);

// ---------------------------------------------------------------- status

export const ITEM_STATUS_KEYS = ["inStation", "movement", "released", "destroyed", "nilami"] as const;
export type ItemStatusKey = (typeof ITEM_STATUS_KEYS)[number];

export const deriveItemStatus = (e: {
    isRelease?: boolean | null;
    isDestroy?: boolean | null;
    isNilami?: boolean | null;
    isMovement?: boolean | null;
    isReturned?: boolean | null;
    status?: string | null;
}): ItemStatusKey => {
    if (e.isRelease) return "released";
    if (e.isDestroy || (e.status || "").toLowerCase() === "destroy") return "destroyed";
    if (e.isNilami) return "nilami";
    if (e.isMovement && !e.isReturned) return "movement";
    return "inStation";
};

// ---------------------------------------------------------------- dates

/** Parses the app's mixed date strings (ISO, dd-mm-yyyy, dd/mm/yyyy). */
export const parseLooseDate = (value?: string | Date | null): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    const v = String(value).trim();
    const dmy = v.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (dmy) {
        const year = dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
        const d = new Date(year, Number(dmy[2]) - 1, Number(dmy[1]));
        return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
};

// India has no DST, so formatting in IST gives the same calendar day on the
// server (UTC) and in the browser for dates saved as local-midnight ISO strings.
const IST_OFFSET_MS = 330 * 60 * 1000;

const dayParts = (value?: string | Date | null): [number, number, number] | null => {
    const d = parseLooseDate(value);
    if (!d) return null;
    // dd-mm-yyyy strings are already calendar dates; keep their parts as-is.
    if (typeof value === "string" && /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/.test(value.trim())) {
        return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
    }
    const ist = new Date(d.getTime() + IST_OFFSET_MS);
    return [ist.getUTCFullYear(), ist.getUTCMonth() + 1, ist.getUTCDate()];
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** dd-mm-yyyy (IST calendar day), or the raw value when it cannot be parsed. */
export const formatDisplayDate = (value?: string | Date | null): string => {
    const p = dayParts(value);
    if (!p) return value ? String(value) : "";
    return `${pad2(p[2])}-${pad2(p[1])}-${p[0]}`;
};

/** yyyy-mm-dd (IST calendar day) for range comparisons, or "" when unparseable. */
export const toIsoDay = (value?: string | Date | null): string => {
    const p = dayParts(value);
    return p ? `${p[0]}-${pad2(p[1])}-${pad2(p[2])}` : "";
};
