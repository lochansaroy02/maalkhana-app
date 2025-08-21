/**
 * Parses a raw barcode string (e.g., "CaseDB-FIR-123-456") into a structured object.
 * @param {string} barcodeText The raw string from the scanner.
 * @returns {{dbName: string, firNo: string, srNo: string} | null}
 */
export const parseBarcodeData = (barcodeText: any) => {
    if (!barcodeText || typeof barcodeText !== 'string') {
        return null;
    }

    const parts = barcodeText.split('-');
    if (parts.length < 3) {
        console.error("Invalid barcode format. Expected 'dbname-firNo-srNo'.");
        return null;
    }

    // Assumes srNo is the last part, dbName is the first, and firNo is everything in between.
    const srNo = parts.pop();
    const dbName = parts.shift();
    const firNo = parts.join('-'); // Re-join in case firNo contains hyphens

    return { dbName, firNo, srNo };
};



"use client";
import { useEffect, useState } from "react";

// ✅ CHANGED: Updated interface to match the parsed barcode data
interface ScanResult {
    dbName: string;
    firNo: string;
    srNo: string;
}

// This interface for your API response remains the same
interface FetchedEntryData {
    entryId: string;
    itemName: string;
    caseDetails: string;
}

const ScannerDisplay = ({ result }: { result: ScanResult | null }) => {
    const [fetchedData, setFetchedData] = useState<FetchedEntryData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getData = async () => {
            // Check for a valid result object with all required properties
            if (!result || !result.srNo || !result.firNo || !result.dbName) {
                // Clear previous results if the new scan is invalid
                setFetchedData(null);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);
            setFetchedData(null);

            try {
                // ✅ CHANGED: Added dbName to the API query for precise lookups
                const response = await fetch(`/api/get-entry?srNo=${result.srNo}&firNo=${result.firNo}&dbName=${result.dbName}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
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
    }, [result]); // The effect re-runs when the result object changes

    // If there's no result yet, you can show a placeholder
    if (!result) {
        return (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-md shadow-sm">
                <h3 className="font-bold text-xl text-gray-700">Waiting for scan...</h3>
                <p className="text-gray-500">Scan a barcode to see asset details here.</p>
            </div>
        );
    }

    return (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-md shadow-sm text-left">
            <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Scanned Asset Details</h3>

            {/* Display the initial scanned info */}
            <div className="space-y-4 mb-6">
                {/* ✅ ADDED: Display for dbName */}
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

            {/* Display loading, error, or fetched data from the database */}
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
                {!isLoading && !fetchedData && !error && <p className="text-gray-500">Fetching details from the database...</p>}
            </div>
        </div>
    );
};

export default ScannerDisplay;