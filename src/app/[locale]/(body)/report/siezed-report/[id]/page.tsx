"use client";

import { Button } from "@/components/ui/button";
import { useSeizedVehicleStore } from "@/store/siezed-vehical/seizeStore";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
// Removed: import { useReactToPrint } from "react-to-print";

import Logo from "@/assets/Logo";
import { useEffect, useRef, useState } from "react";

export default function EntryReportDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [fieldsToDisplay, setFieldsToDisplay] = useState<any[]>([]);

    const { getById } = useSeizedVehicleStore();

    const divRef = useRef(null);

    const allPossibleFields = [
        // --- Core Case Details ---
        { key: "firNo", label: "FIR No" },
        { key: "srNo", label: "Sr No" },
        { key: "gdNo", label: "G.D. No" },
        { key: "gdDate", label: "G.D. Date" },
        { key: "underSection", label: "Under Section" },
        { key: "policeStation", label: "Police Station" },
        { key: "caseProperty", label: "Case Property" },

        // --- Vehicle & Owner Details ---
        { key: "vehicleType", label: "Vehicle Type" },
        { key: "registrationNo", label: "Registration No" },
        { key: "engineNo", label: "Engine No" },
        { key: "colour", label: "Colour" },
        { key: "ownerName", label: "Owner's Name" },
        { key: "fathersName", label: "Father's Name" },
        { key: "address", label: "Address" },
        { key: "mobile", label: "Mobile No" },
        { key: "rtoName", label: "RTO Name" },

        // --- Seizure & Status ---
        { key: "seizedBy", label: "Seized By" },
        { key: "status", label: "Status" },
        { key: "description", label: "Description" },

        // --- Release & Return Status ---
        { key: "isRelease", label: "Is Released" },
        { key: "isReturned", label: "Is Returned" },
        { key: "receiverName", label: "Receiver's Name" },

        // --- Movement Details ---
        { key: "isMovement", label: "Is in Movement" },
        { key: "moveDate", label: "Movement Date" },
        { key: "takenOutBy", label: "Taken Out By" },
        { key: "movePurpose", label: "Purpose of Movement" },
        { key: "moveTrackingNo", label: "Movement Tracking No" },
        { key: "returnDate", label: "Return Date" },
        { key: "receivedBy", label: "Received By" },
        { key: "returnBackFrom", label: "Returned From" },

        // --- Attachments ---
        { key: "photoUrl", label: "Photo" },
        { key: "documentUrl", label: "Document" },
    ];

    // NOTE: Removed `handlePrint = useReactToPrint(...)`

    useEffect(() => {
        const getData = async () => {
            if (id) {
                try {
                    // Assuming getById fetches data
                    const response = await getById(id);
                    if (response.success) {
                        setData(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                }
            }
        };
        getData();
    }, [id, getById]);

    // This useEffect runs after data is fetched to determine which fields to display.
    useEffect(() => {
        if (data) {
            const filteredFields = allPossibleFields.filter(field => {
                const value = data[field.key];
                // Check if the value exists and is not an empty string
                return value !== null && value !== undefined && value !== "";
            });
            setFieldsToDisplay(filteredFields);
        }
    }, [data]);


    // ----------------------------------------------------------------------
    // FIXED PRINTING LOGIC (Reliable iframe method using onload)
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
    };
    // ----------------------------------------------------------------------

    if (!data) return <div className="p-4 text-center h-screen text-white">Loading..</div>;

    return (
        <div className="p-8 min-h-screen flex flex-col items-center">
            <div className="flex mb-2 gap-4">
                <Button onClick={() => router.back()} className="cursor-pointer">
                    <span><ArrowLeft /></span>Back
                </Button>
                {/* Now using the fixed iframe print handler */}
                <Button onClick={handlePrintWithIframe} className="cursor-pointer">Print</Button>
            </div>
            <div ref={divRef}
                id="printable-area"
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
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
                            const value = data[key];

                            if (key === "photoUrl") {
                                return (
                                    <div key={key} className="col-span-1 md:col-span-2 text-center mt-4">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
                                        <img
                                            src={String(value)}
                                            alt="Entry"
                                            className="max-h-80 mx-auto rounded-lg shadow-md"
                                        />
                                    </div>
                                );
                            }

                            // Handling documents as links
                            if (key === "documentUrl") {
                                return (
                                    <div key={key} className="col-span-1 md:col-span-2 text-center mt-4">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
                                        <a
                                            href={String(value)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            View Document
                                        </a>
                                    </div>
                                );
                            }

                            return (
                                <div key={key} className="flex flex-row gap-4  border-b pb-2">
                                    <span className="text-sm font-semibold ">{label}:</span>
                                    {/* Using flex-wrap to handle long content */}
                                    <span className="text-sm text-gray-800 flex-wrap">{String(value)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}