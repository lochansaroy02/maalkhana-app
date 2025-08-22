// PASTE THIS ENTIRE CODE INTO YOUR SCANNER FILE (e.g., components/AssetScanner.tsx)

"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

// Make sure the import paths are correct for your project structure
import { parseBarcodeData, type ScanResult } from "@/utils/parseBarcode";
import ScannerDisplay from "./ScannerDisplay";

const AssetScanner = () => {
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    useEffect(() => {
        if (!isScanning) {
            return;
        }

        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        // ✅ THIS IS THE CORRECT SUCCESS HANDLER
        const handleScanSuccess = (decodedText: string) => {
            // It uses parseBarcodeData, NOT JSON.parse()
            const parsedData = parseBarcodeData(decodedText);

            if (parsedData) {
                setScanResult(parsedData);
                setIsScanning(false); // Stop scanning on success
            } else {
                alert("Invalid barcode format scanned.");
            }
        };

        scanner.render(handleScanSuccess, undefined);

        // Cleanup function
        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner.", error);
            });
        };
    }, [isScanning]);

    return (
        <section className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">Scan Asset</h2>

            <ScannerDisplay result={scanResult} />

            {isScanning ? (
                <div>
                    <div id="qr-reader" className="w-full"></div>
                    <button
                        onClick={() => setIsScanning(false)}
                        className="mt-4 w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <button
                        onClick={() => {
                            setScanResult(null);
                            setIsScanning(true);
                        }}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
                    >
                        {scanResult ? 'Scan Another Item' : 'Start Camera Scan'}
                    </button>
                </div>
            )}
        </section>
    );
};

export default AssetScanner;