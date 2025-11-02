// pages/Page.tsx (The Report Page component)
"use client";

import InputComponent from "@/components/InputComponent";
import Report from "@/components/Report";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import UploadModal from "@/components/UploadModal";
import { useAuthStore } from "@/store/authStore";
import { useDistrictStore } from "@/store/districtStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { useSearchStore } from "@/store/searchStore";
import { useOpenStore } from "@/store/store";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Define a type for the data entries to improve type safety
interface MaalkhanaEntry {
    id?: string;
    firNo: string;
    srNo: string;
    caseProperty: string;
    underSection: string;
    policeStation: string;
    entryType?: string;
    gdNo?: string;
    gdDate?: string;
    Year?: string;
    vadiName?: string;
    isMovement?: boolean;
    moveDate?: string;
    takenOutBy?: string;
    movePurpose?: string;
    moveTrackingNo?: string;
    isRelease?: boolean;
    courtName?: string;
    courtNo?: string;
    boxNo?: string;
    releaseItemName?: string;
    fathersName?: string;
    address?: string;
    receiverName?: string;
    status?: string;
    description?: string;
    isReturned?: boolean;
    returnDate?: string;
    receivedBy?: string;
    returnBackFrom?: string;
}

const statusOptions = [
    { label: 'Distroy', value: 'destroy' },
    { label: 'Nilami', value: 'nilami' },
    { label: 'Pending', value: 'pending' },
    { label: 'On court', value: 'onCourt' },
    { label: 'Other', value: 'other' },

];
const entryTypeOptions = [
    { label: 'malkhana Entry', value: 'malkhana' },
    { label: 'FSL', value: 'fsl' },
    { label: 'Kurki', value: 'kurki' },
    { label: 'Wine/Daru', value: 'wine' },
    { label: 'Cash Entry', value: 'cash' },
    { label: 'Unclaimed', value: 'unclaimed' },


];
// Define a type for the report data and headers
type ReportData = {
    data: MaalkhanaEntry[]; // Use MaalkhanaEntry[] for type safety
    headers: string[];
};

// Define the fields to be included in the keyword search
const SEARCHABLE_FIELDS: (keyof MaalkhanaEntry)[] = [
    "firNo", "srNo", "description", "entryType", "policeStation", "caseProperty", "vadiName"
];

