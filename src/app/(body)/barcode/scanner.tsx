// src/components/BarcodeScanner.tsx
"use client";

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

interface BarcodeScannerProps {
    onScanResult: (result: { getText: () => string }) => void;
}

const qrcodeRegionId = "html5qr-code-full-region";

export default function BarcodeScanner({ onScanResult }: BarcodeScannerProps) {

    useEffect(() => {
        // 1. Create a new scanner instance.
        const scanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            {
                // Scanner configuration
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 10,
            },
            /* verbose= */ false
        );

        // 2. Define the success callback.
        const successCallback = (decodedText: string) => {
            // We wrap the result to match the object structure the parent component expects.
            onScanResult({ getText: () => decodedText });
            // After a successful scan, you might want to stop the scanner.
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner.", error);
            });
        };

        // 3. Define the error callback (optional).
        const errorCallback = (errorMessage: string) => {
            // Errors are logged but do not stop the scanner.
            // console.warn(`QR error = ${errorMessage}`);
        };

        // 4. Start the scanner.
        scanner.render(successCallback, errorCallback);

        // 5. Cleanup function: This is crucial for stopping the camera when the component unmounts.
        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner on unmount.", error);
            });
        };
    }, [onScanResult]); // Re-run the effect if the callback function changes.

    // The library will render its UI into this div.
    return <div id={qrcodeRegionId} />;
}