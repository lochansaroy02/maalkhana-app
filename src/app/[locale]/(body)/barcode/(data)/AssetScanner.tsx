"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { parseBarcodeData, type ScanResult } from "@/utils/parseBarcode";
import ScannerDisplay from "./ScannerDisplay";

const AssetScanner = () => {
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    useEffect(() => {
        // Only run this effect when we are in scanning mode
        if (!isScanning) {
            return;
        }

        const scanner = new Html5QrcodeScanner(
            "qr-reader", // The ID of the div to render the scanner
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        // This is the success handler that correctly parses the barcode
        const handleScanSuccess = (decodedText: string) => {
            const parsedData = parseBarcodeData(decodedText);

            if (parsedData) {
                console.log(parsedData)
                setScanResult(parsedData);
                setIsScanning(false); // Stop scanning on success
            } else {
                // This will alert the user if the scanned format is wrong
                alert("Invalid barcode format scanned.");
            }
        };

        scanner.render(handleScanSuccess, undefined);

        // Cleanup function to stop the scanner
        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner.", error);
            });
        };
    }, [isScanning]); // This effect runs when 'isScanning' changes

    return (
        <section className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">Scan Asset</h2>

            <ScannerDisplay result={scanResult} />

            {isScanning ? (
                <div>
                    <div id="qr-reader" className="w-full"></div>
                    <button
                        onClick={() => setIsScanning(false)}
                        className="mt-4 w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <button
                        onClick={() => {
                            setScanResult(null); // Clear previous result
                            setIsScanning(true);
                        }}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        {scanResult ? 'Scan Another Item' : 'Start Camera Scan'}
                    </button>
                </div>
            )}
        </section>
    );
};

export default AssetScanner;