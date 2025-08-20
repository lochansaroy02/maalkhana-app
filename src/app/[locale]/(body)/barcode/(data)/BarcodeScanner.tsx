import { useEffect, useRef } from "react";

const BarcodeScanner = ({ onScanSuccess, onScanError }: any) => {
    const scannerRegionId = "barcode-scanner-region";
    const html5QrcodeRef = useRef<any>(null);

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
                            if (html5Qrcode?.getState() === window.Html5QrcodeScannerState.SCANNING) {
                                html5Qrcode.stop();
                            }
                        },
                        () => { }
                    );
                } else {
                    onScanError("No cameras found on this device.");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                onScanError(`Scanner Error: ${errorMessage}. Please ensure camera permissions are granted.`);
            }
        };

        setupScanner();

        return () => {
            if (html5QrcodeRef.current?.isScanning) {
                html5QrcodeRef.current.stop().catch((err: Error) => console.error("Error stopping scanner", err));
            }
        };
    }, [onScanSuccess, onScanError]);

    return (
        <div className="p-4 border rounded-lg bg-gray-100">
            <div id={scannerRegionId} style={{ width: '100%', minHeight: '300px' }}></div>
        </div>
    );
};
export default BarcodeScanner