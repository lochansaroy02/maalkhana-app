"use client";

import { useState } from "react";
import BarcodeScanner from "./BarcodeScanner";

const ScannerView = () => {
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    const handleScanSuccess = (decodedText: string) => {
        const parts = decodedText.split("-");
        const resultObject: ScanResult = {
            srNo: parts[0] || '',
            firNo: parts[1] || '',
            id: parts[2] || ''
        };
        setScanResult(resultObject);
        setIsScanning(false);
        setScanError(null);
    };

    const handleScanError = (errorMessage: string) => {
        setScanError(errorMessage);
        setIsScanning(false);
    };

    const resetScanner = () => {
        setIsScanning(false);
        setScanResult(null);
        setScanError(null);
    };

    return (
        <section className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">Scan Asset</h2>
            {!isScanning ? (
                <div className="text-center">
                    {scanResult && <ScanResultDisplay result={scanResult} />}
                    {scanError && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-4">
                            <h3 className="font-bold text-lg">Scan Error</h3>
                            <p>{scanError}</p>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            resetScanner();
                            setIsScanning(true);
                        }}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        {scanResult ? 'Scan Another Item' : 'Start Camera Scan'}
                    </button>
                </div>
            ) : (
                <div>
                    <BarcodeScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                    <button
                        onClick={() => setIsScanning(false)}
                        className="mt-4 w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </section>
    );
};

export default ScannerView
