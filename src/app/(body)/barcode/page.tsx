"use client";

import { useEffect, useRef, useState } from 'react';

// --- Type Declarations ---

// Augment the Window interface to include globals loaded from scripts
declare global {
    interface Window {
        JsBarcode: (element: SVGSVGElement, data: string, options: object) => void;
        jspdf: any; // Using 'any' for complex external library types
        Html5Qrcode: any;
        Html5QrcodeSupportedFormats: any;
        Html5QrcodeScannerState: any;
    }
}

// Define types for component props and data structures
interface BarcodeGeneratorProps {
    srNo: string;
    firNo: string;
    id: string;
}

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError: (errorMessage: string) => void;
}

interface ScanResult {
    srNo: string;
    firNo: string;
    id: string;
}

interface Entry {
    srNo: string;
    firNo: string;
    id: string;
}

// --- Custom Hook ---

const useScript = (url: string, globalVarName: string) => {
    const [status, setStatus] = useState<"loading" | "ready" | "error" | "idle">(url ? "loading" : "idle");

    useEffect(() => {
        if (!url) {
            setStatus("idle");
            return;
        }

        if (window[globalVarName as keyof Window]) {
            setStatus("ready");
            return;
        }

        let script = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);

        if (!script) {
            script = document.createElement("script");
            script.src = url;
            script.async = true;
            script.setAttribute("data-status", "loading");
            document.body.appendChild(script);

            const setAttributeFromEvent = (event: Event) => {
                script?.setAttribute("data-status", event.type === "load" ? "ready" : "error");
            };
            script.addEventListener("load", setAttributeFromEvent);
            script.addEventListener("error", setAttributeFromEvent);
        }

        const setStateFromEvent = (event: Event) => {
            setStatus(event.type === "load" ? "ready" : "error");
        };

        script.addEventListener("load", setStateFromEvent);
        script.addEventListener("error", setStateFromEvent);

        return () => {
            if (script) {
                script.removeEventListener("load", setStateFromEvent);
                script.removeEventListener("error", setStateFromEvent);
            }
        };
    }, [url, globalVarName]);

    return status;
};

// --- Components ---

