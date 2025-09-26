"use client";

import { Button } from "@/components/ui/button";
import { useSeizedVehicleStore } from "@/store/siezed-vehical/seizeStore";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";

import { useEffect, useRef, useState } from "react";

export default function EntryReportDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    // This state will now be populated by the new useEffect
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

    const handlePrint = useReactToPrint({
        //@ts-ignore
        content: () => divRef.current,
    });
    useEffect(() => {
        const getData = async () => {
            if (id) {
                try {
                    const response = await getById(id);
                    if (response.success) {
                        console.log(response.data)
                        setData(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                    // Optionally, handle the error (e.g., show a toast notification)
                }
            }
        };
        getData();
    }, [id]);

    // --- FIX APPLIED HERE ---
    // NEW: This useEffect runs after data is fetched to determine which fields to display.
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


    const handlePrintWithIframe = () => {
        // Find the div you want to print
        const printContent = document.getElementById('printable-area');
        if (!printContent) return;


        // Create a new, hidden iframe
        const iframe = document.createElement('iframe');
        if (iframe == null) {
            return
        }
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        // Get the iframe's document
        //@ts-ignore
        const iframeDoc = iframe.contentWindow.document;

        // Copy all <link> and <style> tags from the main document's <head>
        const headElements = document.querySelectorAll('head > link[rel="stylesheet"], head > style');
        headElements.forEach(node => {
            iframeDoc.head.appendChild(node.cloneNode(true));
        });

        // Set a brief timeout to ensure styles are loaded before printing
        setTimeout(() => {
            // Copy the div's HTML into the iframe's body
            iframeDoc.body.innerHTML = printContent.innerHTML;
            //@ts-ignore
            iframe.contentWindow.focus(); // Focus is needed for some browsers
            //@ts-ignore
            iframe.contentWindow.print();

            // Clean up by removing the iframe after printing
            document.body.removeChild(iframe);
        }, 500); // 500ms delay
    };

    return (
        <div className="p-8 min-h-screen flex flex-col items-center">
            <div className="flex mb-2 gap-4">
                <Button onClick={() => router.back()} className="cursor-pointer">
                    <span><ArrowLeft /></span>Back
                </Button>
                <Button onClick={handlePrintWithIframe} className="cursor-pointer">Print</Button>
            </div>
            <div ref={divRef}
                id="printable-area"
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                <div className="border border-gray-400 p-8">
                    <div className="text-center border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">DIGITAL MALKHANA</h1>
                        <h2 className="text-lg font-semibold text-gray-600">Entry Detail</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Now this map will work because fieldsToDisplay is populated */}
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
                            return (
                                <div key={key} className="flex flex-row gap-4  border-b pb-2">
                                    <span className="text-sm font-semibold ">{label}:</span>
                                    <span className="text-sm text-gray-800">{String(value)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}