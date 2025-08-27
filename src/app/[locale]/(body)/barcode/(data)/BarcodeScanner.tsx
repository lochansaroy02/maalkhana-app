"use client";

import { useEffect, useRef, useState } from "react";

// Props interface for the BarcodeScanner component to ensure type safety.
interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError: (errorMessage: string) => void;
}

// Use inline SVG icons and type the props to avoid external library dependencies.
const LuScan = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
    </svg>
);

const BarcodeScanner = ({ onScanSuccess, onScanError }: BarcodeScannerProps) => {
    // Add explicit types to useRef to connect them to the DOM elements and API objects.
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const barcodeDetectorRef = useRef<any | null>(null);
    const intervalRef = useRef<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if ('BarcodeDetector' in window) {
            //@ts-ignore
            barcodeDetectorRef.current = new window.BarcodeDetector();
        } else {
            onScanError("Your browser does not support the native BarcodeDetector API. Please try a different browser like Chrome or Edge.");
            return;
        }

        let stream: MediaStream | null = null;
        const startScan = async () => {
            setIsLoading(true);
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setIsLoading(false);

                    intervalRef.current = window.setInterval(async () => {
                        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                            try {
                                const barcodes = await (barcodeDetectorRef.current as any).detect(videoRef.current);
                                if (barcodes.length > 0) {
                                    onScanSuccess(barcodes[0].rawValue);
                                    stopScan();
                                }
                            } catch (error) {
                                console.error("Error during barcode detection:", error);
                            }
                        }
                    }, 500);
                }
            } catch (err) {
                console.error("Camera access error:", err);
                onScanError("Failed to access camera. Please ensure permissions are granted.");
            }
        };

        const stopScan = () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };

        startScan();
        return () => stopScan();
    }, [onScanSuccess, onScanError]);

    return (
        <div className="flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-xl p-4 min-h-[300px] relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/70 z-10">
                    <p className="text-gray-500 font-semibold text-center">Loading Camera...</p>
                </div>
            )}
            <video ref={videoRef} className="w-full h-full object-cover rounded-xl" playsInline style={{ display: isLoading ? 'none' : 'block' }} />
            {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2/3 h-1/4 border-2 border-green-500 rounded-md animate-pulse"></div>
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner;
