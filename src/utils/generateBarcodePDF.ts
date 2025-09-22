import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

/**
 * Generates a PDF document with a grid of barcodes.
 * @param {Array<Object>} entries - An array of objects, where each object contains data for a barcode.
 * Each object should have srNo, id, dbName, and firNo properties.
 */
export const generateBarcodePDF = async (entries: any) => {
    // A4 page dimensions in mm: 210 x 297
    const doc = new jsPDF("p", "mm", "a4");

    // --- Layout Configuration ---
    const barcodesPerRow = 4;
    const barcodesPerColumn = 10;
    const perPage = barcodesPerRow * barcodesPerColumn;

    // Page margins
    const pageMargin = 10; // mm
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Usable area calculations
    const usableWidth = pageWidth - (2 * pageMargin);

    // Spacing between barcodes
    const horizontalGap = 5; // mm
    const verticalSpacing = 26; // mm (Total vertical space for one barcode item, including text and gaps)

    // Calculate the width of each barcode to fit the usable page width
    const totalGapWidth = (barcodesPerRow - 1) * horizontalGap;
    const barcodeWidth = (usableWidth - totalGapWidth) / barcodesPerRow;
    const barcodeHeight = 15; // mm (Height of the barcode image itself)

    // Starting positions for the grid
    const startX = pageMargin;
    const startY = pageMargin + 5; // Extra 5mm top margin for the text above the first row

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const indexOnPage = i % perPage;

        // Determine the row and column for the current barcode
        const row = Math.floor(indexOnPage / barcodesPerRow);
        const col = indexOnPage % barcodesPerRow;

        // Calculate the x and y coordinates for the current barcode
        const x = startX + col * (barcodeWidth + horizontalGap);
        const y = startY + row * verticalSpacing;

        // --- Add Text Elements ---
        // Add srNo (Serial Number) text above the barcode
        doc.text(String(entry.srNo || ''), x + barcodeWidth / 2, y - 2, { align: 'center' });

        // Add firNo (FIR Number) text below the barcode
        doc.text(String(entry.firNo || ''), x + barcodeWidth / 2, y + barcodeHeight + 4, { align: 'center' });

        // --- Generate and Add Barcode Image ---
        const canvas = document.createElement("canvas");

        // Format the barcode value with all necessary parts
        const barcodeValue = `${entry.id || ''}-${entry.dbName || ''}-${entry.firNo || ''}-${entry.srNo || ''}`;

        try {
            JsBarcode(canvas, barcodeValue, {
                format: "CODE128",
                width: 2,
                height: 60, // Adjust internal height of barcode lines
                displayValue: false, // We are displaying text manually
            });
            const imageData = canvas.toDataURL("image/png");

            // Add the generated barcode image to the PDF
            doc.addImage(imageData, "PNG", x, y, barcodeWidth, barcodeHeight);
        } catch (error) {
            console.error(`Failed to generate barcode for value: ${barcodeValue}`, error);
            // Optionally, draw a placeholder or error message on the PDF
            doc.text("Barcode Error", x + barcodeWidth / 2, y + barcodeHeight / 2, { align: 'center' });
        }


        // Add a new page if the current one is full and it's not the last entry
        if ((i + 1) % perPage === 0 && i < entries.length - 1) {
            doc.addPage();
        }
    }

    // Save the generated PDF
    doc.save("barcodes.pdf");
};
