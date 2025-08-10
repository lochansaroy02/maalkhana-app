import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

export const generateBarcodePDF = async (entries: any[]) => {
    const doc = new jsPDF();

    const perPage = 40;
    const barcodePerRow = 4;
    const barcodeWidth = 40;
    const barcodeHeight = 20;
    const padding = 10;

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        const row = Math.floor((i % perPage) / barcodePerRow);
        const col = i % barcodePerRow;

        const x = padding + col * (barcodeWidth + padding * 2);
        const y = padding + row * (barcodeHeight + padding * 2);
        const canvas = createCanvas(200, 80);
        JsBarcode(canvas, entry.id, {
            format: "CODE128",
            width: 2,
            height: 30,
            displayValue: true,
        });

        const imageData = canvas.toDataURL("image/png");

        doc.addImage(imageData, "PNG", x, y, barcodeWidth, barcodeHeight);
        doc.text(`FIR: ${entry.firNo}`, x, y + 30);

        if ((i + 1) % perPage === 0 && i !== entries.length - 1) {
            doc.addPage();
        }
    }

    doc.save("barcodes.pdf");
};
