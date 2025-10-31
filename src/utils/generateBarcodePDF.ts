import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

/**
 * Generates a PDF document with barcodes arranged on A4 sheets.
 * The layout is designed to match standa  rd A4 label paper (e.g., 40 labels per sheet).
 * @param {Array<Object>} entries - An array of objects, each containing data for a barcode.
 * @param {string} [dbName] - The database name used in the barcode prefix if entry.dbName is missing.
 * @param {boolean} [drawGrid=true] - If true, draws a light gray border around each label for alignment.
 */
export const generateBarcodePDF = async (
    entries: any,
    dbName: string,
    year: {
        from: string,
        to: string
    },
    policseStation: string | undefined
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

        doc.setLineWidth(0.1); // Set a very thin line
        doc.setDrawColor(200, 200, 200); // Set a light gray color for the grid
        doc.rect(labelX, labelY, LABEL_WIDTH, LABEL_HEIGHT); // Draw the rectangle


        // --- Place Content within the Label ---
        const barcodeX = labelX + (LABEL_WIDTH - BARCODE_WIDTH) / 2;
        const srNoY = labelY + 4;
        const barcodeY = srNoY + 2;
        const firNoY = barcodeY + BARCODE_HEIGHT + 4;

        // 1. Print SrNo

        doc.text(String(entry.srNo || ''), labelX + LABEL_WIDTH / 2, srNoY, { align: 'center' });

        // 2. Generate Canvas for Barcode Image
        const canvas = document.createElement("canvas");

        // Use the original firNo for the unique barcode value
        const attachedFir = String(entry.firNo)
        const barcodeValue = `${entry.dbName || dbName}-${attachedFir || ''}-${entry.srNo || ''}`;


        JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: false
        });

        const imageData = canvas.toDataURL("image/png");
        doc.addImage(imageData, "PNG", barcodeX, barcodeY, BARCODE_WIDTH, BARCODE_HEIGHT);

        // 3. Print FirNo with replacement logic
        // If entry.firNo contains '@', replace it with '/' for display only.
        const originalFirNo = String(entry.firNo || '');
        const firNo1 = originalFirNo.replace(/@/g, '/');
        const displayFirNo = firNo1.replace(/]/g, ',').replace(/&/g, '-')

        let finalDisplayName = displayFirNo + "/" + entry.Year

        doc.text(displayFirNo, labelX + LABEL_WIDTH / 2, firNoY, { align: 'center' });
    }


    //  this is for non chatra thana 


    console.log(`total barcodes generated : ${count}`);
    fileName = `${policseStation}-barcodes.pdf`
    doc.save(fileName);
    // --- Save the Final PDF ---
};
