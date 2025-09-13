"use client";

import Report from "@/components/Report";
import { Checkbox } from "@/components/ui/checkbox";
import UploadModal from "@/components/UploadModal";
import { useAuthStore } from "@/store/authStore";
import { useDistrictStore } from "@/store/districtStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { useSearchStore } from "@/store/searchStore";
import { useOpenStore } from "@/store/store";
import { useEffect, useState } from "react";

const casePropertyOptions = [
    "malkhana Entry", "FSL", "Kurki", "Other Entry", "Cash Entry", "Wine/Daru", "Unclaimed Entry",
    "Yellow Item"
];

const Page = () => {
    const { reportType } = useOpenStore();
    const { user, } = useAuthStore();
    const { userId } = useDistrictStore()
    const { entries, fetchMaalkhanaEntry, addMaalkhanaEntry } = useMaalkhanaStore();
    const { year } = useSearchStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null);
    const [displayData, setDisplayData] = useState<any[]>([]);


    useEffect(() => {

        if (user?.role === "policeStation") {
            if (user?.id) {
                fetchMaalkhanaEntry(user.id);
            }
        } else {
            fetchMaalkhanaEntry(userId)
        }
    }, [user?.id, fetchMaalkhanaEntry, userId]);

    // Helper function to create a new object with only specified fields
    const selectFields = (entries: any[], fields: string[]) => {
        return entries.map((entry) => {
            const newEntryObject: { [key: string]: any } = {};
            fields.forEach(field => {
                if (entry[field] !== undefined) {
                    newEntryObject[field] = entry[field];
                }
            });
            return newEntryObject;
        });
    };

    // Filters for movement entries
    const filterByMovement = (allEntries: any[]) => {
        const fieldsToShow = ["id", 'firNo', 'srNo', 'caseProperty', 'underSection', 'policeStation', '', 'moveDate', 'takenOutBy', 'movePurpose', 'moveTrackingNo'];
        const movementEntries = allEntries.filter(entry => entry.isMovement === true);
        return selectFields(movementEntries, fieldsToShow);
    };

    // Filters for release entries
    const filterByRelease = (allEntries: any[]) => {
        const fieldsToShow = ['firNo', 'srNo', 'caseProperty', 'underSection', 'courtName', 'courtNo', 'boxNo', 'releaseItemName', 'fathersName', 'address', 'receiverName'];
        const releaseEntries = allEntries.filter(entry => entry.isRelease === true);
        return selectFields(releaseEntries, fieldsToShow);
    };

    // Filters for destroyed entries
    const filterByDestroy = (allEntries: any[]) => {
        const fieldsToShow = ['id', 'firNo', 'srNo', 'status', 'caseProperty', 'description'];
        const destroyEntries = allEntries.filter(entry => entry.status?.toLowerCase() === 'destroy');
        return selectFields(destroyEntries, fieldsToShow);
    };

    // Filters for returned entries
    const filterByReturn = (allEntries: any[]) => {
        const fieldsToShow = ['id', 'firNo', 'srNo', 'returnDate', 'receivedBy', 'returnBackFrom', 'isReturned'];
        const returnEntries = allEntries.filter(entry => entry.isReturned === true);
        return selectFields(returnEntries, fieldsToShow);
    };
    const filterbyMalkhana = (allEntries: any[]) => {
        const fieldsToShow = ['firNo', 'srNo', 'entryType', 'caseProperty', 'gdNo', 'gdDate', 'Year', 'policeStation', 'vadiName'];
        const returnEntries = allEntries.filter(entry => entry.isReturned === true);
        return selectFields(returnEntries, fieldsToShow);
    };


    const { searchData } = useSearchStore()

    useEffect(() => {
        setDisplayData(searchData)
    }, [searchData])




    useEffect(() => {
        let filteredData = [...entries];

        if (reportType === "movement") {
            //@ts-ignore
            filteredData = filterByMovement(entries);
        } else if (reportType === "release") {

            //@ts-ignore
            filteredData = filterByRelease(entries);
        } else if (reportType === "destroy") {
            //@ts-ignore
            filteredData = filterByDestroy(entries);
        } else if (reportType === "return") {
            //@ts-ignore
            filteredData = filterByReturn(entries);
        }

        // Step 2: Further filter the result by the selected case property checkbox.
        if (selectedCaseProperty) {
            filteredData = filteredData.filter(
                (item) => item.entryType?.toLowerCase() === selectedCaseProperty.toLowerCase()
            );
        }
        if (year?.from || year?.to) {
            const fromYear = year.from ? parseInt(year.from, 10) : null;
            const toYear = year.to ? parseInt(year.to, 10) : null;

            filteredData = filteredData.filter((item) => {
                if (!item.Year) return false;

                const entryYear = parseInt(item.Year)
                if (fromYear && !toYear) {
                    return entryYear === fromYear;
                }
                if (fromYear && toYear) {
                    return entryYear >= fromYear && entryYear <= toYear;
                }
                if (!fromYear && toYear) {
                    return entryYear <= toYear;
                }

                return true;
            });
        }



        setDisplayData(filteredData);


    }, [reportType, selectedCaseProperty, entries, year]);
    const handleImportSuccess = () => {
        if (user?.id) {
            fetchMaalkhanaEntry(user.id);
        }
    };



    return (
        <>
            {/* Filter Section */}
            <div className="p-4  mx-2  glass-effect">
                <div className="flex  flex-wrap gap-4 items-center">
                    <h1 className="text-lg font-semibold text-white">Filter by Entry Type:</h1>
                    {casePropertyOptions.map((property) => (
                        <div key={property} className="flex items-center space-x-2">
                            <Checkbox
                                id={`checkbox-${property}`}
                                checked={selectedCaseProperty?.toLowerCase() === property.toLowerCase()}
                                onCheckedChange={(checked) =>
                                    setSelectedCaseProperty(checked ? property : null)
                                }
                            />
                            <label htmlFor={`checkbox-${property}`} className="text-blue-100 capitalize cursor-pointer">{property}</label>
                        </div>
                    ))}
                </div>
            </div>

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
