import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

/**
 * Helper function to remove non-ASCII characters (like Hindi).
 * FIX: Explicitly converts input to String() to handle numbers safely.
 */
const sanitizeString = (str: any) => {
    if (str === null || str === undefined) return "";
    // Force convert to string to prevent "str.replace is not a function" error on numbers
    const stringValue = String(str);
    // Keep only ASCII printable characters (regex: range x20 to x7E)
    return stringValue.replace(/[^\x20-\x7E]/g, '').trim();
};

/**
 * Generates a PDF document with barcodes arranged on A4 sheets.
 */
export const generateBarcodePDF = async (
    entries: any,
    dbName: string,
    year: {
        from: string,
        to: string
    },
    policseStation: string | undefined,
    firNo?: string
) => {
    // --- Page and Label Layout Configuration (A4 Dimensions: 210mm x 297mm) ---
    const LABELS_PER_ROW = 4;
    const LABELS_PER_COLUMN = 10;
    const LABELS_PER_PAGE = LABELS_PER_ROW * LABELS_PER_COLUMN;

    const PAGE_MARGIN_TOP = 8.5; // mm
    const PAGE_MARGIN_LEFT = 4.5; // mm
    const LABEL_WIDTH = 48; // mm
    const LABEL_HEIGHT = 27; // mm
    const HORIZONTAL_GAP = 3; // mm
    const VERTICAL_GAP = 0; // mm

    const BARCODE_WIDTH = 40; // mm
    const BARCODE_HEIGHT = 15; // mm

    // --- PDF Document Initialization ---
    const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    let fileName;
    let count = 0;

    // --- Barcode Generation Loop ---
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        count++;
        if (i > 0 && i % LABELS_PER_PAGE === 0) {
            doc.addPage();
        }

        // --- Calculate Current Label Position ---
        const indexOnPage = i % LABELS_PER_PAGE;
        const row = Math.floor(indexOnPage / LABELS_PER_ROW);
        const col = indexOnPage % LABELS_PER_ROW;

        const labelX = PAGE_MARGIN_LEFT + col * (LABEL_WIDTH + HORIZONTAL_GAP);
        const labelY = PAGE_MARGIN_TOP + row * (LABEL_HEIGHT + VERTICAL_GAP);

        // --- Draw Sticker Grid for Alignment ---
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);
        doc.rect(labelX, labelY, LABEL_WIDTH, LABEL_HEIGHT);

        // --- Place Content within the Label ---
        const barcodeX = labelX + (LABEL_WIDTH - BARCODE_WIDTH) / 2;
        const srNoY = labelY + 4;
        const barcodeY = srNoY + 2;
        const firNoY = barcodeY + BARCODE_HEIGHT + 4;

        // 1. Print SrNo (Visual Text)
        // sanitizeString now handles Numbers safely
        const cleanSrNo = sanitizeString(entry.srNo);
        doc.text(cleanSrNo, labelX + LABEL_WIDTH / 2, srNoY, { align: 'center' });

        // 2. Generate Canvas for Barcode Image
        const canvas = document.createElement("canvas");

        // --- PREPARE DATA ---
        const attachedFir = entry.firNo; // Don't force string yet, let helper do it

        // Clean all parts using the fixed helper
        const cleanFirForBarcode = sanitizeString(attachedFir);
        const cleanDbName = sanitizeString(entry.dbName || dbName);
        const cleanSrForBarcode = sanitizeString(entry.srNo);

        // Construct Value: dbName-FIR-SR
        const barcodeValue = `${cleanDbName}-${cleanFirForBarcode}-${cleanSrForBarcode}`;

        try {
            JsBarcode(canvas, barcodeValue, {
                format: "CODE128",
                width: 2,
                height: 80,
                displayValue: false,
                margin: 0
            });

            const imageData = canvas.toDataURL("image/png");
            doc.addImage(imageData, "PNG", barcodeX, barcodeY, BARCODE_WIDTH, BARCODE_HEIGHT);
        } catch (error) {
            console.error("Barcode generation failed for:", barcodeValue, error);
            doc.setFontSize(6);
            doc.text("INVALID DATA", labelX + LABEL_WIDTH / 2, barcodeY + 5, { align: 'center' });
            doc.setFontSize(8);
        }

        // 3. Print FirNo (Visual Text)
        // Convert to string safely for regex operations
        const originalFirNo = String(entry.firNo || '');

        // Replace special chars for display
        const firNo1 = originalFirNo.replace(/@/g, '/');
        const displayFirNo = firNo1.replace(/]/g, ',').replace(/&/g, '-');

        // Sanitize for PDF printing (removes Hindi/Symbols)
        const safeDisplayFirNo = sanitizeString(displayFirNo);

        // Combine with Year
        let finalDisplayName = safeDisplayFirNo;

        doc.text(finalDisplayName, labelX + LABEL_WIDTH / 2, firNoY, { align: 'center' });
    }

    console.log(`Total barcodes generated: ${count}`);
    const cleanStationName = sanitizeString(policseStation || 'download');
    fileName = `${cleanStationName}-barcodes.pdf`;

    doc.save(fileName);
};