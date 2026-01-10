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
    isDestroy?: boolean,
    returnBackFrom?: string;
    isNilami?: Boolean
    nilamiOrderedBy?: String
    nilamiValue?: String
    nilamiDate?: String
    nilamiItemName?: String


}

const statusOptions = [
    { label: 'Distroy', value: 'destroy' },
    { label: 'Nilami', value: 'nilami' },
    { label: 'Pending', value: 'pending' },
    { label: 'On court', value: 'onCourt' },
    { label: 'Other', value: 'other' },

];
const entryTypeOptions = [
    { label: 'Malkhana Entry', value: 'malkhana' },
    { label: 'FSL', value: 'fsl' },
    { label: 'Kurki', value: 'kurki' },
    { label: 'Wine/Daru', value: 'wine' },
    { label: 'Cash Entry', value: 'cash' },
    { label: 'Unclaimed', value: 'unclaimed' },
];


const reportTypeOptions = ["movement", "release", "return", "nilami"].map(item => ({ // Added destroy and nilami back for completeness, matching switch logic
    value: item,
    label: item.charAt(0).toUpperCase() + item.slice(1) // Capitalize first letter for better display
}));

// Define a type for the report data and headers
type ReportData = {
    data: MaalkhanaEntry[];
    headers: string[];
};

// Define the fields to be included in the keyword search
const SEARCHABLE_FIELDS: (keyof MaalkhanaEntry)[] = [
    "firNo", "srNo", "Year", "description", "entryType", "policeStation", "caseProperty", "vadiName", "status"
];

// Map of dropdown value to potential Hindi values in the data (extend as needed)
const HINDI_VALUE_MAP: Record<string, string[]> = {
    'malkhana': ['मालखाना'],
    'pending': ['']
    // Add other mappings if other values can be in Hindi
};

