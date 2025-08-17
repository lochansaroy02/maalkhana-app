"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import dynamic from 'next/dynamic'; // Import dynamic from next
import { useRef, useState } from "react";
import toast, { LoaderIcon, Toaster } from "react-hot-toast";

// Define a type for the data expected from the barcode
interface BarcodeData {
    id: string;
    firNo?: string;
    srNo?: string;
    type: 'malkhana' | 'seized-vehicle';
}

// Dynamically import the BarcodeScanner component with SSR disabled
const BarcodeScanner = dynamic(() => import('./scanner'), {
    ssr: false,
    loading: () => <p className="text-white text-center">Loading Scanner...</p>
});


export default function BarcodeReportViewer() {
    const [entry, setEntry] = useState<any>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const divRef = useRef(null);

    const allPossibleFields = [
        { key: "firNo", label: "FIR No" }, { key: "srNo", label: "Sr No" }, { key: "gdNo", label: "G.D. No" }, { key: "gdDate", label: "G.D. Date" }, { key: "policeStation", label: "Police Station" }, { key: "IOName", label: "IO Name" }, { key: "entryType", label: "Entry Type" }, { key: "caseProperty", label: "Case Property" }, { key: "status", label: "Status" }, { key: "description", label: "Description" }, { key: "photoUrl", label: "Photo" }, { key: "moveDate", label: "Move Date" }, { key: "takenOutBy", label: "Taken Out By" }, { key: "movePurpose", label: "Move Purpose" },
    ];

    const fetchDataFromBarcode = async (barcode: BarcodeData) => {
        setIsFetching(true);
        setEntry(null);
        toast.loading("Fetching data from database...");

        try {
            let apiUrl = '';
            const { type, id, firNo, srNo } = barcode;
            const basePath = `/api/${type}`;

            if (id) apiUrl = `${basePath}/${id}`;
            else if (firNo) apiUrl = `${basePath}/search?firNo=${firNo}`;
            else if (srNo) apiUrl = `${basePath}/search?srNo=${srNo}`;
            else throw new Error("Barcode contains no valid identifiers.");

            const res = await axios.get(apiUrl);

            if (res.data) {
                setEntry(res.data);
                toast.dismiss();
                toast.success("Data fetched successfully!");
            } else {
                throw new Error("No record found for the given details.");
            }

        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.dismiss();
            toast.error(error.message || "Failed to fetch data.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleScanResult = (result: any) => {
        if (result) {
            setIsScannerOpen(false);
            const scannedText = result.getText();
            try {
                const parsedData: BarcodeData = JSON.parse(scannedText);
                if (!parsedData.type || (!parsedData.id && !parsedData.firNo && !parsedData.srNo)) {
                    toast.error("Invalid barcode format. Missing 'type' or identifiers.");
                    return;
                }
                fetchDataFromBarcode(parsedData);
            } catch (e) {
                toast.error("Invalid barcode data. Not a valid JSON format.");
                console.error("Failed to parse barcode data:", e);
            }
        }
    };

    // --- UI Rendering ---

    // The logic for rendering the scanner is now cleaner
    if (isScannerOpen) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
                <h2 className="text-white text-2xl mb-4">Point Camera at Barcode</h2>
                <div className="w-full max-w-md h-auto rounded-lg overflow-hidden">
                    {/* Render the dynamically imported component */}
                    <BarcodeScanner onScanResult={handleScanResult} />
                </div>
                <Button onClick={() => setIsScannerOpen(false)} className="mt-4 bg-red-600">
                    Cancel Scan
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
            <Toaster position="top-center" />

            <div className="w-full max-w-3xl flex justify-center gap-4 mb-4">
                <Button onClick={() => setIsScannerOpen(true)} className="cursor-pointer bg-blue-600 text-white">
                    Scan Barcode to Fetch Data
                </Button>
                {entry && <Button className="cursor-pointer bg-green-600">Print Report</Button>}
            </div>

            {isFetching && (
                <div className="text-white text-lg flex items-center gap-2">
                    <LoaderIcon className="animate-spin" />
                    <span>Loading Data...</span>
                </div>
            )}

            {entry && (
                <div ref={divRef} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                    <div className="border border-gray-400 p-8">
                        <div className="text-center border-b pb-4 mb-6">
                            <h1 className="text-3xl font-bold text-gray-800">DIGITAL MALKHANA</h1>
                            <h2 className="text-lg font-semibold text-gray-600">Entry Detail</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {allPossibleFields.map(({ key, label }) => {
                                const value = entry[key];
                                if (!value) return null;

                                if (key === "photoUrl") {
                                    return (
                                        <div key={key} className="col-span-1 md:col-span-2 text-center mt-4">
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
                                            <img src={String(value)} alt="Entry" className="max-h-80 mx-auto rounded-lg shadow-md" />
                                        </div>
                                    );
                                }
                                return (
                                    <div key={key} className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-semibold text-gray-600">{label}:</span>
                                        <span className="text-gray-900 text-lg">{String(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {!entry && !isFetching && (
                <div className="text-center text-gray-500 mt-10">
                    <p>Scan a barcode to view an entry report.</p>
                </div>
            )}
        </div>
    );
}