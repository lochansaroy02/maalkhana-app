import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { ensureFontsReady, fitText, font, toPrintable, wrapText } from "./hindiCanvas";
import { categoryForEntryType, isPlainCategorySpelling } from "./maalCategories";

/** Translated words printed on the label; callers pass them from i18n. */
export interface BarcodeLabels {
    /** Label for an entry-type key, e.g. t("entry.malkhanaEntryForm.entryType.options.<key>") */
    entryType: (key: string) => string;
    receipt: string;
    license: string;
    vehicle: string;
    weaponNo: string;
}

const DEFAULT_LABELS: BarcodeLabels = {
    entryType: (key) => key,
    receipt: "Receipt",
    license: "Licence",
    vehicle: "Vehicle",
    weaponNo: "No.",
};

/** Entry-type label; custom "other" types print the text the user typed. */
const typeLabel = (entryType: string | undefined, labels: BarcodeLabels) => {
    // Custom text / crime heads ("आयुद्ध अधि0") print as typed; plain spellings print the category label.
    return isPlainCategorySpelling(entryType) ? labels.entryType(categoryForEntryType(entryType)) : toPrintable(entryType || "");
};

/**
 * Keeps only printable ASCII. The scan value must stay ASCII because both the
 * web app and the mobile scanner split it as `dbName-firNo-srNo`.
 */
const sanitizeString = (str: any) => {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[^\x20-\x7E]/g, "").trim();
};

/** The value encoded in both the barcode and the QR code (unchanged format). */
export const buildScanValue = (entry: any, dbName: string) =>
    `${sanitizeString(entry.dbName || dbName)}-${sanitizeString(entry.firNo)}-${sanitizeString(entry.srNo)}`;

const displayFir = (firNo: any) =>
    String(firNo || "")
        .replace(/@/g, "/")
        .replace(/]/g, ",")
        .replace(/&/g, "-")
        .trim();

interface LabelText {
    title: string;
    subtitle: string;
    station: string;
    details: string;
}

const labelText = (entry: any, dbName: string, labels: BarcodeLabels, policeStation?: string): LabelText => {
    const isVehicle = (entry.dbName || dbName) === "s" || entry.vehicleType !== undefined;
    const fir = displayFir(entry.firNo);
    const year = entry.Year ? ` / ${entry.Year}` : "";

    if (isVehicle) {
        return {
            title: toPrintable(entry.registrationNo) || `Sr. ${toPrintable(entry.srNo)}`,
            subtitle: [fir && `FIR ${fir}`, labels.vehicle].filter(Boolean).join(" · "),
            station: toPrintable(entry.policeStation || policeStation),
            details: [toPrintable(entry.vehicleType), toPrintable(entry.description)].filter(Boolean).join(" "),
        };
    }

    const category = typeLabel(entry.entryType, labels);
    if (entry.entryType === "licensedWeapon") {
        return {
            title: `${labels.receipt} ${toPrintable(entry.receiptNo || entry.srNo)}${year}`,
            subtitle: [entry.licenseNo && `${labels.license} ${toPrintable(entry.licenseNo)}`, category].filter(Boolean).join(" · "),
            station: toPrintable(entry.policeStation || policeStation),
            details: [toPrintable(entry.weaponName), entry.weaponNo && `${labels.weaponNo} ${toPrintable(entry.weaponNo)}`, toPrintable(entry.ownerName)]
                .filter(Boolean).join(" · "),
        };
    }

    return {
        title: `Sr. ${toPrintable(entry.srNo) || "-"}${year}`,
        subtitle: [fir && `FIR ${fir}`, category].filter(Boolean).join(" · "),
        station: toPrintable(entry.policeStation || policeStation),
        details: toPrintable(entry.description) || toPrintable(entry.caseProperty),
    };
};

/**
 * Generates an A4 PDF of barcode stickers (4 × 10 grid, 48 × 27 mm each).
 * Each sticker has a QR code, the item details (Hindi supported) and a
 * CODE128 barcode with the scan value printed below it.
 */
