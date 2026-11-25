// Universal Excel format for importing Malkhana entries.
//
//  - downloadMalkhanaTemplate(): empty sheet with the standard columns, plus an
//    example sheet and an instructions sheet.
//  - prepareMalkhanaImport(): reads the first sheet of any uploaded workbook.
//    Column names are matched loosely (case, spaces, dots and the older
//    district formats in headerMap.ts all work), values are cleaned and typed
//    for the MalkhanaEntry table.

import * as XLSX from "xlsx";
import * as districtFormats from "./headerMap";
import { ITEM_CATEGORIES, itemCategoryOf, UNSET_CATEGORY } from "./itemCategories";
import { categoryForEntryType, isPlainCategorySpelling } from "./maalCategories";

type Column = { header: string; key: string; width: number };

/** Column order follows the registers already in use (see the sample sheet). */
export const TEMPLATE_COLUMNS: Column[] = [
    { header: "Sr. No.", key: "srNo", width: 7 },
    { header: "Wine", key: "wine", width: 7 },
    { header: "Cash", key: "cash", width: 9 },
    { header: "Wine type", key: "wineType", width: 10 },
    { header: "Photo Url", key: "photoUrl", width: 12 },
    { header: "Fir NO", key: "firNo", width: 10 },
    { header: "GD NO.", key: "gdNo", width: 8 },
    { header: "GD Date", key: "gdDate", width: 11 },
    { header: "Under Section", key: "underSection", width: 16 },
    { header: "Description", key: "description", width: 40 },
    { header: "Year", key: "Year", width: 7 },
    { header: "Police Station", key: "policeStation", width: 14 },
    { header: "विवेचक का नाम", key: "IOName", width: 18 },
    { header: "वादी का नाम", key: "vadiName", width: 18 },
    { header: "एच0एम0/दाखिलकर्ता का नाम", key: "HM", width: 20 },
    { header: "Accused", key: "accused", width: 20 },
    { header: "Status", key: "status", width: 10 },
    { header: "Entry Type", key: "entryType", width: 12 },
    { header: "Place", key: "place", width: 10 },
    { header: "Box No", key: "boxNo", width: 7 },
    { header: "Court No", key: "courtNo", width: 8 },
    { header: "Court Name", key: "courtName", width: 14 },
    { header: "Case Property", key: "caseProperty", width: 16 },
    { header: "Category", key: "category", width: 14 },
    { header: "Malkhana Rack No", key: "malkhanaRackNo", width: 10 },
];

const EXAMPLE_ROWS: Record<string, string | number>[] = [
    { srNo: 1, firNo: "93/90", gdNo: 24, gdDate: "12.06.90", underSection: "354/323/506/426 भादवि", description: "ब्लाऊज ,ड्यूटी रजिस्टर दो बन्डल", Year: 1990, policeStation: "नरौरा", IOName: "उ0नि0 जगदीश प्रसाद", vadiName: "श्रीमती रामवती", accused: "का0 किशनपाल सिंह", entryType: "मालखाना", caseProperty: "ब्लाउज, रजिस्टर", category: "दस्तावेज़" },
    { srNo: 2, firNo: "124/90", gdNo: 26, gdDate: "22.08.90", underSection: "25 आर्म्स एक्ट", description: "एक सीएमपी दो कारतूस 12 वोर", Year: 1990, policeStation: "नरौरा", IOName: "उ0नि0 जगदीश प्रसाद", vadiName: "उ0नि0 विनोद कुमार", accused: "चन्द्रपाल", entryType: "मालखाना", caseProperty: "तमंचा", category: "शस्त्र", malkhanaRackNo: 3 },
    { srNo: 3, firNo: "26/91", gdNo: 23, gdDate: "11.04.91", underSection: "379/411 भादवि", description: "दो बोरी लोहे का कबाड़ा नई बैरिग के साइड मे बनी कोठरी में", Year: 1991, policeStation: "नरौरा", IOName: "उ0नि0 आर0पी0 शर्मा", vadiName: "उ0नि0 शिशिर कुमार वर्मा", accused: "नूरमौहम्मद", entryType: "मालखाना", caseProperty: "लोहे का कबाडा", category: "अन्य" },
    { srNo: 4, firNo: "15/24", gdNo: 12, gdDate: "05.02.2024", underSection: "60 आबकारी अधिनियम", description: "देशी शराब 20 पव्वे", Year: 2024, policeStation: "नरौरा", IOName: "उ0नि0 राकेश कुमार", vadiName: "उ0नि0 सुनील", accused: "रामू", entryType: "शराब", wine: 4, wineType: "देशी", caseProperty: "शराब", category: "आबकारी/शराब", boxNo: 2 },
];

