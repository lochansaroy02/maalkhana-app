import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

/**
 * Generates a PDF document with barcodes arranged on A4 sheets.
 * The layout is designed to match standard A4 label paper (e.g., 40 labels per sheet).
 * @param {Array<Object>} entries - An array of objects, each containing data for a barcode.
 * Each object should have srNo, dbName, and firNo properties.
 */
export const generateBarcodePDF = async (entries: any) => {
    // --- Page and Label Layout Configuration (A4 Dimensions: 210mm x 297mm) ---

    // This layout is based on a 40-label sheet (4 columns x 10 rows).
    const LABELS_PER_ROW = 4;
    const LABELS_PER_COLUMN = 10;
    const LABELS_PER_PAGE = LABELS_PER_ROW * LABELS_PER_COLUMN;

    // Margins of the printable area on the A4 sheet, adjusted for the 4x10 layout.
    const PAGE_MARGIN_TOP = 13.5; // mm
    const PAGE_MARGIN_LEFT = 4.5; // mm

    // Dimensions of a single label, adjusted to fit 40 labels.
    const LABEL_WIDTH = 48; // mm
    const LABEL_HEIGHT = 27; // mm

    // Spacing between the labels.
    const HORIZONTAL_GAP = 3; // mm
    const VERTICAL_GAP = 0; // mm (Labels are often flush vertically)

    // Dimensions of the actual barcode image within a label.
    const BARCODE_WIDTH = 40; // mm
    const BARCODE_HEIGHT = 15; // mm

    // --- PDF Document Initialization ---
    const doc = new jsPDF({
        orientation: "p", // portrait
        unit: "mm",
        format: "a4",
    });

    // Set font for all text elements in the PDF.
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // --- Barcode Generation Loop ---
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        // Add a new page if the current one is full.
        if (i > 0 && i % LABELS_PER_PAGE === 0) {
            doc.addPage();
        }

        // --- Calculate Current Label Position ---
        const indexOnPage = i % LABELS_PER_PAGE;
        const row = Math.floor(indexOnPage / LABELS_PER_ROW);
        const col = indexOnPage % LABELS_PER_ROW;

        // Calculate the top-left (x, y) corner of the current label's area.
        const labelX = PAGE_MARGIN_LEFT + col * (LABEL_WIDTH + HORIZONTAL_GAP);
        const labelY = PAGE_MARGIN_TOP + row * (LABEL_HEIGHT + VERTICAL_GAP);

        // --- Place Content within the Label ---

        // Horizontally center the barcode image within the label.
        const barcodeX = labelX + (LABEL_WIDTH - BARCODE_WIDTH) / 2;

        // Vertically position the text and barcode inside the label.
        const srNoY = labelY + 4; // 4mm from the top of the label
        const barcodeY = srNoY + 2; // 2mm below the srNo text
        const firNoY = barcodeY + BARCODE_HEIGHT + 4; // 4mm below the barcode image

        // 1. Add srNo text at the top, centered within the label.
        doc.text(String(entry.srNo || ''), labelX + LABEL_WIDTH / 2, srNoY, { align: 'center' });

        // 2. Generate and add the barcode image.
        // JsBarcode uses an in-memory canvas to render the barcode image data.
        // This is a necessary intermediate step and does not create a visible element.
        const canvas = document.createElement("canvas");
        const barcodeValue = `${entry.dbName || ''}-${entry.firNo || ''}-${entry.srNo || ''}`;

        JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 2,         // Width of a single bar (renderer-specific)
            height: 80,       // Height of the bars (renderer-specific)
            displayValue: false // We are adding text manually with jsPDF for better control.
        });

        const imageData = canvas.toDataURL("image/png");
        doc.addImage(imageData, "PNG", barcodeX, barcodeY, BARCODE_WIDTH, BARCODE_HEIGHT);

        // 3. Add firNo text at the bottom, centered within the label.
        doc.text(String(entry.firNo || ''), labelX + LABEL_WIDTH / 2, firNoY, { align: 'center' });
    }

    // --- Save the Final PDF ---
    doc.save("barcodes.pdf");
};
