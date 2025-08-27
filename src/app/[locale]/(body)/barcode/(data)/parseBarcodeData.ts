// barcode/(data)/parseBarcodeData.ts
"use client";

/**
 * Defines the structure for a parsed barcode result.
 */
export interface ScanResult {
    dbName: string;
    firNo: string;
    srNo: string;
}

/**
 * Parses a barcode string of the format 'dbName-firNo-srNo' into a JSON object.
 * @param {string} barcodeString - The raw string from the scanned barcode.
 * @returns {ScanResult | null} The parsed object or null if the format is invalid.
 */
export const parseBarcodeData = (barcodeString: string): ScanResult | null => {
    if (!barcodeString) {
        return null;
    }
    const parts = barcodeString.split('-');
    if (parts.length !== 3) {
        return null;
    }
    const [dbName, firNo, srNo] = parts;
    return {
        dbName,
        firNo,
        srNo
    };
};
