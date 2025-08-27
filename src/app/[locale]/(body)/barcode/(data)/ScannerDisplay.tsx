"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { BarcodeResult } from "../page"; // Import the BarcodeResult type

// We must load external libraries via a script tag in a useEffect hook
// because direct imports from node_modules are not supported in this environment.
interface Window {
    jspdf: any;
}
declare const window: Window;

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

interface RecordData {
    [key: string]: any;
}

const ScannerDisplay = ({ result }: { result: BarcodeResult | null }) => {
    const [recordOptions, setRecordOptions] = useState<RecordData[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<RecordData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isJsPdfLoaded, setIsJsPdfLoaded] = useState(false);

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

    useEffect(() => {
        const fetchRecords = async () => {
            if (!result || !result.dbName || !result.firNo) {
                setRecordOptions([]);
                setError(null);
                return;
            }
            setIsLoading(true);
            setError(null);
            setRecordOptions([]);
            setSelectedRecord(null);

            try {
                const response = await axios.get(
                    `/api/seized?dbName=${result.dbName}&firNo=${result.firNo}`
                );

                const responseData = response.data;

                if (responseData.success && responseData.data) {
                    if (Array.isArray(responseData.data)) {
                        setRecordOptions(responseData.data);
                        if (responseData.data.length === 1) {
                            setSelectedRecord(responseData.data[0]);
                        }
                    } else {
                        setSelectedRecord(responseData.data);
                    }
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
        fetchRecords();
    }, [result]);

    const handleSelectSrNo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedSrNo = e.target.value;
        const record = recordOptions.find(item => item.srNo === selectedSrNo);
        setSelectedRecord(record as any);
    };

    const handleDownloadPdf = () => {
        if (!selectedRecord || !isJsPdfLoaded || !window.jspdf) {
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
        for (const [key, value] of Object.entries(selectedRecord)) {
            if (value && typeof value !== 'object' && key !== 'id') {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                doc.text(`${formattedKey}: ${value}`, margin, yPos);
                yPos += 7;
            }
            if (yPos > 280) {
                doc.addPage();
                yPos = margin;
            }
        }
        doc.save(`report_${selectedRecord.firNo || 'unknown'}.pdf`);
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
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Scanned Serial No.</label>
                    <p className="text-lg bg-white p-2 rounded-md border text-gray-800 border-gray-200">{result.srNo || 'N/A'}</p>
                </div>
            </div>
            <div className="mt-4 border-t pt-4">
                {isLoading && <p className="text-blue-600 animate-pulse">Loading database records...</p>}
                {error && <p className="text-red-600 font-semibold">⚠️ Error: {error}</p>}
                {recordOptions.length > 1 && !selectedRecord && (
                    <div className="mb-4">
                        <h4 className="font-bold text-lg mb-2">Select a Serial Number:</h4>
                        {recordOptions.map(record => (
                            <div key={record.srNo} className="flex items-center space-x-2">
                                <input type="radio" id={`srNo-${record.srNo}`} name="srNo" value={record.srNo} onChange={handleSelectSrNo} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                <label htmlFor={`srNo-${record.srNo}`} className="text-gray-700">Serial Number: {record.srNo}</label>
                            </div>
                        ))}
                    </div>
                )}
                {selectedRecord && (
                    <div className="space-y-4 text-gray-800">
                        <h4 className="font-bold text-lg">Database Record Found:</h4>
                        {Object.entries(selectedRecord).map(([key, value]) => (
                            <p key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong> {String(value)}</p>
                        ))}
                    </div>
                )}
                {selectedRecord && (
                    <div className="mt-6 flex justify-center">
                        <button onClick={handleDownloadPdf} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                            Download PDF Report
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerDisplay;