const BarcodeGenerator = ({ srNo, firNo, id }: BarcodeGeneratorProps) => {
    const barcodeRef = useRef<SVGSVGElement>(null);
    const barcodeData = `${srNo}-${firNo}-${id}`;

    useEffect(() => {
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

const BarcodeScanner = ({ onScanSuccess, onScanError }: BarcodeScannerProps) => {
    const scannerRegionId = "barcode-scanner-region";
    const html5QrcodeRef = useRef<any>(null); // Ref for the scanner instance

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) {
            onScanError("Barcode scanning is only available on mobile devices.");
            return;
        }

        if (typeof window.Html5Qrcode === 'undefined') {
            onScanError("Scanner library not loaded.");
            return;
        }

        const setupScanner = async () => {
            if (!html5QrcodeRef.current) {
                html5QrcodeRef.current = new window.Html5Qrcode(scannerRegionId, {
                    verbose: true,
                    formatsToSupport: [window.Html5QrcodeSupportedFormats.CODE_128]
                });
            }

            const html5Qrcode = html5QrcodeRef.current;

            const cleanup = () => {
                if (html5Qrcode?.getState() === window.Html5QrcodeScannerState.SCANNING) {
                    html5Qrcode.stop().catch((err: Error) => {
                        console.error("Failed to stop scanner on cleanup.", err);
                    });
                }
            };

            try {
                const devices = await window.Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    const backCamera = devices.find((device: { label: string }) => device.label.toLowerCase().includes('back'));
                    const cameraId = backCamera ? backCamera.id : devices[0].id;

                    await html5Qrcode.start(
                        cameraId,
                        { fps: 10, qrbox: { width: 280, height: 150 } },
                        (decodedText: string) => {
                            onScanSuccess(decodedText);
                            cleanup();
                        },
                        () => { /* Ignore ongoing scan errors */ }
                    );
                } else {
                    onScanError("No cameras found on this device.");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error("Scanner setup failed:", errorMessage);
                onScanError(`Scanner Error: ${errorMessage}. Please ensure camera permissions are granted.`);
            }
        };

        setupScanner();

        return () => {
            if (html5QrcodeRef.current?.isScanning) {
                html5QrcodeRef.current.stop().catch((err: Error) => console.error("Error stopping scanner on unmount", err));
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
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    // Load external scripts
    const jsBarcodeStatus = useScript('https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js', 'JsBarcode');
    const html5QrcodeStatus = useScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js', 'Html5Qrcode');
    const jspdfStatus = useScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf');

    const scriptsReady = jsBarcodeStatus === 'ready' && html5QrcodeStatus === 'ready' && jspdfStatus === 'ready';

    const generateBarcodePDF = async (entries: Entry[]) => {
        if (typeof window.jspdf === 'undefined' || typeof window.JsBarcode === 'undefined') {
            console.error("PDF generation libraries not loaded.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        const barcodesPerRow = 4;
        const barcodesPerColumn = 10;
        const perPage = barcodesPerRow * barcodesPerColumn;
        const barcodeWidth = 40, barcodeHeight = 15;
        const paddingX = 10, paddingY = 15;
        const verticalSpacing = 25;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const indexOnPage = i % perPage;
            const row = Math.floor(indexOnPage / barcodesPerRow);
            const col = indexOnPage % barcodesPerRow;
            const x = paddingX + col * (barcodeWidth + paddingX);
            const y = paddingY + row * verticalSpacing;

            const canvas = document.createElement("canvas");
            const barcodeValue = `${entry.srNo}-${entry.firNo}-${entry.id}`;

            window.JsBarcode(canvas, barcodeValue, {
                format: "CODE128", width: 2, height: 40, displayValue: true,
                textPosition: "bottom", textAlign: "center", textMargin: 2, fontSize: 10,
            });
            const imageData = canvas.toDataURL("image/png");

            doc.addImage(imageData, "PNG", x, y, barcodeWidth, barcodeHeight);
            doc.text(`${entry.firNo}/${entry.srNo}`, x + barcodeWidth / 2, y - 2, { align: 'center' });

            if ((i + 1) % perPage === 0 && i < entries.length - 1) {
                doc.addPage();
            }
        }
        doc.save("barcodes.pdf");
    };

    const mockEntries: Entry[] = [
        { srNo: "123", firNo: "FIR-001", id: "A5B-G8" },
        { srNo: "124", firNo: "FIR-001", id: "A5B-G9" },
        { srNo: "125", firNo: "FIR-002", id: "C7D-F1" },
        { srNo: "126", firNo: "FIR-002", id: "C7D-F2" },
    ];

    const handleScanSuccess = (decodedText: string) => {
        const [srNo = '', firNo = '', id = ''] = decodedText.split("-");
        const resultObject: ScanResult = { srNo, firNo, id };
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
                    <section className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">Generate Barcodes</h2>
                        <p className="text-gray-600 mb-4">Click the button below to generate a PDF of sample barcodes.</p>
                        <button
                            onClick={() => generateBarcodePDF(mockEntries)}
                            className="bg-green-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300"
                        >
                            Download All as PDF
                        </button>
                    </section>
                    <section className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">Scan Asset</h2>
                        {!isScanning ? (
                            <div className="text-center">
                                {scanResult && (
                                    <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md mb-4 text-left">
                                        <h3 className="font-bold text-lg mb-2">Scan Successful (JSON Format):</h3>
                                        <pre className="bg-gray-800 text-white p-3 rounded-md overflow-x-auto">
                                            <code>{JSON.stringify(scanResult, null, 2)}</code>
                                        </pre>
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