const Page = () => {
    const { reportType, setReportType } = useOpenStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore();
    const { entries, fetchMaalkhanaEntry, addMaalkhanaEntry } = useMaalkhanaStore();
    const { year, searchData } = useSearchStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null); // Kept for reference but not used in the current filter logic

    // Updated state for dropdown filters
    const [selectedEntryTypes, setSelectedEntryTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const searchParams = useSearchParams();

    // State for the keyword search input
    const [keyword, setKeyword] = useState<string>('');


    // Set initial report type from URL on component mount
    useEffect(() => {
        const urlReportType = searchParams.get('reportType');
        if (urlReportType && urlReportType !== reportType) {
            setReportType(urlReportType);
        }
    }, [searchParams, reportType, setReportType]);


    // Fetch data on component mount and user/userId changes
    useEffect(() => {
        if (user?.role === "policeStation" && user?.id) {
            fetchMaalkhanaEntry(user.id);
        } else if (userId) {
            fetchMaalkhanaEntry(userId);
        }
    }, [user?.id, fetchMaalkhanaEntry, userId, user?.role]);

    // Define all report-related logic within a useMemo hook for performance
    const reportContent: ReportData = useMemo(() => {
        let filteredData: MaalkhanaEntry[] = [...entries];
        let headers: string[] = [];

        // Determine base data and headers based on reportType
        switch (reportType) {
            case "movement":
                filteredData = entries.filter(entry => entry.isMovement);
                headers = ["FIR No", "Sr No", "Case Property", "Under Section", "Police Station", "Move Date", "Taken Out By", "Move Purpose", "Move Tracking No"];
                break;
            case "release":
                filteredData = entries.filter(entry => entry.isRelease);
                headers = ["FIR No", "Sr No", "Case Property", "Under Section", "Court Name", "Court No", "Box No", "Release Date", "Release Item Name", "Father's Name", "Address", "Receiver Name"];
                break;
            case "destroy":
                filteredData = entries.filter(entry => entry.status?.toLowerCase() === 'destroy');
                headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                break;
            case "return":
                filteredData = entries.filter(entry => entry?.isReturned);
                headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                break;
            case "nilami":
                // NOTE: The original code for 'nilami' had headers that seemed more related to 'return'. Using general headers here.
                filteredData = entries.filter(entry => entry.status?.toLowerCase() === 'nilami');
                headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                break;
            default:
                filteredData = entries;
                headers = ["FIR No", "Sr No", "Entry Type", "underSection", "Description", "Case Property", "GD No", "GD Date", "Year", "Police Station", "HM", "Vadi Name", "IOName", "box No", "court No", "court Name"];
                break;
        }

        // --- Apply Filters: Year, Entry Type, Status, and Keyword Search ---

        // 1. Apply year filter (as in original code)
        if (year?.from || year?.to) {
            const fromYear = year.from ? parseInt(year.from, 10) : null;
            const toYear = year.to ? parseInt(year.to, 10) : null;
            filteredData = filteredData.filter(item => {
                const entryYear = item.Year ? parseInt(item.Year) : null;
                if (!entryYear) return false;
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

        // 2. Filter by selected Entry Types (Dropdown 1)
        if (selectedEntryTypes.length > 0) {
            const selectedValuesLower = selectedEntryTypes.map(v => v.toLowerCase());
            filteredData = filteredData.filter(item =>
                item.entryType && selectedValuesLower.includes(item.entryType.toLowerCase())
            );
        }

        // 3. Filter by selected Statuses (Dropdown 2)
        if (selectedStatuses.length > 0) {
            const selectedValuesLower = selectedStatuses.map(v => v.toLowerCase());
            filteredData = filteredData.filter(item =>
                item.status && selectedValuesLower.includes(item.status.toLowerCase())
            );
        }

        // 4. Apply Keyword Search
        const lowerCaseKeyword = keyword.trim().toLowerCase();
        if (lowerCaseKeyword.length > 0) {
            filteredData = filteredData.filter(entry => {
                // Check if the keyword matches any of the searchable fields
                return SEARCHABLE_FIELDS.some(field => {
                    const value = entry[field as keyof MaalkhanaEntry];
                    return value && String(value).toLowerCase().includes(lowerCaseKeyword);
                });
            });
        }

        // 5. Apply searchData filter (overrides all other filters if present)
        if (searchData.length > 0) {
            // Assuming searchData is already filtered and formatted correctly
            // NOTE: searchData is an array of 'any', so a type assertion is needed here.
            return { data: searchData as MaalkhanaEntry[], headers: headers };
        }

        return { data: filteredData, headers: headers };
    }, [reportType, entries, year, searchData, selectedEntryTypes, selectedStatuses, keyword]);


    const handleImportSuccess = () => {
        if (user?.id) {
            fetchMaalkhanaEntry(user.id);
        }
    };


    return (
        <>
            <div className="p-4 mx-2 glass-effect">
                <div className="flex flex-wrap gap-4 items-center">
                    <h1 className="text-lg font-semibold text-white">Filter:</h1>

                    {/* Entry Type Filter */}
                    <MultiSelectDropdown
                        label="Entry Type"
                        options={entryTypeOptions}
                        selectedValues={selectedEntryTypes}
                        onChange={setSelectedEntryTypes} // Correctly sets selectedEntryTypes
                    />

                    {/* Status Filter */}
                    <MultiSelectDropdown
                        label="Status"
                        options={statusOptions}
                        selectedValues={selectedStatuses}
                        onChange={setSelectedStatuses} // Correctly sets selectedStatuses
                    />

                    {/* Keyword Search Input */}
                    <div className="flex gap-4 ">
                        <InputComponent
                            id="search"
                            //@ts-ignore
                            placeholder={`Search: ${SEARCHABLE_FIELDS.join(', ')}`}
                            value={keyword}
                            // Updates the keyword state on change, which triggers the useMemo hook
                            setInput={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Report
                data={reportContent.data}
                headers={reportContent.headers}
                onImportClick={() => setIsModalOpen(true)}
                heading="Malkhana Data"
                detailsPathPrefix="/report/entry-report"
            />

            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="entry"
                onSuccess={handleImportSuccess}
                addEntry={addMaalkhanaEntry as any}
            />
        </>
    );
};

export default Page;