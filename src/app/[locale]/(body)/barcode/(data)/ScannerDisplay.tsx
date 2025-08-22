"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

// --- Interfaces ---

interface ScanResult {
    dbName: string;
    firNo: string;
    srNo: string;
}

interface FetchedEntryData {
    entryId: string;
    itemName: string;
    caseDetails: string;
}


// --- Helper Function ---

/**
 * Parses a raw barcode string (e.g., "CaseDB-FIR-123-456") into a structured object.
 * @param barcodeText The raw string from the scanner.
 * @returns A ScanResult object or null if parsing fails.
 */
const parseBarcodeData = (barcodeText: string): ScanResult | null => {
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


// --- Display Component ---

const ScannerDisplay = ({ result }: { result: ScanResult | null }) => {
    const [fetchedData, setFetchedData] = useState<FetchedEntryData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getData = async () => {
            if (!result || !result.srNo || !result.firNo || !result.dbName) {
                setFetchedData(null);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);
            setFetchedData(null);

            try {
                const response = await fetch(`/api/get-entry?srNo=${result.srNo}&firNo=${result.firNo}&dbName=${result.dbName}`);
                if (!response.ok) {
                    throw new Error(`Record not found or server error: ${response.statusText}`);
                }
                const data: FetchedEntryData = await response.json();
                setFetchedData(data);
            } catch (err) {
                console.error("API call failed:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        getData();
    }, [result]);

    if (!result) {
        return (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-md shadow-sm mt-8">
                <h3 className="font-bold text-xl text-gray-700">Waiting for scan...</h3>
                <p className="text-gray-500">Scan a barcode to see asset details here.</p>
            </div>
        );
    }

    return (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-md shadow-sm text-left mt-8">
            <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Scanned Asset Details</h3>
            <div className="space-y-4 mb-6">
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Scanned Database</label>
                    <p className="text-lg bg-white p-2 rounded-md border text-gray-800 border-gray-200">{result.dbName || 'N/A'}</p>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Scanned FIR No.</label>
                    <p className="text-lg bg-white p-2 rounded-md border text-gray-800 border-gray-200">{result.firNo || 'N/A'}</p>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Scanned Serial No.</label>
                    <p className="text-lg bg-white p-2 rounded-md border text-gray-800 border-gray-200">{result.srNo || 'N/A'}</p>
                </div>
            </div>
            <div className="mt-4 border-t pt-4">
                {isLoading && <p className="text-blue-600 animate-pulse">Loading database record...</p>}
                {error && <p className="text-red-600 font-semibold">⚠️ Error: {error}</p>}
                {fetchedData && (
                    <div className="space-y-4 text-gray-800">
                        <h4 className="font-bold text-lg">Database Record Found:</h4>
                        <p><strong>Entry ID:</strong> {fetchedData.entryId}</p>
                        <p><strong>Item Name:</strong> {fetchedData.itemName}</p>
                        <p><strong>Case Details:</strong> {fetchedData.caseDetails}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main Scanner Component ---

const BarcodeScanner = () => {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    useEffect(() => {
        // ID of the HTML element where the scanner will be rendered.
        const scannerRegionId = "qr-reader";

        const html5QrcodeScanner = new Html5QrcodeScanner(
            scannerRegionId,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }, // This can be an object or a function
                rememberLastUsedCamera: true,
            },
            /* verbose= */ false
        );

        // ✅ FIXED: This is the corrected success callback
        const onScanSuccess = (decodedText: string) => {
            const parsedData = parseBarcodeData(decodedText);
            if (parsedData) {
                setScanResult(parsedData);
                // Optional: clear the scanner after a successful scan
                // html5QrcodeScanner.clear(); 
            } else {
                // Handle the case where the barcode format is invalid
                alert("Invalid barcode format scanned.");
            }
        };

        const onScanFailure = (error: any) => {
            // This callback is called frequently, so keep it lightweight.
            // console.warn(`Code scan error = ${error}`);
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

        // Cleanup function to stop the scanner when the component unmounts
        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner.", error);
            });
        };
    }, []);

    return (
        <div>
            {/* To fix the layout warning, ensure this container is styled correctly.
              For example, in your CSS file:
              #scanner-container {
                width: 100%;
                max-width: 500px;
                margin: 20px auto;
              }
            */}
            <div id="scanner-container">
                <div id="qr-reader"></div>
            </div>

            <ScannerDisplay result={scanResult} />
        </div>
    );
};

export default BarcodeScanner;