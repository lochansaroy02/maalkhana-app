"use client";

import { useEffect, useState } from "react";

// This component is now designed to be a dedicated print page.
export default function PrintReportPage() {
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
        { key: "description", label: "Description" },
        { key: "photoUrl", label: "Photo" }
    ];

    // This hook runs once when the page loads
    useEffect(() => {
        // 1. Get the data from sessionStorage
        const storedData = sessionStorage.getItem('printableEntryData');

        if (storedData) {
            const parsedData = JSON.parse(storedData);

            // Optional: Format date for better readability
            if (parsedData.gdDate) {
                parsedData.gdDate = new Date(parsedData.gdDate).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });
            }

            // 2. Set the data for rendering
            setEntry(parsedData);

            // 3. Trigger the print dialog after a short delay
            // The delay ensures the page content is fully rendered before printing.
            const timer = setTimeout(() => {
                window.print();
            }, 500);

            // Cleanup function to remove data and clear timer
            return () => {
                clearTimeout(timer);
                sessionStorage.removeItem('printableEntryData');
            };
        }
    }, []); // Empty array means this runs only once on mount

    if (!entry) {
        // You can show a loading message or just a blank page
        return <div className="p-4 text-center">Preparing print document...</div>;
    }

    return (
        // The JSX for your report layout remains the same
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
                            if (!value) return null;

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
                                    <span className="w-40 font-semibold text-gray-700 shrink-0">{label}:</span>
                                    <span className="text-gray-900 break-words">{String(value)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}