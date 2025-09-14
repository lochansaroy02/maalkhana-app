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
        { key: "photoUrl", label: "Photo" },

        // Movement Report Fields (NEWLY ADDED)
        { key: "moveDate", label: "Move Date" },
        { key: "takenOutBy", label: "Taken Out By" },
        { key: "movePurpose", label: "Move Purpose" },
        { key: "moveTrackingNo", label: "Move Tracking No" },
        { key: "returnDate", label: "Return Date" },
        { key: "receivedBy", label: "Received By" },
        { key: "returnBackFrom", label: "Return Back From" }
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




    if (!entry) return <div className="p-4 text-center text-white">this is ...</div>;


    return (
        <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
            <div className="flex  mb-2  gap-4   ">
                <Button onClick={() => {
                    router.back()
                }} className="cursor-pointer   "><span><ArrowLeft /></span>Back</Button>
                <Button className="cursor-pointer    ">Print</Button>
            </div>
            <div ref={divRef} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
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
                            return (
                                <div key={key} className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-semibold text-gray-600">{label}:</span>
                                    <span className="text-gray-900 text-lg">{String(value)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

        </div>
    );
}