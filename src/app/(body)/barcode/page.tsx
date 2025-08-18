"use client";

import { useEffect, useRef, useState } from 'react';

// A custom hook to dynamically load external scripts
const useScript = (url, globalVarName) => {
    const [status, setStatus] = useState(url ? "loading" : "idle");

    useEffect(() => {
        if (!url) {
            setStatus("idle");
            return;
        }

        // Check if the script's global variable already exists
        if (window[globalVarName]) {
            setStatus("ready");
            return;
        }

        let script = document.querySelector(`script[src="${url}"]`);

        if (!script) {
            script = document.createElement("script");
            script.src = url;
            script.async = true;
            script.setAttribute("data-status", "loading");
            document.body.appendChild(script);

            const setAttributeFromEvent = (event) => {
                script.setAttribute(
                    "data-status",
                    event.type === "load" ? "ready" : "error"
                );
            };

            script.addEventListener("load", setAttributeFromEvent);
            script.addEventListener("error", setAttributeFromEvent);
        }

        const setStateFromEvent = (event) => {
            setStatus(event.type === "load" ? "ready" : "error");
        };

        // Add event listeners
        script.addEventListener("load", setStateFromEvent);
        script.addEventListener("error", setStateFromEvent);

        // Remove event listeners on cleanup
        return () => {
            if (script) {
                script.removeEventListener("load", setStateFromEvent);
                script.removeEventListener("error", setStateFromEvent);
            }
        };
    }, [url, globalVarName]);

    return status;
};


// --- Barcode Generator Component ---
// This component generates a barcode from the provided data.
const BarcodeGenerator = ({ srNo, firNo, id }) => {
    const barcodeRef = useRef(null);
    const barcodeData = `${srNo}-${firNo}-${id}`;

    useEffect(() => {
        // Ensure JsBarcode is loaded before trying to use it
        if (barcodeRef.current && typeof window.JsBarcode === 'function') {
            try {
                window.JsBarcode(barcodeRef.current, barcodeData, {
                    format: "CODE128",
                    displayValue: true,
                    text: barcodeData,
                    fontSize: 16,
                    width: 2,
                    height: 80,
                    margin: 10,
                });
            } catch (e) {
                console.error("JsBarcode error:", e);
            }
        }
    }, [barcodeData]);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Item: {firNo}/{srNo}</h2>
            <svg ref={barcodeRef}></svg>
        </div>
    );
};


// --- Barcode Scanner Component ---
// This component uses the device's camera to scan for barcodes.
const BarcodeScanner = ({ onScanSuccess, onScanError }) => {
    const scannerRegionId = "barcode-scanner-region";
    const html5QrcodeRef = useRef(null);

    useEffect(() => {
        // --- Mobile Device Check ---
        // This check ensures the scanner only attempts to run on mobile devices.
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) {
            onScanError("Barcode scanning is only available on mobile devices.");
            return; // Stop execution if not on a mobile device
        }

        // Ensure Html5Qrcode is loaded before proceeding
        if (typeof window.Html5Qrcode === 'undefined') {
            onScanError("Scanner library not loaded.");
            return;
        }

        const setupScanner = async () => {
            // Only initialize once
            if (!html5QrcodeRef.current) {
                html5QrcodeRef.current = new window.Html5Qrcode(scannerRegionId, {
                    verbose: true,
                    formatsToSupport: [window.Html5QrcodeSupportedFormats.CODE_128]
                });
            }

            const html5Qrcode = html5QrcodeRef.current;

            const cleanup = () => {
                if (html5Qrcode && html5Qrcode.getState() === window.Html5QrcodeScannerState.SCANNING) {
                    html5Qrcode.stop().catch(err => {
                        console.error("Failed to stop scanner on cleanup.", err);
                    });
                }
            };

            try {
                const devices = await window.Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    const backCamera = devices.find(device => device.label.toLowerCase().includes('back'));
                    const cameraId = backCamera ? backCamera.id : devices[0].id; // Default to first camera if no back camera found

                    await html5Qrcode.start(
                        cameraId,
                        { fps: 10, qrbox: { width: 280, height: 150 } },
                        (decodedText, decodedResult) => {
                            onScanSuccess(decodedText, decodedResult);
                            cleanup(); // Stop camera on success
                        },
                        (errorMessage) => { /* Ignore continuous errors during scanning */ }
                    );
                } else {
                    onScanError("No cameras found on this device.");
                }
            } catch (err) {
                console.error("Scanner setup failed:", err);
                onScanError(`Scanner Error: ${err.message}. Please ensure camera permissions are granted.`);
            }
        };

        setupScanner();

        // Cleanup function on component unmount
        return () => {
            if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
                html5QrcodeRef.current.stop().catch(err => console.error("Error stopping scanner on unmount", err));
            }
        };
    }, [onScanSuccess, onScanError]);

    return (
        <div className="p-4 border rounded-lg bg-gray-100">
            <div id={scannerRegionId} style={{ width: '100%', minHeight: '300px' }}></div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [scanError, setScanError] = useState(null);

    // Load external scripts required for the components
    const jsBarcodeStatus = useScript('https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js', 'JsBarcode');
    const html5QrcodeStatus = useScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js', 'Html5Qrcode');

    const scriptsReady = jsBarcodeStatus === 'ready' && html5QrcodeStatus === 'ready';

    const handleScanSuccess = (decodedText, decodedResult) => {
        console.log(`Scan result: ${decodedText}`, decodedResult);
        const [srNo, firNo, id] = decodedText.split("-");
        setScanResult({ srNo, firNo, id, raw: decodedText });
        setIsScanning(false);
        setScanError(null);
    };

    const handleScanError = (errorMessage) => {
        console.error(`Scan error: ${errorMessage}`);
        setScanError(errorMessage);
        setIsScanning(false);
    };

    const resetScanner = () => {
        setIsScanning(false);
        setScanResult(null);
        setScanError(null);
    };

    // Show a loading state while scripts are being downloaded
    if (!scriptsReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-700">Loading Components...</h1>
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
                    <section className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">Generate Barcode</h2>
                        <BarcodeGenerator srNo="123" firNo="FIR-001" id="A5B-G8" />
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">Scan Asset</h2>
                        {!isScanning ? (
                            <div className="text-center">
                                {scanResult && (
                                    <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md mb-4">
                                        <h3 className="font-bold text-lg">Scan Successful!</h3>
                                        <p><strong>SR No:</strong> {scanResult.srNo && scanResult.srNo}</p>
                                        <p><strong>FIR No:</strong> {scanResult.firNo}</p>
                                        <p><strong>ID:</strong> {scanResult.id}</p>
                                    </div>
                                )}
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
                                <BarcodeScanner
                                    onScanSuccess={handleScanSuccess}
                                    onScanError={handleScanError}
                                />
                                <button
                                    onClick={() => setIsScanning(false)}
                                    className="mt-4 w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </section>
                </main>
                <footer className="text-center text-gray-400 mt-8 text-sm">
                    <p>Malkhana App &copy; 2024</p>
                </footer>
            </div>
        </div>
    );
}
