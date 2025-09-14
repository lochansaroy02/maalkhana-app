"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EntryReportDetail() {
    const { id } = useParams();
    const [entry, setEntry] = useState<any>(null);

    

    const fieldOrder = [
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
        { key: "photoUrl", label: "Photo" }
    ];

    useEffect(() => {
        if (id) {
            axios.get(`/api/entry/${id}`)
                .then(res => setEntry(res.data))
                .catch(err => console.error(err));
        }
    }, [id]);



    if (!entry) return <div className="p-4 text-white">Loading...</div>;

    return (
        <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">

                <div className="border border-gray-400 p-8">

                    <div className="text-center border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">DIGITAL MALKHANA</h1>
                        <h2 className="text-lg font-semibold text-gray-600">Malkhana Entry</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-x-8 gap-y-4">
                        {fieldOrder.map(({ key, label }) => {
                            const value = entry[key];
                            if (!value || value === "null" || value === "undefined") return null;

                            // Special handling for image
                            if (key === "photoUrl") {
                                return (
                                    <div key={key} className="col-span-2 text-center">
                                        <img
                                            src={String(value)}
                                            alt="Entry Photo"
                                            className="max-h-64 mx-auto rounded shadow"
                                        />
                                    </div>
                                );
                            }
                            return (
                                <div key={key} className="flex">
                                    <span className="w-40 font-semibold text-gray-700">{label}:</span>
                                    <span className="text-gray-900">{String(value)}</span>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}
