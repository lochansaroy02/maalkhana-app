"use client";

import type { ScanResult } from "@/utils/parseBarcode"; // Import the type
import { useEffect, useState } from "react";

// Interface for the data fetched from your API
interface FetchedEntryData {
    entryId: string;
    itemName: string;
    caseDetails: string;
}

// Props for this component
interface ScannerDisplayProps {
    result: ScanResult | null;
}

const ScannerDisplay = ({ result }: ScannerDisplayProps) => {
    const [fetchedData, setFetchedData] = useState<FetchedEntryData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getData = async () => {
            if (!result) {
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

    if (!result) return null; // Don't render anything if there's no result

    return (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-md shadow-sm text-left mb-6">
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

export default ScannerDisplay;