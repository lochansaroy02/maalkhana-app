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
    // CHANGED: We only need `entries` and the fetch function now.
    const { entries, fetchMaalkhanaEntry, addMaalkhanaEntry } = useMaalkhanaStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null);
    const [displayData, setDisplayData] = useState<any[]>([]);

    // NEW: Fetch all data when the component first loads.
    useEffect(() => {
        if (user?.id) {
            fetchMaalkhanaEntry(user.id);
        }
    }, [user?.id, fetchMaalkhanaEntry]);

    // CHANGED: Reworked filtering logic to use a single data source.
    useEffect(() => {
        let filteredData = [...entries]; // Start with all available entries.

        // Step 1: Filter based on the global report type (movement, release, etc.)
        // This assumes your entry objects have properties to identify them as such.
        if (reportType === "movement") {


            filteredData = filterByMovement(entries)
        } else if (reportType === "release") {

            filteredData = filterByRelease(entries)
        }

        if (selectedCaseProperty) {
            filteredData = filteredData.filter(
                (item) => item.entryType?.toLowerCase() === selectedCaseProperty.toLowerCase()
            );
        }

        setDisplayData(filteredData);

    }, [reportType, selectedCaseProperty, entries]); // Re-run this logic whenever a filter changes.

    const handleImportSuccess = () => {
        if (user?.id) {
            // Refresh data after a successful import.
            fetchMaalkhanaEntry(user.id);
        }
    };
    console.log(entries)
    /**
   * Filters an array of entries to select only movement-related data
   * and returns new objects with a specific set of fields.
   *
   * @param {Array<Object>} allEntries - The full array of entry data.
   * @returns {Array<Object>} A new array containing only the selected fields for movement entries.
   */
    const filterByMovement = (allEntries: any) => {

        const fieldsToShow = [
            "id",
            'firNo',
            'srNo',
            'moveDate',
            'takenOutBy',
            'movePurpose',
            'moveTrackingNo'
        ];


        const movementEntries = allEntries.filter((entry: any) => entry.movePurpose);


        const selectedFieldsData = movementEntries.map((entry: any) => {
            const newEntryObject = {};
            fieldsToShow.forEach(field => {
                if (entry[field] !== undefined) {
                    //@ts-ignore
                    newEntryObject[field] = entry[field];
                }
            });
            return newEntryObject;
        });

        console.log(selectedFieldsData)
        return selectedFieldsData;
    };

    /**
 * Filters an array of entries to select only release-related data
 * and returns new objects with a specific set of fields.
 *
 * @param {Array<Object>} allEntries - The full array of entry data.
 * @returns {Array<Object>} A new array containing only the selected fields for release entries.
 */
    const filterByRelease = (allEntries: any) => {
        const releaseStatuses = ['destroy', 'on court', 'nilami'];

        const fieldsToShow = [
            'id',
            'firNo',
            'srNo',
            'status',
            'caseProperty',
            'courtName',
            'courtNo',
            'boxNo'
        ];


        const releaseEntries = allEntries.filter((entry: any) =>
            entry.status && releaseStatuses.includes(entry.status.toLowerCase())
        );

        const selectedFieldsData = releaseEntries.map((entry: any) => {
            const newEntryObject = {};
            fieldsToShow.forEach(field => {
                if (entry[field] !== undefined) {
                    //@ts-ignore
                    newEntryObject[field] = entry[field];
                }
            });
            return newEntryObject;
        });

        return selectedFieldsData;
    };
    return (
        <>
            {/* Filter Section (No changes needed here) */}
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

            {/* Report Table (No changes needed here) */}
            <Report
                data={displayData}
                onImportClick={() => setIsModalOpen(true)}
                heading="Maalkhana Data"
                detailsPathPrefix="/report/entry-report"
            />

            {/* Upload Modal (No changes needed here) */}
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