const INSTRUCTIONS: [string, string][] = [
    ["कैसे भरें / How to fill", ""],
    ["1", "पहली शीट (Malkhana) में हर पंक्ति एक प्रविष्टि है। कॉलम के नाम न बदलें। / One row per entry in the first sheet. Do not rename the columns."],
    ["2", "जो कॉलम लागू नहीं हैं उन्हें खाली छोड़ दें। / Leave columns that do not apply empty."],
    ["3", "GD Date: दिन.महीना.वर्ष, जैसे 12.06.90 या 12/06/1990। / day.month.year, e.g. 12.06.90 or 12/06/1990."],
    ["4", "Sr. No., GD NO., Year, Box No, Wine, Cash, Malkhana Rack No में केवल अंक। / Numbers only."],
    ["5", "Year खाली हो तो GD Date से लिया जाएगा। / If Year is empty it is taken from GD Date."],
    ["6", "Police Station खाली हो तो आपके थाने का नाम लिया जाएगा। / If empty, your police station is used."],
    ["7", "Entry Type: मालखाना, एफएसएल, कुर्की, नकद, शराब, लावारिस, पीली वस्तु, अन्य — या कोई अन्य प्रकार लिखें। / or type your own."],
    ["8", `Category: ${ITEM_CATEGORIES.map((c) => c.hi).join(", ")}`],
    ["9", "'उदाहरण' शीट केवल नमूना है, उसे अपलोड नहीं किया जाता। / The 'Example' sheet is only a sample and is not imported."],
];

const TEXT_FORMAT_KEYS = ["firNo", "gdDate", "underSection", "courtNo"];
const TEXT_FORMAT_ROWS = 2000;

const autoWidth = (ws: XLSX.WorkSheet) => {
    ws["!cols"] = TEMPLATE_COLUMNS.map((c) => ({ wch: c.width }));
};

