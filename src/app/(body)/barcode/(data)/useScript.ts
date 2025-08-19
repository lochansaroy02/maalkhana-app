"use client";

import { useEffect, useState } from 'react';

// --- (types/index.ts) ---
// Centralized type definitions for the application.

declare global {
    interface Window {
        JsBarcode: (element: SVGSVGElement | HTMLCanvasElement, data: string, options: object) => void;
        jspdf: any;
        Html5Qrcode: any;
        Html5QrcodeSupportedFormats: any;
        Html5QrcodeScannerState: any;
    }
}



interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError: (errorMessage: string) => void;
}

// --- (hooks/useScript.ts) ---
// Custom hook to dynamically load external scripts and track their status.

export const useScript = (url: string, globalVarName: string) => {
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
