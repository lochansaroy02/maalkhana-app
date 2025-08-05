"use client"

import JsBarcode from 'jsbarcode'
import { useEffect, useRef } from "react"

const BarcodeGenerator = ({ srNo, firNo, id }: { firNo: string, srNo: string, id: string }) => {
    const barcodeRef = useRef<SVGSVGElement>(null)
    const barcodeData = `${srNo}-${firNo}-${id}`;
    useEffect(() => {
        if (barcodeRef.current) {
            JsBarcode(barcodeRef.current, barcodeData, {
                format: "CODE128",
                displayValue: false,
                width: 2,
                height: 80
            });
        }
    }, [barcodeData]);
    const showData = () => {
        const [srNo, firNo, id] = barcodeData.split("-")
        const result = { srNo, firNo, id };
        console.log(result);
    }
    showData()
    return (
        <div className="p-4 border">
            <h2 className="font-bold mb-2">Barcode for {firNo}/{srNo}</h2>
            <svg ref={barcodeRef}></svg>
        </div>
    );
}

export default BarcodeGenerator