/** Downloads the empty universal format (with example + instructions sheets). */
export const downloadMalkhanaTemplate = () => {
    const wb = XLSX.utils.book_new();

    const empty = XLSX.utils.aoa_to_sheet([TEMPLATE_COLUMNS.map((c) => c.header)]);
    autoWidth(empty);
    // Text-format the columns Excel likes to "fix" (FIR 12/90 → a date, GD Date 12.06.90 …)
    TEXT_FORMAT_KEYS.forEach((key) => {
        const col = TEMPLATE_COLUMNS.findIndex((c) => c.key === key);
        for (let row = 1; row <= TEXT_FORMAT_ROWS; row++) {
            empty[XLSX.utils.encode_cell({ r: row, c: col })] = { t: "s", v: "", z: "@" };
        }
    });
    empty["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: TEXT_FORMAT_ROWS, c: TEMPLATE_COLUMNS.length - 1 } });
    XLSX.utils.book_append_sheet(wb, empty, "Malkhana");

    const example = XLSX.utils.aoa_to_sheet([
        TEMPLATE_COLUMNS.map((c) => c.header),
        ...EXAMPLE_ROWS.map((r) => TEMPLATE_COLUMNS.map((c) => r[c.key] ?? "")),
    ]);
    autoWidth(example);
    XLSX.utils.book_append_sheet(wb, example, "उदाहरण (Example)");

    const help = XLSX.utils.aoa_to_sheet(INSTRUCTIONS);
    help["!cols"] = [{ wch: 6 }, { wch: 110 }];
    XLSX.utils.book_append_sheet(wb, help, "निर्देश (Help)");

    XLSX.writeFile(wb, "Malkhana_Import_Format.xlsx");
};

// ------------------------------------------------------------------ reading

const norm = (s: string) =>
    String(s)
        .normalize("NFC")
        .toLowerCase()
        .replace(/[\s._\-/()।:,'’]+/g, "")
        .replace(/०/g, "0");

const IMPORT_KEYS = new Set(TEMPLATE_COLUMNS.map((c) => c.key));

/** Every header spelling we understand → database key. */
const HEADER_ALIASES: Record<string, string> = (() => {
    const map: Record<string, string> = {};
    const add = (header: string, key: string) => {
        if (IMPORT_KEYS.has(key)) map[norm(header)] ??= key;
    };
    TEMPLATE_COLUMNS.forEach((c) => {
        add(c.header, c.key);
        add(c.key, c.key);
    });
    // Older district formats (narora, arniya, bhadohi, …)
    Object.values(districtFormats).forEach((format) => {
        if (format && typeof format === "object") {
            Object.entries(format as Record<string, string>).forEach(([h, k]) => add(h, k));
        }
    });
    const extra: [string, string][] = [
        ["FIR No", "firNo"], ["FIR No.", "firNo"], ["एफआईआर नंबर", "firNo"], ["मु0अ0सं0", "firNo"], ["अपराध संख्या", "firNo"],
        ["Sr No", "srNo"], ["Serial No", "srNo"], ["Mal No", "srNo"], ["Mud No", "srNo"], ["माल नं", "srNo"], ["मुद्द संख्या", "srNo"], ["क्रम संख्या", "srNo"],
        ["GD No", "gdNo"], ["जीडी नंबर", "gdNo"], ["GD Date", "gdDate"], ["जीडी दिनांक", "gdDate"],
        ["Section", "underSection"], ["धारा", "underSection"], ["विवरण", "description"], ["वर्ष", "Year"], ["थाना", "policeStation"], ["पुलिस थाना", "policeStation"],
        ["IO Name", "IOName"], ["IO", "IOName"], ["Vadi Name", "vadiName"], ["Vadi", "vadiName"], ["HM", "HM"], ["HM Name", "HM"], ["अभियुक्त", "accused"],
        ["स्थिति", "status"], ["प्रविष्टि का प्रकार", "entryType"], ["स्थान", "place"], ["बॉक्स नंबर", "boxNo"], ["न्यायालय नंबर", "courtNo"], ["न्यायालय का नाम", "courtName"],
        ["केस संपत्ति", "caseProperty"], ["श्रेणी", "category"], ["Rack No", "malkhanaRackNo"], ["मालखाना रैक नंबर", "malkhanaRackNo"], ["रैक नंबर", "malkhanaRackNo"],
        ["शराब", "wine"], ["शराब का प्रकार", "wineType"], ["नकद", "cash"], ["Photo Uri", "photoUrl"], ["Photo", "photoUrl"],
    ];
    extra.forEach(([h, k]) => add(h, k));
    return map;
})();

const NUMBER_KEYS = new Set(["srNo", "gdNo", "Year", "boxNo", "wine", "cash", "malkhanaRackNo"]);
// MalkhanaEntry columns that are NOT NULL text in the database.
const REQUIRED_TEXT = ["entryType", "caseProperty", "gdDate", "underSection", "vadiName", "accused", "IOName", "HM", "policeStation", "status", "place", "courtNo", "courtName", "wineType", "photoUrl"];

const text = (v: unknown) => (v === null || v === undefined ? "" : String(v).replace(/\s+/g, " ").trim());

const toInt = (v: unknown): number | null => {
    if (typeof v === "number") return Number.isFinite(v) ? Math.trunc(v) : null;
    const s = text(v).replace(/[,₹]/g, "");
    const m = s.match(/-?\d+/);
    return m ? parseInt(m[0], 10) : null;
};

/** Two-digit years: 00..(this year) → 20xx, otherwise 19xx ("12.06.90" → 1990). */
const fullYear = (y: string) => {
    if (y.length !== 2) return Number(y);
    const n = Number(y);
    return n <= new Date().getFullYear() % 100 ? 2000 + n : 1900 + n;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Returns yyyy-mm-dd, or "" when the value is not a date. */
export const parseRegisterDate = (v: unknown): string => {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "number" && v > 1000 && v < 80000) {
        const d = XLSX.SSF.parse_date_code(v);
        return d ? `${d.y}-${pad(d.m)}-${pad(d.d)}` : "";
    }
    if (v instanceof Date && !isNaN(v.getTime())) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
    const s = text(v);
    // dd.mm.yy, dd/mm/yyyy, dd-mm-yy (also "24/12.06.90", where the GD no. comes first)
    const m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})\s*$/);
    if (m) {
        const [d, mo, y] = [Number(m[1]), Number(m[2]), fullYear(m[3])];
        if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) return `${y}-${pad(mo)}-${pad(d)}`;
    }
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    return iso ? `${iso[1]}-${pad(Number(iso[2]))}-${pad(Number(iso[3]))}` : "";
};

