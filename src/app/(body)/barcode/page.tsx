// src/app/scan/page.tsx
"use client";

import { useState } from 'react';
import BarcodeScanner from './scanner'; // Adjust path if needed

// Define a type for the data you expect from your API
interface CaseData {
    serialNumber: string;
    firNumber: string;
    caseDetails: string;
    status: string;
    timestamp: string;
}

export default function ScanPage() {
    const [scannedData, setScannedData] = useState<CaseData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true); // Control scanner visibility

    const handleScanResult = async (decodedText: string) => {
        setIsScanning(false);
        setIsLoading(true);
        setError(null);

        // 1. Parse the scanned text
        const parts = decodedText.split('/');
        if (parts.length !== 2) {
            setError("Invalid Barcode Format. Expected 'srNo/firNo'.");
            setIsLoading(false);
            return;
        }
        const [srNo, firNo] = parts;

        try {
            // 2. Make the API call to your backend
            const response = await fetch(`/api/get-case-data?srNo=${srNo}&firNo=${firNo}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Case not found.');
            }

            const data: CaseData = await response.json();
            setScannedData(data);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setScannedData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const resetScanner = () => {
        setIsScanning(true);
        setScannedData(null);
        setError(null);
    };

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
            <h1>Case Data Scanner</h1>

            {isScanning && (
                <div>
                    <p>Point your camera at a barcode.</p>
                    <BarcodeScanner onScanResult={handleScanResult} />
                </div>
            )}

            {isLoading && <p>Loading case data...</p>}

            {error && (
                <div>
                    <p style={{ color: 'red' }}>Error: {error}</p>
                    <button onClick={resetScanner}>Scan Again</button>
                </div>
            )}

            {scannedData && (
                <div>
                    <h2>✅ Case Data Retrieved</h2>
                    <pre style={{ textAlign: 'left', background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
                        {JSON.stringify(scannedData, null, 2)}
                    </pre>
                    <button onClick={resetScanner}>Scan Another Barcode</button>
                </div>
            )}
        </div>
    );
}