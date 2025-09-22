"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BarcodeScanner from "./(data)/BarcodeScanner";
import ScannerDisplay from "./(data)/ScannerDisplay";

// Define a type for the data returned from the barcode scan
export interface BarcodeResult {
    dbName: string;
    firNo: string;
    srNo: string;
}

export default function App() {


    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<BarcodeResult | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    // This function handles a successful scan result

    const router = useRouter()
    const handleScanSuccess = (decodedText: string) => {
        try {
            const parts = decodedText.split('-');
            if (parts.length === 3) {
                const [dbName, firNo, srNo] = parts;
                setScanResult({ dbName, firNo, srNo });
                setScanError(null);
                setIsScanning(false);
            } else {
                setScanError("Invalid barcode format. Expected 'dbname-firNo-srNo'.");
                setIsScanning(false);
            }
        } catch (err) {
            setScanError("Failed to process scanned data.");
            setIsScanning(false);
        }
    };

    // This function handles any errors during the scan
    const handleScanError = (errorMessage: string) => {
        setScanError(errorMessage);
        setIsScanning(false);
    };

    // Resets the state to start a new scan
    const resetScanner = () => {
        setScanResult(null);
        setScanError(null);
        setIsScanning(true);
    };

    return (
        <div className="bg-blue glass-effect min-h-screen font-sans text-gray-800 p-4 sm:p-8 flex flex-col items-center">
            <div className="max-w-4xl w-full bg-blue rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-300 transform scale-95 hover:scale-100">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-200">Maalkhana Asset Manager</h1>
                </header>
                <main className="space-y-8">
                    <section className="  p-6 rounded-xl shadow-lg">

                        {isScanning ? (
                            <div>
                                <BarcodeScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                                <button
                                    onClick={() => setIsScanning(false)}
                                    className="mt-4 w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                {scanResult && <ScannerDisplay result={scanResult} />}
                                {scanError && (
                                    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-4">
                                        <h3 className="font-bold text-lg">Scan Error</h3>
                                        <p>{scanError}</p>
                                    </div>
                                )}
                                <div className='flex items-center gap-4 '>

                                    <button
                                        onClick={() => { router.push("/barcode/generate/single") }}
                                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        Generate barcodes
                                    </button>
                                    <button
                                        onClick={resetScanner}
                                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        {scanResult ? 'Scan Another Item' : 'Start Camera Scan'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
