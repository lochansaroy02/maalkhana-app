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

// --- CONFIGURATION: ADD OR REMOVE HEADERS HERE ---
const HEADER_CONFIG: Record<string, string[]> = {
    movement: ["FIR No", "Sr No", "Status", "Case Property", "Under Section", "Police Station", "Move Date", "Taken Out By", "Move Purpose", "Move Tracking No"],
    release: ["FIR No", "Sr No", "Status", "Case Property", "Under Section", "Court Name", "Court No", "Box No", "Release Date", "Release Item Name", "Father's Name", "Address", "Receiver Name"],
    destroy: ["FIR No", "Sr No", "Status", "Case Property", "Description", "Destroy Ordered By", "Destroy Date"],
    return: ["FIR No", "Sr No", "Status", "Case Property", "Description", "Return Date", "Received By"],
    nilami: ["FIR No", "Sr No", "Status", "Case Property", "Description", "Nilami Date", "Nilami Value", "Nilami Ordered By"],
    all: ["FIR No", "Sr No", "Entry Type", "Status", "underSection", "Description", "Case Property", "GD No", "GD Date", "Year", "Police Station", "HM", "Vadi Name", "IOName", "box No", "court No", "court Name"]
};

interface MaalkhanaEntry {
    [key: string]: any; // Allows dynamic access for search and headers
}

const statusOptions = [
    { label: 'Destroy', value: 'destroy' },
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

const reportTypeOptions = ["movement", "release", "return", "nilami", "destroy"].map(item => ({
    value: item,
    label: item.charAt(0).toUpperCase() + item.slice(1)
}));

const SEARCHABLE_FIELDS = ["firNo", "srNo", "Year", "description", "entryType", "policeStation", "caseProperty", "vadiName", "status"];

const HINDI_VALUE_MAP: Record<string, string[]> = {
    'malkhana': ['मालखाना'],
    'pending': ['लंबित']
};

const Page = () => {
    const { reportType, setReportType } = useOpenStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore();
    const { entries, fetchMaalkhanaEntry, addMaalkhanaEntry } = useMaalkhanaStore();
    const { year, searchData } = useSearchStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedEntryTypes, setSelectedEntryTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);

    const searchParams = useSearchParams();
    const [keyword, setKeyword] = useState<string>('');

    useEffect(() => {
        const urlReportType = searchParams.get('reportType');
        if (urlReportType) {
            setReportType(urlReportType);
            if (urlReportType !== 'all') {
                setSelectedReportTypes([urlReportType]);
            }
        }
    }, [searchParams, setReportType]);

    useEffect(() => {
        if (user?.role === "policeStation" && user?.id) {
            fetchMaalkhanaEntry(user.id, user.role);
        } else if (user && userId) {
            fetchMaalkhanaEntry(userId, user.role);
        } else if (user?.role === "asp" && user?.id) {
            fetchMaalkhanaEntry(user.districtId, user.role);
        }
    }, [user?.id, fetchMaalkhanaEntry, userId, user?.role]);

    const reportContent = useMemo(() => {
        let filteredData = [...entries];

        // 1. Filter by Report Types (Movement, Release, etc.)
        if (selectedReportTypes.length > 0) {
            filteredData = filteredData.filter(entry => {
                return selectedReportTypes.some(type => {
                    switch (type.toLowerCase()) {
                        case "movement": return entry.isMovement === true;
                        case "release": return entry.isRelease === true;
                        case "return": return entry.isReturned === true;
                        case "destroy": return entry.isDestroy === true || entry.status?.toLowerCase() === 'destroy';
                        case "nilami": return entry.status === "nilami" || entry.isNilami === true;
                        default: return true;
                    }
                });
            });
        }

        // 2. Filter by Year
        if (year?.from || year?.to) {
            const fromYear = year.from ? parseInt(year.from, 10) : null;
            const toYear = year.to ? parseInt(year.to, 10) : null;
            filteredData = filteredData.filter(item => {
                const entryYear = item.Year ? parseInt(item.Year) : null;
                if (!entryYear) return false;
                if (fromYear && toYear) return entryYear >= fromYear && entryYear <= toYear;
                if (fromYear) return entryYear === fromYear;
                if (toYear) return entryYear <= toYear;
                return true;
            });
        }

        // 3. Filter by Entry Types
        if (selectedEntryTypes.length > 0) {
            filteredData = filteredData.filter(item => {
                const itemType = item.entryType?.toLowerCase();
                return selectedEntryTypes.some(sel => {
                    const selLower = sel.toLowerCase();
                    return itemType === selLower || HINDI_VALUE_MAP[selLower]?.includes(item.entryType);
                });
            });
        }

        // 4. Filter by Statuses
        if (selectedStatuses.length > 0) {
            const lowerStatuses = selectedStatuses.map(s => s.toLowerCase());
            filteredData = filteredData.filter(item =>
                item.status && lowerStatuses.includes(item.status.toLowerCase())
            );
        }

        // 5. Keyword Search
        const kw = keyword.trim().toLowerCase();
        if (kw) {
            filteredData = filteredData.filter((entry: any) =>
                SEARCHABLE_FIELDS.some((field: any) => String(entry[field] || "").toLowerCase().includes(kw))
            );
        }

        // --- DETERMINE HEADERS ---
        // If one specific type is selected in dropdown, use those headers. 
        // If multiple or none, fallback to reportType from URL or "all".
        let activeHeaderKey = "all";
        if (selectedReportTypes.length === 1) {
            activeHeaderKey = selectedReportTypes[0];
        } else if (reportType && reportType !== 'all') {
            activeHeaderKey = reportType;
        }

        const headers = HEADER_CONFIG[activeHeaderKey] || HEADER_CONFIG.all;

        if (searchData.length > 0) return { data: searchData, headers };
        return { data: filteredData, headers };
    }, [entries, year, searchData, selectedEntryTypes, selectedStatuses, keyword, selectedReportTypes, reportType]);

    const handleImportSuccess = () => {
        if (user?.id) fetchMaalkhanaEntry(user.id, user.role);
    };

    return (
        <>
            <div className="p-4 mx-2 flex gap-3 glass-effect">
                <h1 className="text-lg font-semibold text-white">Filter:</h1>
                <div className="flex flex-wrap gap-4 w-full justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <MultiSelectDropdown
                            label="Entry Type"
                            options={entryTypeOptions}
                            selectedValues={selectedEntryTypes}
                            onChange={setSelectedEntryTypes}
                        />
                        <MultiSelectDropdown
                            label="Status"
                            options={statusOptions}
                            selectedValues={selectedStatuses}
                            onChange={setSelectedStatuses}
                        />
                        <MultiSelectDropdown
                            label="Type"
                            options={reportTypeOptions}
                            selectedValues={selectedReportTypes}
                            onChange={setSelectedReportTypes}
                        />
                    </div>

                    <div className="flex gap-4">
                        <InputComponent
                            label="search"
                            value={keyword}
                            isLabel={false}
                            setInput={(e: any) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {user?.role !== 'asp' && (
                <UploadModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    schemaType="entry"
                    onSuccess={handleImportSuccess}
                    addEntry={addMaalkhanaEntry as any}
                />
            )}

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