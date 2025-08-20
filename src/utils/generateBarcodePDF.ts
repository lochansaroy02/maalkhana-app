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

        // Add text above the barcode (e.g., Serial Number)
        doc.text(String(entry.srNo || ''), x + barcodeWidth / 2, y - 2, { align: 'center' });

        // --- Generate Barcode ---
        const canvas = document.createElement("canvas");

        // 1. Create an object with the desired keys.
        // Note: Renamed 'dbName' to 'dbType' to match your desired output.
        const barcodeData = {
            firNo: String(entry.firNo || ''),
            srNo: entry.srNo || '',
            dbType: entry.dbName || '' // Assuming dbName maps to dbType
        };

        // 2. Convert the object to a JSON string. This is the value we'll encode.
        const barcodeValue = JSON.stringify(barcodeData);

        JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: false, // Set to false, JSON string is not human-readable
        });
        const imageData = canvas.toDataURL("image/png");

        doc.addImage(imageData, "PNG", x, y, barcodeWidth, barcodeHeight);

        // Add a new page if the current one is full
        if ((i + 1) % perPage === 0 && i !== entries.length - 1) {
            doc.addPage();
        }
    }

    doc.save("barcodes.pdf");
};

