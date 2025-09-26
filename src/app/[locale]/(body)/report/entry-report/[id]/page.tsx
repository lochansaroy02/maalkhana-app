"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";



export default function EntryReportDetail() {
    const { id } = useParams();
    const router = useRouter()
    const [entry, setEntry] = useState<any>(null);
    const [fieldsToDisplay, setFieldsToDisplay] = useState<any[]>([]);




    const divRef = useRef(null)





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

    useEffect(() => {
        if (id) {
            axios.get(`/api/entry/${id}`)
                .then(res => {
                    const entryData = res.data;
                    setEntry(entryData);

                    const storedFieldsJson = sessionStorage.getItem('visibleReportFields');

                    if (storedFieldsJson) {
                        try {
                            const visibleKeys = JSON.parse(storedFieldsJson);
                            const filteredFields = allPossibleFields.filter(field =>
                                // Also check if the entry actually has data for this key
                                visibleKeys.includes(field.key) && entryData[field.key]
                            );
                            setFieldsToDisplay(filteredFields);

                        } catch (e) {
                            setFieldsToDisplay(allPossibleFields);
                        }
                    } else {
                        setFieldsToDisplay(allPossibleFields);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [id]);



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


    if (!entry) return <div className="p-4 text-center h-screen text-white">Loading..</div>;


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
                    <div className="text-center border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">DIGITAL MALKHANA</h1>
                        <h2 className="text-lg font-semibold text-gray-600">Entry Detail</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {fieldsToDisplay.map(({ key, label }) => {
                            const value = entry[key];

                            // This check is good, but the main filtering happens in useEffect
                            if (value === null || value === undefined || value === "") return null;

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