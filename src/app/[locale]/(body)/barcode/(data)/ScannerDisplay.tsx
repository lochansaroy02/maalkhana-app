// barcode/(data)/ScannerDisplay.tsx
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
// We must load external libraries via a script tag in a useEffect hook
// because direct imports from node_modules are not supported in this environment.

// Use inline SVG icons to avoid external library dependencies.
const LuFileJson = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M8 12h3"></path>
        <path d="M8 18h3"></path>
        <path d="M15 12h1"></path>
        <path d="M15 18h1"></path>
    </svg>
);

const ScannerDisplay = ({ result }: { result: any }) => {
    const [fetchedData, setFetchedData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isJsPdfLoaded, setIsJsPdfLoaded] = useState(false);

    // This useEffect handles dynamically loading the jspdf library
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.async = true;
        script.onload = () => {
            setIsJsPdfLoaded(true);
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // This useEffect will run whenever the 'result' prop changes
    useEffect(() => {
        const getData = async () => {
            // Do not make an API call if there is no valid result object
            if (!result || !result.dbName || !result.firNo || !result.srNo) {
                setFetchedData(null);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);
            setFetchedData(null);

            try {
                const response = await axios.get(
                    `/api/barcode?dbName=${result.dbName}&firNo=${result.firNo}&srNo=${result.srNo}`
                );

                const responseData = response.data;

                if (responseData.success && responseData.data) {
                    console.log(responseData.data);
                    setFetchedData(responseData.data);
                } else {
                    setError(responseData.message || "Record not found.");
                }
            } catch (err) {
                console.error("API call failed:", err);
                setError("Failed to fetch data from the server.");
            } finally {
                setIsLoading(false);
            }
        };

        getData();
    }, [result]); // Add 'result' to the dependency array

    // This function handles the PDF download
    const handleDownloadPdf = () => {
        if (!fetchedData || !isJsPdfLoaded || !window.jspdf) {
            alert("PDF library is still loading. Please try again in a moment.");
            return;
        }

        const doc = new window.jspdf.jsPDF();
        let yPos = 10;
        const margin = 10;

        doc.setFontSize(18);
        doc.text("Scanned Asset Report", margin, yPos);
        yPos += 10;

        doc.setFontSize(12);

        // Loop through the fetched data and add to the PDF
        for (const [key, value] of Object.entries(fetchedData)) {
            // Filter out empty or null values and non-essential fields
            if (value && typeof value !== 'object' && key !== 'id') {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                doc.text(`${formattedKey}: ${value}`, margin, yPos);
                yPos += 7;
            }
            // Add a new page if content exceeds the current page height
            if (yPos > 280) {
                doc.addPage();
                yPos = margin;
            }
        }

        doc.save(`report_${fetchedData.firNo || 'unknown'}.pdf`);
    };

    if (!result) return null;

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
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">Scanned Serial No.</label>
                <p className="text-lg bg-white p-2 rounded-md border text-gray-800 border-gray-200">{result.srNo || 'N/A'}</p>
            </div>
            <div className="mt-4 border-t pt-4">
                {isLoading && <p className="text-blue-600 animate-pulse">Loading database record...</p>}
                {error && <p className="text-red-600 font-semibold">⚠️ Error: {error}</p>}
                {fetchedData && (
                    <div className="space-y-4 text-gray-800">
                        <h4 className="font-bold text-lg">Database Record Found:</h4>
                        {Object.entries(fetchedData).map(([key, value]) => (
                            <p key={key}>
                                <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong> {String(value)}
                            </p>
                        ))}
                    </div>
                )}
                {fetchedData && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleDownloadPdf}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Download PDF Report
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerDisplay;
