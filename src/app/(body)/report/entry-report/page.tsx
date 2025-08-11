"use client";

import Report from "@/components/Report";
import { Checkbox } from "@/components/ui/checkbox";
import UploadModal from "@/components/UploadModal";
import { useAuthStore } from "@/store/authStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { useOpenStore } from "@/store/store";
import { useEffect, useState } from "react";

const casePropertyOptions = [
    "malkhana Entry", "FSL", "Kukri", "Other Entry", "Cash Entry", "Wine/Daru", "Unclaimed Entry",
];

const Page = () => {
    const { reportType } = useOpenStore();
    const { user } = useAuthStore();
    // We only need the data arrays and add function from the store now
    const { entries, movementData, releaseData, addMaalkhanaEntry, fetchMaalkhanaEntry } = useMaalkhanaStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null);
    const [displayData, setDisplayData] = useState<any[]>([]);

    // REMOVED the data fetching useEffect from here.

    // This useEffect now only filters data that is already in the store.
    useEffect(() => {
        let sourceData = [];

        if (reportType === "movement") {
            sourceData = movementData;
        } else if (reportType === "release") {
            sourceData = releaseData || []; // Use releaseData
        } else {
            sourceData = entries;
        }

        if (selectedCaseProperty) {
            const filtered = sourceData.filter(
                (item) => item.entryType?.toLowerCase() === selectedCaseProperty.toLowerCase()
            );
            setDisplayData(filtered);
        } else {
            setDisplayData(sourceData);
        }

    }, [reportType, selectedCaseProperty, entries, movementData, releaseData]);

    const handleImportSuccess = () => {
        if (user?.id) {
            // You can still call fetch here to refresh data after an import
            fetchMaalkhanaEntry(user.id);
        }
    };

    return (
        <>
            {/* Filter Section */}
            <div className="p-4 glass-effect">
                <div className="flex flex-wrap gap-4 items-center">
                    <h1 className="text-lg font-semibold text-white">Filter by Entry Type:</h1>
                    {casePropertyOptions.map((property) => (
                        <div key={property} className="flex items-center space-x-2">
                            <Checkbox
                                checked={selectedCaseProperty?.toLowerCase() === property.toLowerCase()}
                                onCheckedChange={(checked) =>
                                    setSelectedCaseProperty(checked ? property : null)
                                }
                            />
                            <label className="text-blue-100 capitalize">{property}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Report Table */}
            <Report
                data={displayData}
                onImportClick={() => setIsModalOpen(true)}
                heading="Maalkhana Data"
                detailsPathPrefix="/report/entry-report"
            />

            {/* Upload Modal */}
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="entry"
                onSuccess={handleImportSuccess}
                //@ts-ignore
                addEntry={addMaalkhanaEntry}
            />
        </>
    );
};

export default Page;