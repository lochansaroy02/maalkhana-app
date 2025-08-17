// src/components/BarcodeScanner.tsx
"use client";

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

interface BarcodeScannerProps {
    // Changed to accept the decoded string directly
    onScanResult: (decodedText: string) => void;
}

const qrcodeRegionId = "html5qr-code-full-region";

export default function BarcodeScanner({ onScanResult }: BarcodeScannerProps) {

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            {
                qrbox: { width: 250, height: 250 },
                fps: 10,
            },
            false
        );

        const successCallback = (decodedText: string) => {
            // Directly call the callback with the string result
            onScanResult(decodedText);
            // Don't clear the scanner here; let the parent component decide when to unmount/hide it.
        };

        const errorCallback = (errorMessage: string) => {
            // console.warn(`QR error = ${errorMessage}`);
        };

        scanner.render(successCallback, errorCallback);

        // Cleanup function to stop the camera when the component is unmounted
        return () => {
            // Check if the scanner is still running before trying to clear it
            if (scanner && scanner.getState()) {
                scanner.clear().catch(error => {
                    console.error("Failed to clear scanner on unmount.", error);
                });
            }
        };
    }, [onScanResult]);

    return <div id={qrcodeRegionId} />;
}