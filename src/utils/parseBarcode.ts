// --- Interface for the parsed barcode data ---
export interface ScanResult {
    dbName: string;
    firNo: string;
    srNo: string;
}

/**
 * Parses a raw barcode string (e.g., "CaseDB-FIR-123-456") into a structured object.
 * @param barcodeText The raw string from the scanner.
 * @returns A ScanResult object or null if parsing fails.
 */
export const parseBarcodeData = (barcodeText: string): ScanResult | null => {
    if (!barcodeText || typeof barcodeText !== 'string') {
        return null;
    }

    const parts = barcodeText.split('-');
    if (parts.length < 3) {
        console.error("Invalid barcode format. Expected 'dbname-firNo-srNo'.");
        return null;
    }

    // Assumes srNo is the last part, dbName is the first, and firNo is everything in between.
    const srNo = parts.pop()!;
    const dbName = parts.shift()!;
    const firNo = parts.join('-'); // Re-join in case firNo contains hyphens

    return { dbName, firNo, srNo };
};