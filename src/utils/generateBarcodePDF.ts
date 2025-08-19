import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

export const generateBarcodePDF = async (entries: any[]) => {

    const doc = new jsPDF("p", "mm", "a4");

    const barcodesPerRow = 4;
    const barcodesPerColumn = 10;
    const perPage = barcodesPerRow * barcodesPerColumn;

    const barcodeWidth = 40; // mm
    const barcodeHeight = 15; // mm
    const paddingX = 10; // mm
    const paddingY = 15; // mm, increased for top text
    const verticalSpacing = 25; // Increased vertical spacing for clarity

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        // Recalculate position for each barcode
        const indexOnPage = i % perPage;
        const row = Math.floor(indexOnPage / barcodesPerRow);
        const col = indexOnPage % barcodesPerRow;

        const x = paddingX + col * (barcodeWidth + paddingX);
        const y = paddingY + row * verticalSpacing;

        // --- Add static "1" above the barcode ---
        doc.text(entry.srNo, x + barcodeWidth / 2, y - 2, { align: 'center' });

        // --- Generate Barcode with "SR/Year" as the value ---
        const canvas = document.createElement("canvas");

        // Create the value string (e.g., "148/24")

        const barcodeValue = `${entry.id || '??'}-${entry.srNo || '??'}/${String(entry.firNo || '??')}`;

        JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: true,      // Show the value as text
            textPosition: "bottom",  // Position text below the barcode
            textAlign: "center",     // Center the text
            textMargin: 2,
            fontSize: 10,
            // The `text` option is not needed, it defaults to showing the barcode's value
        });
        const imageData = canvas.toDataURL("image/png");

        // Add the generated barcode image to the PDF document
        doc.addImage(imageData, "PNG", x, y, barcodeWidth, barcodeHeight);

        // Add a new page if the current one is full
        if ((i + 1) % perPage === 0 && i !== entries.length - 1) {
            doc.addPage();
        }
    }

    doc.save("barcodes.pdf");
};
