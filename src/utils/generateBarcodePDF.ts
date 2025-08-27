import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

/**
 * @typedef {object} BarcodeEntry
 * @property {string | number} srNo - The serial number.
 * @property {string | number} firNo - The FIR number.
 * @property {string} dbName - The database name/type.
 */

/**
 * Generates a PDF document with a grid of barcodes.
 * @param {BarcodeEntry[]} entries - An array of objects, each containing data for one barcode.
 */
export const generateBarcodePDF = (entries: any) => {
    const doc = new jsPDF("p", "mm", "a4");

    // --- Layout Configuration ---
    const barcodesPerRow = 4;
    const barcodesPerColumn = 10;
    const perPage = barcodesPerRow * barcodesPerColumn;

    const barcodeWidth = 48; // mm
    const barcodeHeight = 16; // mm
    const horizontalMargin = 10; // mm (left/right margin of the page)
    const verticalMargin = 15; // mm (top/bottom margin of the page)
    const columnSpacing = 5; // mm (space between barcode columns)
    const rowSpacing = 28; // mm (total vertical space for one barcode row, includes text)

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const indexOnPage = i % perPage;
        const row = Math.floor(indexOnPage / barcodesPerRow);
        const col = indexOnPage % barcodesPerRow;

        // Calculate position for the barcode image's top-left corner
        const x = horizontalMargin + col * (barcodeWidth + columnSpacing);
        const y = verticalMargin + row * rowSpacing;

        // ✅ ADDED: Add srNo at the top of the barcode (no gap)
        // Placing the text baseline at `y - 1` puts it directly above the barcode image.
        doc.text(String(entry.srNo || ''), x + barcodeWidth / 2, y - 1, { align: 'center' });

        // --- Generate Barcode ---
        const canvas = document.createElement("canvas");

        // ✅ FIXED: Encode a clean, simple string instead of JSON
        // Format: dbname-firNo-srNo
        const barcodeValue = `${entry.dbName || ''}-${entry.firNo || ''}-${entry.srNo || ''}`;

        JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 1.5,       
            height: 60,       // Internal height of the bars
            displayValue: false, // We add text manually for better control
        });

        const imageData = canvas.toDataURL("image/jpeg");

        // Add the barcode image to the PDF
        doc.addImage(imageData, "JPEG", x, y, barcodeWidth, barcodeHeight);
        
        const textY = y + barcodeHeight + 3; // 3mm below the barcode
        doc.text(String(entry.firNo || ''), x + barcodeWidth / 2, textY, { align: 'center' });


        // Add a new page if the current one is full and there are more entries
        if ((i + 1) % perPage === 0 && i < entries.length - 1) {
            doc.addPage();
        }
    }

    doc.save("barcodes.pdf");
};