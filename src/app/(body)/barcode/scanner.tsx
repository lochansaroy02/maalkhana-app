"use client"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"
import { useEffect, useState } from "react"

export default function BarcodeScanner() {
    const [entry, setEntry] = useState<any>(null)

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: 250,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        }, true)

        scanner.render(
            async (decodedText) => {
                try {
                    const data = JSON.parse(decodedText)
                    console.log("Decoded barcode JSON:", data)

                    const res = await fetch(`/api/entry?id=${data.id}`)
                    const dbEntry = await res.json()
                    setEntry(dbEntry)
                    scanner.clear()
                } catch (e) {
                    console.error("Invalid barcode data:", decodedText)
                }
            },
            (err) => {
                console.warn("Scan error:", err)
            }
        )
    }, [])

    return (
        <div className="p-4">
            <div id="reader" className="w-full max-w-md"></div>
            {entry && (
                <div className="mt-4 border p-4">
                    <h2 className="font-bold">Entry Found:</h2>
                    <pre>{JSON.stringify(entry, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}
