import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

export const generateBarcodePDF = async (entries: any) => {
    const doc = new jsPDF("p", "mm", "a4");

    const barcodesPerRow = 4;
    const barcodesPerColumn = 10;
    const perPage = barcodesPerRow * barcodesPerColumn;

    const barcodeWidth = 50; // mm
    const barcodeHeight = 15; // mm
    const paddingX = 10; // mm
    const paddingY = 15; // mm
    const verticalSpacing = 25; // mm

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const indexOnPage = i % perPage;
        const row = Math.floor(indexOnPage / barcodesPerRow);
        const col = indexOnPage % barcodesPerRow;

        const x = paddingX + col * (barcodeWidth + paddingX);
        const y = paddingY + row * verticalSpacing;

        // Add srNo at the top of the barcode
        doc.text(String(entry.srNo || ''), x + barcodeWidth / 2, y - 1, { align: 'center' });

        // --- Generate Barcode ---
        const canvas = document.createElement("canvas");

        // Format the barcode value as "dbName-firNo-srNo"
        const barcodeValue = `${entry.dbName || ''}-${entry.firNo || ''}-${entry.srNo || ''}`;

        JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: false, // Don't display the human-readable text
        });
        const imageData = canvas.toDataURL("image/png");

        doc.addImage(imageData, "PNG", x, y, barcodeWidth, barcodeHeight);

        // Add firNo at the bottom of the barcode with 3mm space
        doc.text(String(entry.firNo || ''), x + barcodeWidth / 2, y + barcodeHeight + 3, { align: 'center' });

        // Add a new page if the current one is full
        if ((i + 1) % perPage === 0 && i !== entries.length - 1) {
            doc.addPage();
        }
    }

    doc.save("barcodes.pdf");
};