export const generateBarcodePDF = async (
    entries: any,
    dbName: string,
    _year: { from: string; to: string },
    policseStation: string | undefined,
    _firNo?: string,
    labels: BarcodeLabels = DEFAULT_LABELS
) => {
    // --- Sticker sheet layout (unchanged so existing sticker paper still lines up) ---
    const LABELS_PER_ROW = 4;
    const LABELS_PER_COLUMN = 10;
    const LABELS_PER_PAGE = LABELS_PER_ROW * LABELS_PER_COLUMN;
    const PAGE_MARGIN_TOP = 8.5; // mm
    const PAGE_MARGIN_LEFT = 4.5; // mm
    const LABEL_WIDTH = 48; // mm
    const LABEL_HEIGHT = 27; // mm
    const HORIZONTAL_GAP = 3; // mm
    const VERTICAL_GAP = 0; // mm

    // --- Label content layout, rendered at ~300 dpi ---
    const PX = 12; // px per mm
    const W = LABEL_WIDTH * PX;
    const H = LABEL_HEIGHT * PX;
    const PAD = 1.2 * PX;
    const QR = 13.5 * PX;
    const TEXT_X = PAD + QR + 1.2 * PX;
    const TEXT_W = W - TEXT_X - PAD;
    const BAR_Y = 16.4 * PX;
    const BAR_H = 6.6 * PX;
    const BAR_W = W - PAD * 2;

    await ensureFontsReady();

    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const label = document.createElement("canvas");
    label.width = W;
    label.height = H;
    const ctx = label.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");

    const barCanvas = document.createElement("canvas");
    const qrCanvas = document.createElement("canvas");

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (i > 0 && i % LABELS_PER_PAGE === 0) doc.addPage();

        const indexOnPage = i % LABELS_PER_PAGE;
        const row = Math.floor(indexOnPage / LABELS_PER_ROW);
        const col = indexOnPage % LABELS_PER_ROW;
        const labelX = PAGE_MARGIN_LEFT + col * (LABEL_WIDTH + HORIZONTAL_GAP);
        const labelY = PAGE_MARGIN_TOP + row * (LABEL_HEIGHT + VERTICAL_GAP);

        const scanValue = buildScanValue(entry, dbName);
        const text = labelText(entry, dbName, labels, policseStation);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#000000";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";

        // 1. QR code (same value as the barcode, so either can be scanned)
        try {
            await QRCode.toCanvas(qrCanvas, scanValue, { margin: 0, width: QR, errorCorrectionLevel: "M" });
            ctx.drawImage(qrCanvas, PAD, PAD, QR, QR);
        } catch (err) {
            console.error("QR generation failed for:", scanValue, err);
        }

        // 2. Details
        let y = PAD - 0.2 * PX;
        ctx.font = font(2.9 * PX, "bold");
        ctx.fillText(fitText(ctx, text.title, TEXT_W), TEXT_X, y);
        y += 3.5 * PX;

        ctx.font = font(2.3 * PX);
        if (text.subtitle) {
            ctx.fillText(fitText(ctx, text.subtitle, TEXT_W), TEXT_X, y);
            y += 2.9 * PX;
        }
        if (text.station) {
            ctx.font = font(2.3 * PX, "600");
            ctx.fillText(fitText(ctx, text.station, TEXT_W), TEXT_X, y);
            y += 2.9 * PX;
        }
        ctx.font = font(2.1 * PX);
        const remainingLines = Math.max(1, Math.floor((BAR_Y - 0.6 * PX - y) / (2.6 * PX)));
        wrapText(ctx, text.details, TEXT_W, remainingLines).forEach((line) => {
            ctx.fillText(line, TEXT_X, y);
            y += 2.6 * PX;
        });

        // 3. Barcode + human-readable value
        try {
            JsBarcode(barCanvas, scanValue, { format: "CODE128", width: 2, height: 80, displayValue: false, margin: 0 });
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(barCanvas, PAD, BAR_Y, BAR_W, BAR_H);
            ctx.imageSmoothingEnabled = true;
        } catch (error) {
            console.error("Barcode generation failed for:", scanValue, error);
            ctx.font = font(2.4 * PX, "bold");
            ctx.textAlign = "center";
            ctx.fillText("INVALID DATA", W / 2, BAR_Y + 2 * PX);
        }
        ctx.font = font(2 * PX);
        ctx.textAlign = "center";
        ctx.fillText(fitText(ctx, scanValue, BAR_W), W / 2, BAR_Y + BAR_H + 0.4 * PX);

        // JPEG on a white background: PNG would embed an alpha mask and make
        // the file ~15 MB per 20 labels; at ~300 dpi q=0.92 the bars stay crisp.
        doc.addImage(label.toDataURL("image/jpeg", 0.92), "JPEG", labelX, labelY, LABEL_WIDTH, LABEL_HEIGHT, undefined, "FAST");

        // Light outline to help align the sticker sheet
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);
        doc.rect(labelX, labelY, LABEL_WIDTH, LABEL_HEIGHT);
    }

    const cleanStationName = sanitizeString(policseStation || "download") || "download";
    doc.save(`${cleanStationName}-barcodes.pdf`);
};