export interface ImportOwner {
    userId: string;
    districtId?: string;
    policeStation?: string;
}

export interface PreparedImport {
    rows: Record<string, unknown>[];
    /** Columns in the file that were understood, as "Excel header → key". */
    matched: { header: string; key: string }[];
    /** Columns in the file that were not understood (ignored). */
    unknown: string[];
    /** Rows skipped because they were empty. */
    skippedEmpty: number;
    /** Row-level problems (Excel row numbers). */
    warnings: string[];
}

/** Reads the first sheet of the workbook and turns it into MalkhanaEntry rows. */
export const prepareMalkhanaImport = (wb: XLSX.WorkBook, owner: ImportOwner): PreparedImport => {
    const sheet = wb.Sheets[wb.SheetNames[0]];
    // raw values for numbers / dates, displayed text for everything else
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true });
    const shown = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });

    const headers = raw.length ? Object.keys(raw[0]) : (XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })[0] || []).map(String);
    const matched: { header: string; key: string }[] = [];
    const unknown: string[] = [];
    const keyFor: Record<string, string> = {};
    headers.forEach((h) => {
        const key = HEADER_ALIASES[norm(h)];
        if (key && !Object.values(keyFor).includes(key)) {
            keyFor[h] = key;
            matched.push({ header: h, key });
        } else if (!/^__EMPTY/.test(h) && text(h)) {
            unknown.push(h);
        }
    });

    const rows: Record<string, unknown>[] = [];
    const warnings: string[] = [];
    let skippedEmpty = 0;

    raw.forEach((r, i) => {
        const excelRow = i + 2; // header is row 1
        const v: Record<string, unknown> = {};
        for (const [h, key] of Object.entries(keyFor)) {
            v[key] = NUMBER_KEYS.has(key) || key === "gdDate" ? r[h] : shown[i]?.[h] ?? r[h];
        }

        const hasData = Object.values(v).some((x) => text(x) !== "");
        if (!hasData) {
            skippedEmpty++;
            return;
        }

        const out: Record<string, unknown> = {};
        for (const key of IMPORT_KEYS) {
            if (key === "gdDate") continue;
            const value = v[key];
            out[key] = NUMBER_KEYS.has(key) ? toInt(value) : text(value) || null;
        }

        // GD date (keep the original text if it is not a recognisable date)
        const rawDate = text(v.gdDate);
        const gdDate = parseRegisterDate(v.gdDate);
        if (rawDate && !gdDate) warnings.push(`Row ${excelRow}: GD Date "${rawDate}" not understood, saved as written`);
        out.gdDate = gdDate || rawDate;

        if (!out.Year && gdDate) out.Year = Number(gdDate.slice(0, 4));

        // Entry type: plain spellings become the dropdown key, custom text stays as written
        const entryType = text(v.entryType);
        out.entryType = !entryType ? "malkhana" : isPlainCategorySpelling(entryType) ? categoryForEntryType(entryType) : entryType;

        // Category → dropdown key (शस्त्र → weapon); blank stays blank
        const cat = itemCategoryOf(text(v.category));
        out.category = cat === UNSET_CATEGORY ? null : cat;

        if (!out.policeStation && owner.policeStation) out.policeStation = owner.policeStation;
        for (const key of REQUIRED_TEXT) if (out[key] === null || out[key] === undefined) out[key] = "";

        if (!out.firNo && !out.srNo && !out.description && !out.caseProperty) {
            warnings.push(`Row ${excelRow}: no FIR No, Sr. No., description or case property — skipped`);
            return;
        }

        out.userId = owner.userId;
        if (owner.districtId) out.districtId = owner.districtId;
        out.dbName = "m";
        rows.push(out);
    });

    return { rows, matched, unknown, skippedEmpty, warnings };
};
