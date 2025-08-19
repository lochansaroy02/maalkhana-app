"use client";

import ScannerView from "./(data)/ScannerView";
import { useScript } from "./(data)/useScript";

export default function App() {
    // Load external scripts required for the application
    const jsBarcodeStatus = useScript('https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js', 'JsBarcode');
    const html5QrcodeStatus = useScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js', 'Html5Qrcode');
    const jspdfStatus = useScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf');

    const scriptsReady = jsBarcodeStatus === 'ready' && html5QrcodeStatus === 'ready' && jspdfStatus === 'ready';

    // Display a loading screen until all external scripts are ready.
    if (!scriptsReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-700">Loading Libraries...</h1>
                    <p className="text-gray-500">Please wait a moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto p-4 md:p-8 max-w-2xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Maalkhana Asset Manager</h1>
                    <p className="text-gray-500 mt-2">Generate and Scan Asset Barcodes</p>
                </header>
                <main className="space-y-8">
                    <ScannerView />
                </main>
            </div>
        </div>
    );
}