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
    const paddingY = 10; // mm
    const verticalSpacing = 20; // mm

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        const indexOnPage = i % perPage;
        const row = Math.floor(indexOnPage / barcodesPerRow);
        const col = indexOnPage % barcodesPerRow;

        const x = paddingX + col * (barcodeWidth + paddingX);
        const y = paddingY + row * verticalSpacing;

        // Create a browser canvas element
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, entry.id, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false,
        });
        const imageData = canvas.toDataURL("image/png");

        // Add barcode image
        doc.addImage(imageData, "PNG", x, y, barcodeWidth, barcodeHeight);

        // Add FIR text below barcode
        doc.text(`FIR: ${entry.firNo}`, x, y + barcodeHeight + 4);

        // Add new page if needed
        if ((i + 1) % perPage === 0 && i !== entries.length - 1) {
            doc.addPage();
        }
    }

    // Save the PDF
    doc.save("barcodes.pdf");
};
