"use client";

import DisplayScannedData from "@/components/DisplayScannedData";
import axios from "axios";
import html2canvas from "html2canvas"; // Import html2canvas
import { useEffect, useRef, useState } from "react";
import { BarcodeResult } from "../page";

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

    // Create a ref for the div to be downloaded
    const divToDownloadRef = useRef<HTMLDivElement>(null);

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

    const handleDownloadPdf = async () => {
        if (!divToDownloadRef.current || !isJsPdfLoaded || !window.jspdf) {
            alert("Content or PDF library is not ready. Please try again.");
            return;
        }

        try {
            // Use html2canvas to render the div to a canvas
            const canvas = await html2canvas(divToDownloadRef.current, {
                scale: 2 // Increase scale for better image quality in the PDF
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Convert canvas to a data URL

            const doc = new window.jspdf.jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add new pages if the content overflows
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            doc.save(`report_${selectedRecord?.firNo || 'unknown'}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        }
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
                {/* Pass the ref to the child component */}
                <DisplayScannedData selectedRecord={selectedRecord} divRef={divToDownloadRef} />
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