const Page = () => {
    const { reportType, setReportType } = useOpenStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore();
    const { entries, fetchMaalkhanaEntry, addMaalkhanaEntry } = useMaalkhanaStore();
    const { year, searchData } = useSearchStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Updated state for dropdown filters
    const [selectedEntryTypes, setSelectedEntryTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    // NEW state for the Type filter
    const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);

    const searchParams = useSearchParams();

    // State for the keyword search input
    const [keyword, setKeyword] = useState<string>('');


    // Set initial report type from URL on component mount
    useEffect(() => {
        const urlReportType = searchParams.get('reportType');
        if (urlReportType && urlReportType !== reportType) {
            setReportType(urlReportType);
            // Also set the MultiSelectDropdown state for the report type from URL
            setSelectedReportTypes([urlReportType]);
        }
    }, [searchParams, reportType, setReportType]);


    // Fetch data on component mount and user/userId changes
    useEffect(() => {

        if (user?.role === "policeStation" && user?.id) {
            fetchMaalkhanaEntry(user.id, user.role);
        } else if (user && userId) {
            fetchMaalkhanaEntry(userId, user.role);
        } else if (user?.role === "asp" && user?.id) {
            fetchMaalkhanaEntry(user.districtId, user.role);
        }
    }, [user?.id, fetchMaalkhanaEntry, userId, user?.role]);

    // Define all report-related logic within a useMemo hook for performance
    const reportContent: ReportData = useMemo(() => {
        let filteredData: MaalkhanaEntry[] = [...entries];
        let headers: string[] = [];

        // Use a temporary variable to hold the combined report types for filtering
        const activeReportTypes = [...new Set([...selectedReportTypes, reportType].filter(t => t && t.toLowerCase() !== 'all'))];

        // Determine base data and headers based on reportType from URL/store (default filter)
        // This primarily sets the headers and a base filter if only the URL/store reportType is set.
        switch (reportType) {
            case "movement":
                // Don't pre-filter here if we are going to use the MultiSelect filter later.
                // We'll primarily use this to set the headers.
                headers = ["FIR No", "Sr No", "Case Property", "Under Section", "Police Station", "Move Date", "Taken Out By", "Move Purpose", "Move Tracking No"];
                break;
            case "release":
                headers = ["FIR No", "Sr No", "Case Property", "Under Section", "Court Name", "Court No", "Box No", "Release Date", "Release Item Name", "Father's Name", "Address", "Receiver Name"];
                break;
            case "destroy":
                headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                break;
            case "return":
                headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                break;
            case "nilami":
                headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                break;
            default:
                // Default headers for "All"
                headers = ["FIR No", "Sr No", "Entry Type", "Status", "underSection", "Description", "Case Property", "GD No", "GD Date", "Year", "Police Station", "HM", "Vadi Name", "IOName", "box No", "court No", "court Name"];
                break;
        }

        // --- Apply Filters: Year, Entry Type, Status, Keyword Search, and **Report Type** ---

        // 0. Apply Report Type Filter (Movement, Release, Return, Destroy, Nilami)
        if (activeReportTypes.length > 0) {
            filteredData = filteredData.filter(entry => {
                return activeReportTypes.some(type => {
                    const lowerType = type.toLowerCase();
                    switch (lowerType) {
                        case "movement":
                            return entry.isMovement === true;
                        case "release":
                            return entry.isRelease === true;
                        case "return":
                            return entry.isReturned === true;
                        case "destroy":
                            return entry.status?.toLowerCase() === 'destroy';
                        case "destroy":
                            return entry.isDestroy === true;
                        case "nilami":
                            return entry.isNilami === true;
                        default:
                            return false; // Ignore unknown types
                    }
                });
            });
        }


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

        // 2. Filter by selected Entry Types (Dropdown 1) - Enhanced for Hindi/Case Insensitivity
        if (selectedEntryTypes.length > 0) {
            filteredData = filteredData.filter(item => {
                const itemEntryType = item.entryType;
                if (!itemEntryType) return false;

                const itemEntryTypeLower = itemEntryType.toLowerCase();

                return selectedEntryTypes.some(selectedValue => {
                    const selectedValueLower = selectedValue.toLowerCase();

                    // Check for direct match (case-insensitive)
                    if (itemEntryTypeLower === selectedValueLower) {
                        return true;
                    }

                    // Check for Hindi/Alternate value match
                    if (HINDI_VALUE_MAP[selectedValueLower]) {
                        return HINDI_VALUE_MAP[selectedValueLower].includes(itemEntryType);
                    }

                    return false;
                });
            });
        }

        // 3. Filter by selected Statuses (Dropdown 2) - Case Insensitivity
        if (selectedStatuses.length > 0) {
            const selectedValuesLower = selectedStatuses.map(v => v.toLowerCase());
            filteredData = filteredData.filter(item =>
                item.status && selectedValuesLower.includes(item.status.toLowerCase())
            );
        }

        // 4. Apply Keyword Search - Case Insensitivity
        const lowerCaseKeyword = keyword.trim().toLowerCase();
        if (lowerCaseKeyword.length > 0) {
            filteredData = filteredData.filter(entry => {
                // Check if the keyword matches any of the searchable fields
                return SEARCHABLE_FIELDS.some(field => {
                    const value = entry[field as keyof MaalkhanaEntry];
                    // Handle potential number/string conversion and case insensitivity
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
    }, [reportType, entries, year, searchData, selectedEntryTypes, selectedStatuses, keyword, selectedReportTypes]);


    const handleImportSuccess = () => {
        if (user?.id) {
            fetchMaalkhanaEntry(user.id, user.role);
        }
    };


    return (
        <>
            <div className="p-4 mx-2 flex gap-3  glass-effect">
                <h1 className="text-lg font-semibold text-white">Filter:</h1>
                <div className="flex flex-wrap gap-4  w-full  justify-between items-center">

                    <div className="flex gap-2 items-center">

                        {/* Entry Type Filter (Checkbox Dropdown functionally) */}
                        <MultiSelectDropdown
                            label="Entry Type"
                            options={entryTypeOptions}
                            selectedValues={selectedEntryTypes}
                            onChange={setSelectedEntryTypes} // Correctly sets selectedEntryTypes
                        />

                        {/* Status Filter (Checkbox Dropdown functionally) */}
                        <MultiSelectDropdown
                            label="Status"
                            options={statusOptions}
                            selectedValues={selectedStatuses}
                            onChange={setSelectedStatuses} // Correctly sets selectedStatuses
                        />

                        {/* Type Filter (New) - This now uses selectedReportTypes */}
                        <MultiSelectDropdown
                            label="Type"
                            options={reportTypeOptions}
                            selectedValues={selectedReportTypes}
                            onChange={setSelectedReportTypes} // Correctly sets selectedReportTypes
                        />
                    </div>

                    {/* Keyword Search Input */}
                    <div className="flex gap-4 ">
                        <InputComponent
                            label="search"
                            //@ts-ignore
                            placeholder={`Search: ${SEARCHABLE_FIELDS.join(', ')}`}
                            value={keyword}
                            isLabel={false}
                            // Updates the keyword state on change, which triggers the useMemo hook
                            setInput={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>
            </div>


            {user?.role !== 'asp' && <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="entry"
                onSuccess={handleImportSuccess}
                addEntry={addMaalkhanaEntry as any}
            />}
            <Report
                data={reportContent.data}
                headers={reportContent.headers}
                onImportClick={() => setIsModalOpen(true)}
                heading="Malkhana Data"
                detailsPathPrefix="/report/entry-report"
            />

        </>
    );
};

export default Page;