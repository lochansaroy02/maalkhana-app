"use client";

import DisplayScannedData from "@/components/DisplayScannedData";
import axios from "axios";
import { useEffect, useState } from "react";
import { BarcodeResult } from "../page";

// We must load external libraries via a script tag in a useEffect hook
// because direct imports from node_modules are not supported in this environment.
interface Window {
    jspdf: any;
}
declare const window: Window;

interface RecordData {
    [key: string]: any;
}

const ScannerDisplay = ({ result }: { result: BarcodeResult | null }) => {
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
        const fetchRecord = async () => {
            if (!result || !result.dbName || !result.firNo) {
                setSelectedRecord(null);
                setError(null);
                return;
            }
            setIsLoading(true);
            setError(null);
            setSelectedRecord(null);

            try {
                const response = await axios.get(
                    `/api/barcode?dbName=${result.dbName}&firNo=${result.firNo}&srNo=${result.srNo}`
                );

                const responseData = response.data;
                console.log(responseData.data);

                if (responseData.success && responseData.data) {
                    const record = Array.isArray(responseData.data) ? responseData.data[0] : responseData.data;
                    setSelectedRecord(record);
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
        fetchRecord();
    }, [result]);

    const handleDownloadPdf = () => {
        if (!selectedRecord || !isJsPdfLoaded || !window.jspdf) {
            alert("PDF library is still loading. Please try again in a moment.");
            return;
        }

        const doc = new window.jspdf.jsPDF();
        let yPos = 20;
        const leftMargin = 20;
        const rightMargin = 190;
        const borderPadding = 10;
        const lineHeight = 7;
        const columnSeparator = 100;

        // Draw a border around the page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.rect(borderPadding, borderPadding, pageWidth - 2 * borderPadding, pageHeight - 2 * borderPadding);

        doc.setFontSize(18);
        doc.text("Scanned Asset Report", pageWidth / 2, yPos, { align: "center" });
        yPos += 15;
        doc.setFontSize(12);

        const excludedKeys = [
            "id", "createdAt", "updatedAt", "userId", "districtId", "photoUrl", "document", "documentUrl", "isMovement", "isRelease",
            "wine", "wineType", "address", "fathersName", "isReturned", "mobile", "moveDate", "movePurpose", "moveTrackingNo", "name",
            "photo", "releaseItemName", "returnBackFrom", "returnDate", "takenOutBy", "receivedBy", "receiverName", "cash", "yellowItemPrice", "dbName"
        ];

        const formatKey = (key: string) => {
            return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        };

        Object.keys(selectedRecord)
            .filter(key => {
                const value = selectedRecord[key];
                return !excludedKeys.includes(key) && (value !== null && value !== "" && value !== 0);
            })
            .forEach(key => {
                const value = selectedRecord[key];
                const formattedKey = formatKey(key);

                // Check for new page before adding text
                if (yPos > pageHeight - borderPadding - 10) {
                    doc.addPage();
                    doc.rect(borderPadding, borderPadding, pageWidth - 2 * borderPadding, pageHeight - 2 * borderPadding);
                    yPos = borderPadding + 10;
                }

                doc.setFont("helvetica", "bold");
                doc.text(`${formattedKey}:`, leftMargin, yPos);

                doc.setFont("helvetica", "normal");
                const textLines = doc.splitTextToSize(String(value), rightMargin - columnSeparator - 10);
                doc.text(textLines, columnSeparator, yPos);

                yPos += (textLines.length * lineHeight);
            });

        doc.save(`report_${selectedRecord.firNo || 'unknown'}.pdf`);
    };

    if (!result) return null;

    if (isLoading) {
        return <div className="flex justify-center items-center h-full text-lg text-gray-600">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-full text-lg text-red-600">Error: {error}</div>;
    }

    if (!selectedRecord) {
        return <div className="flex justify-center items-center h-full text-lg text-gray-500">No data available.</div>;
    }

    return (
        <div className="bg-white p-4 rounded-md shadow-sm text-left mb-6">
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
                <DisplayScannedData selectedRecord={selectedRecord} />
                <div className="mt-6 flex justify-center">
                    <button onClick={handleDownloadPdf} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                        Download PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScannerDisplay;