"use client";
import { useEffect, useState } from "react";

interface ScanResult {
    srNo: string;
    firNo: string;
    id: string; // This will likely be empty now
}

// This could be the structure of the data you get from your API
interface FetchedEntryData {
    entryId: string;
    itemName: string;
    caseDetails: string;
}

const ScannerDisplay = ({ result }: { result: ScanResult }) => {
    // State to hold the data fetched from your database
    const [fetchedData, setFetchedData] = useState<FetchedEntryData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // This useEffect will run whenever the 'result' prop changes (i.e., after a new scan)
    useEffect(() => {
        // A function to fetch data from your backend
        const getData = async () => {
            // Ensure we have both srNo and firNo before making a request
            if (!result.srNo || !result.firNo) {
                return;
            }

            setIsLoading(true);
            setError(null);
            setFetchedData(null);

            try {

                const response = await fetch(`/api/get-entry?srNo=${result.srNo}&firNo=${result.firNo}`);

                if (!response.ok) {
                    // Handle server errors (e.g., 404 Not Found, 500 Internal Server Error)
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
    }, [result]); // The effect depends on the 'result' object

    return (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-md mb-4 text-left shadow-sm">
            <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Scanned Asset Details</h3>

            {/* Display the initial scanned info */}
            <div className="space-y-4 mb-6">
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Scanned FIR No.</label>
                    <p className="text-lg bg-white p-2 rounded-md border text-gray-800 border-gray-200">{result.firNo || 'N/A'}</p>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Scanned Serial No.</label>
                    <p className="text-lg bg-white p-2 rounded-md border text-gray-800 border-gray-200">{result.srNo || 'N/A'}</p>
                </div>
            </div>

            {/* Display loading, error, or fetched data */}
            <div className="mt-4 border-t pt-4">
                {isLoading && <p className="text-blue-600">Loading database details...</p>}
                {error && <p className="text-red-600">Error: {error}</p>}
                {fetchedData && (
                    <div className="space-y-4 text-gray-800">
                        <h4 className="font-bold text-lg">Database Record:</h4>
                        <p><strong>Entry ID:</strong> {fetchedData.entryId}</p>
                        <p><strong>Item Name:</strong> {fetchedData.itemName}</p>
                        <p><strong>Case Details:</strong> {fetchedData.caseDetails}</p>
                        {/* Render any other data you fetched */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerDisplay;