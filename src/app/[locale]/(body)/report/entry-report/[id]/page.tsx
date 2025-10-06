"use client";

import Logo from "@/assets/Logo";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function EntryReportDetail() {
    // Hooks and State
    const { id } = useParams();
    const router = useRouter()
    const [entry, setEntry] = useState<any>(null);
    const [fieldsToDisplay, setFieldsToDisplay] = useState<any[]>([]);

    const divRef = useRef(null)

    // All Possible Fields
    const allPossibleFields = [
        { key: "firNo", label: "FIR No" },
        { key: "Year", label: "Year" },
        { key: "srNo", label: "Sr No" },
        { key: "gdNo", label: "G.D. No" },
        { key: "gdDate", label: "G.D. Date" },
        { key: "policeStation", label: "Police Station" },
        { key: "IOName", label: "IO Name" },
        { key: "entryType", label: "Entry Type" },
        { key: "vadiName", label: "Vadi Name" },
        { key: "HM", label: "HM Name" },
        { key: "underSection", label: "Under Section" },
        { key: "wine", label: "Wine" },
        { key: "cash", label: "Cash" },
        { key: "wineType", label: "Wine Type" },
        { key: "caseProperty", label: "Case Property" },
        { key: "status", label: "Status" },
        { key: "place", label: "Place" },
        { key: "courtNo", label: "Court No" },
        { key: "courtName", label: "Court Name" },
        { key: "boxNo", label: "Box No" },
        { key: "description", label: "Description" },
        { key: "accused", label: "accused" },
        // Movement Report Fields (NEWLY ADDED)
        { key: "moveDate", label: "Move Date" },
        { key: "takenOutBy", label: "Taken Out By" },
        { key: "movePurpose", label: "Move Purpose" },
        { key: "moveTrackingNo", label: "Move Tracking No" },
        { key: "returnDate", label: "Return Date" },
        { key: "receivedBy", label: "Received By" },
        { key: "returnBackFrom", label: "Return Back From" },
        { key: "photoUrl", label: "Photo" },
    ];

    // Effect to fetch entry data
    useEffect(() => {
        if (id) {
            axios.get(`/api/entry/${id}`)
                .then(res => {
                    const entryData = res.data;
                    setEntry(entryData);

                    const storedFieldsJson = sessionStorage.getItem('visibleReportFields');
                    let filteredFields = allPossibleFields;

                    if (storedFieldsJson) {
                        try {
                            const visibleKeys = JSON.parse(storedFieldsJson);
                            filteredFields = allPossibleFields.filter(field =>
                                // Only display fields that are selected AND have non-null/non-empty data
                                visibleKeys.includes(field.key) && entryData[field.key]
                            );
                        } catch (e) {
                            // Fallback to all fields if parsing fails
                            console.error("Error parsing visibleReportFields:", e);
                        }
                    }

                    // Final filter to ensure only fields with data are shown
                    const finalFieldsToDisplay = filteredFields.filter(field =>
                        entryData[field.key] !== null && entryData[field.key] !== undefined && entryData[field.key] !== ""
                    );
                    setFieldsToDisplay(finalFieldsToDisplay);
                })
                .catch(err => console.error(err));
        }
    }, [id]);

    // ----------------------------------------------------------------------
    // CORRECTED PRINTING LOGIC
    // ----------------------------------------------------------------------
    const handlePrintWithIframe = () => {
        const printContent = document.getElementById('printable-area');
        if (!printContent) return;

        // Create and hide the iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.top = '-1000px';
        iframe.style.left = '-1000px';
        document.body.appendChild(iframe);

        if (!iframe.contentWindow) {
            document.body.removeChild(iframe);
            return;
        }

        const iframeDoc = iframe.contentWindow.document;

        // Write a complete HTML document into the iframe
        iframeDoc.open();
        iframeDoc.write('<!DOCTYPE html><html><head><title>Print Report</title>');

        // Copy all style links and style tags from the main document's head
        const headElements = document.querySelectorAll('head > link[rel="stylesheet"], head > style');
        headElements.forEach(node => {
            // Use outerHTML to get the full tag including attributes
            iframeDoc.write(node.outerHTML);
        });

        // Add body and the content to be printed
        iframeDoc.write('</head><body>');
        // Use outerHTML to copy the target div and its ID
        iframeDoc.write(printContent.outerHTML);
        iframeDoc.write('</body></html>');
        iframeDoc.close();

        // Use onload event to ensure all resources (especially styles) are loaded
        iframe.onload = () => {
            try {
                // Focus and Print
                iframe.contentWindow!.focus();
                iframe.contentWindow!.print();

                // Clean up the iframe after a short delay
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 50);
            } catch (error) {
                console.error("Error during print:", error);
                document.body.removeChild(iframe);
            }
        };

        // Note: For some browsers/configurations, the iframe might load instantly, 
        // so the onload might not fire. A fallback could be a short timeout here,
        // but onload is generally more reliable for handling resource loading.
    };
    // ----------------------------------------------------------------------
    // END OF CORRECTED PRINTING LOGIC
    // ----------------------------------------------------------------------

    if (!entry) return <div className="p-4 text-center h-screen text-white">Loading..</div>;

    // Render Function
    return (
        <div className="p-8 min-h-screen flex flex-col items-center">

            <div className="flex  mb-2  gap-4   ">
                <Button onClick={() => {
                    router.back()
                }} className="cursor-pointer   "><span><ArrowLeft /></span>Back</Button>
                <Button onClick={handlePrintWithIframe} className="cursor-pointer    ">Print</Button>
            </div>

            <div
                id="printable-area"
                ref={divRef} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                <div className="border border-gray-400 p-8">
                    <div className="flex  p-4 justify-around items-center  ">
                        <Logo width={100} height={100} />
                        <div className="text-center  ">
                            <h1 className="text-3xl font-bold text-gray-800">DIGITAL MALKHANA</h1>
                            <h2 className="text-lg font-semibold text-gray-600">Entry Detail</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {fieldsToDisplay.map(({ key, label }) => {
                            const value = entry[key];

                            // No need for null/undefined/empty check here since it's filtered in useEffect, 
                            // but keeping the logic for photoUrl and description is fine.

                            if (key === "photoUrl") {
                                return (
                                    <div key={key} className="col-span-1 md:col-span-2 text-center mt-4">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
                                        <img
                                            src={String(value)}
                                            alt="Entry Photo"
                                            className="max-h-80 mx-auto rounded-lg shadow-md"
                                        />
                                    </div>
                                );
                            }

                            if (key === "description") {
                                return (
                                    <div
                                        key={key}
                                        className="col-span-1 md:col-span-2 gap-2  flex flex-col border-b pb-2" >
                                        <span className="text-sm font-semibold">{label}:</span>
                                        <p className="text-gray-800  text-sm whitespace-pre-line">
                                            {String(value)}
                                        </p>
                                    </div>
                                );
                            }
                            return (
                                <div key={key} className="flex text-wrap flex-col border-b pb-2">
                                    <span className="text-sm flex  gap-2  font-semibold ">
                                        <h1 className="text-sm ">
                                            {label}:
                                        </h1>
                                        <h1 className="text-wrap font-semibold text-gray-800 ">
                                            {String(value)}
                                        </h1>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}