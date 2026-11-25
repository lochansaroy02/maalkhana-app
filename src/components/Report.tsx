"use client";
import { useAuthStore } from "@/store/authStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { useSearchStore } from "@/store/searchStore";
import { convertUnicodeToKurtidev, isLikelyKurtidev, kurtidevKeys } from "@/utils/font"; // Assuming convertUnicodeToKurtidev and isLikelyKurtidev are now correctly exported from "@/utils/font"
import { generateBarcodePDF } from "@/utils/generateBarcodePDF";
import { useBarcodeLabels } from "@/utils/useBarcodeLabels";
import { exportMap, orderedKeys } from "@/utils/map";
import axios from "axios";
import { Barcode, ChevronDown, ChevronUp, Download, Trash, Upload } from "lucide-react"; // Import for sort icons
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { itemCategoryLabel } from "@/utils/itemCategories";
import { useLocale, useTranslations } from "next-intl";
import { useFieldLabel } from "@/utils/useFieldLabel";
import MediaCell from "./MediaCell";
import { Button } from "./ui/button";

interface ReportProps {
    data: any[];
    heading: string;
    detailsPathPrefix: string;
    onImportClick?: () => void;
    fetchData?: () => void;
    headers?: string[];
    /** Shown instead of "No data available" when filters hide every row. */
    emptyState?: { title: string; hint?: string };
    /** Export these columns (labels from the table) instead of the default export map. */
    exportColumns?: string[];
}

// =================================================================
// 🚀 FONT UTILITIES (Imported logic used here for clarity)
// =================================================================

/**
 * Utility to check if a table cell should have the Kurtidev font class.
 */
//@ts-ignore
const isKurtidevCell = (key: string) => kurtidevKeys.includes(key);

// =================================================================
// ✅ FIXED UTILITY: Checks the 'Year' field for the 1991-2021 range.
// =================================================================

/**
 * Checks if the entry's 'Year' property falls between 1991 and 2021 (inclusive).
 */
const isEntryInLegacyYearRange = (entry: any): boolean => {
    const year = entry.Year;
    let numericYear: number | undefined;

    if (typeof year === 'number' && !isNaN(year)) {
        numericYear = year;
    } else if (typeof year === 'string' && !isNaN(Number(year))) {
        // Handles cases where 'Year' might be stored as a string
        numericYear = Number(year);
    }

    if (numericYear !== undefined && !isNaN(numericYear)) {
        // *** MODIFIED RANGE TO BE 1991 TO 2021 INCLUSIVE ***
        return numericYear >= 1991 && numericYear <= 2021;
    }
    return false;
}

// =================================================================
// -----------------------------------------------------------------

const reportFieldLabels: Record<string, string> = {
    firNo: "FIR No",
    srNo: "Sr No",
    gdNo: "GD No",
    gdDate: "GD Date",
    underSection: "Under Section",
    caseProperty: "Case Property",
    policeStation: "Police Station",
    IOName: "IO Name",
    vadiName: "Vadi Name",
    accused: "Accused",
    status: "Status",
    entryType: "Entry Type",
    place: "Place",
    boxNo: "Box No",
    courtNo: "Court No",
    courtName: "Court Name",
    address: "Address",
    fathersName: "Father's Name",
    mobile: "Mobile No",
    releaseDate: "Release Date",
    releaseItemName: "Release Item",
    releaseOrderedBy: "Release Ordered By",
    receiverName: "Receiver Name",
    releasePhotoUrl: "Release Photo",
    releaseDocumentUrl: "Release Document",
    moveDate: "Move Date",
    movePurpose: "Move Purpose",
    moveTrackingNo: "Move Tracking No",
    takenOutBy: "Taken Out By",
    returnBackFrom: "Return Back From",
    returnDate: "Return Date",
    movementPhotoUrl: "Movement Photo",
    movementDocumentUrl: "Movement Document",
    receivedBy: "Received By",
    nilamiDate: "Nilami Date",
    nilamiItemName: "Nilami Item",
    nilamiValue: "Nilami Value",
    nilamiOrderedBy: "Nilami Ordered By",
    nilamiPhotoUrl: "Nilami Photo",
    nilamiDocumentUrl: "Nilami Document",
    destroyDate: "Destroy Date",
    destroyPurpose: "Destroy Purpose",
    destroyOrderedBy: "Destroy Ordered By",
    destroyPhotoUrl: "Destroy Photo",
    destroyDocumentUrl: "Destroy Document",
    photoUrl: "Photo",
    documentUrl: "Document",
    description: "Description",
    Year: "Year",
    HM: "HM",
    cash: "Cash",
    wine: "Wine",
    wineType: "Wine Type",
    yellowItemPrice: "Yellow Item Price",
    // Licensed weapon (लाइसेंसी शस्त्र) deposit fields
    receiptNo: "Receipt No",
    licenseNo: "License No",
    ownerName: "Owner Name",
    weaponName: "Weapon",
    weaponNo: "Weapon No",
    depositDate: "Deposit Date",
    depositReason: "Deposit Reason",
    rackNo: "Rack No",
    category: "Category",
    malkhanaRackNo: "Malkhana Rack No",
};

/** Long free-text columns wrap onto several lines instead of stretching the table. */
const isWrapColumn = (key: string) => /description|purpose|reason|caseproperty/i.test(key);

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const reportHeaderAliases: Record<string, string> = Object.entries(reportFieldLabels).reduce((acc, [key, label]) => {
    acc[normalizeHeader(key)] = key;
    acc[normalizeHeader(label)] = key;
    return acc;
}, {} as Record<string, string>);

const knownReportKeys = [
    ...orderedKeys,
    "releaseDate",
    "releaseOrderedBy",
    "releasePhotoUrl",
    "releaseDocumentUrl",
    "movementPhotoUrl",
    "movementDocumentUrl",
    "nilamiDate",
    "nilamiItemName",
    "nilamiValue",
    "nilamiOrderedBy",
    "nilamiPhotoUrl",
    "nilamiDocumentUrl",
    "destroyDate",
    "destroyPurpose",
    "destroyOrderedBy",
    "destroyPhotoUrl",
    "destroyDocumentUrl",
    "document",
    "receiptNo",
    "licenseNo",
    "ownerName",
    "weaponName",
    "weaponNo",
    "depositDate",
    "depositReason",
    "rackNo",
    "category",
    "malkhanaRackNo",
];

const resolveHeaderKey = (header: string) => {
    const normalized = normalizeHeader(header);
    if (reportHeaderAliases[normalized]) return reportHeaderAliases[normalized];

    const foundKey = knownReportKeys.find(key => normalizeHeader(key) === normalized);
    if (foundKey) return foundKey;

    return header;
};

const getHeaderLabel = (headerOrKey: string) => {
    const key = resolveHeaderKey(headerOrKey);
    if (reportFieldLabels[key]) return reportFieldLabels[key];
    return headerOrKey
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, char => char.toUpperCase());
};

const isFileUrlField = (key: string, value: any) => {
    if (!value || typeof value !== "string") return false;
    const lowerKey = key.toLowerCase();
    return value.startsWith("http") && (lowerKey.includes("url") || lowerKey.includes("photo") || lowerKey.includes("document"));
};


// Type definition for sorting state
type SortConfig = {
    key: string;
    direction: 'ascending' | 'descending';
};

const Report = ({
    data,
    heading,
    detailsPathPrefix,
    onImportClick,
    fetchData,
    headers,
    emptyState,
    exportColumns,
}: ReportProps) => {
    const router = useRouter();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    // isKurtidevEnabled state REMOVED as requested.
    const { setCurrentEntry } = useMaalkhanaStore()
    // ✅ NEW STATE: Sorting configuration
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'descending' });
    const { user } = useAuthStore();
    const barcodeLabels = useBarcodeLabels();
    // --- PAGINATION STATES ---
    // MODIFIED: Default entriesPerPage from 25 to 20
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    // -------------------------

    const { year } = useSearchStore();

    // --- UTILITIES ---

    const locale = useLocale();
    const tr = useTranslations("ui.reportTable");
    const fieldLabel = useFieldLabel();
    // heading doubles as an id ("Malkhana Data" / "Seized Vehicles Report"); translate only for display
    const headingLabel = heading === "Malkhana Data" ? tr("malkhanaHeading") : heading === "Seized Vehicles Report" ? tr("vehiclesHeading") : heading;
    const formatValue = (key: string, value: any) => {
        // Saved as a key ("weapon"); older entries may hold free text.
        if (key === "category") return value ? itemCategoryLabel(String(value), locale) || String(value) : "-";

        if (key.toLowerCase().includes("date") || key.toLowerCase().includes("returndate") || key.toLowerCase().includes("movedate")) {
            if (!value) return "-";

            // Check if value is a string that looks like an Excel-style date number
            if (typeof value === 'number' && value > 10000) {
                // Excel date serial number (e.g., 33564 for 01-Jan-1992)
                const date = new Date((value - (25569)) * 86400 * 1000);
                if (!isNaN(date.getTime())) {
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear().toString().slice(-2);
                    return `${day}/${month}/${year}`;
                }
            }

            // Standard date parsing
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return value;
            }
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear().toString().slice(-2)
            return `${day}-${month}-${year}`;
        }

        return value || "-";
    };

    const excluded = [
        "Id", "id", "updatedAt", , "isReturned", "dbName", "isMovement", "isRelease", "userId", "districtId", "_id", "__v", "",
    ];

    const pathName = usePathname();

    // --- SORTING LOGIC ---

    const requestSort = (key: string) => {
        let direction: SortConfig['direction'] = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            // Clicking descending a second time resets the sort
            setSortConfig({ key: '', direction: 'descending' });
            return;
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                let comparison = 0;

                // Simple date comparison for known date keys
                if (sortConfig.key.toLowerCase().includes("date") || sortConfig.key.toLowerCase().includes("returndate") || sortConfig.key.toLowerCase().includes("movedate")) {
                    // Normalize date values to timestamps for reliable comparison
                    const dateA = aValue ? new Date(aValue).getTime() : 0;
                    const dateB = bValue ? new Date(bValue).getTime() : 0;
                    comparison = dateA - dateB;
                }
                // Default string/number comparison
                else if (typeof aValue === 'string' && typeof bValue === 'string') {
                    comparison = aValue.localeCompare(bValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    comparison = aValue - bValue;
                }

                // If comparison is 0, try to ensure descending by a fixed field, like a primary ID, for stability
                if (comparison === 0) {
                    // Use 'id' for stable sort when primary sort fields are equal
                    const idA = a.id || 0;
                    const idB = b.id || 0;
                    comparison = idA - idB;
                }

                return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(sortedData.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

    const currentEntries = useMemo(() => {
        // Use sortedData instead of original data
        return sortedData.slice(indexOfFirstEntry, indexOfLastEntry);
    }, [sortedData, indexOfFirstEntry, indexOfLastEntry]);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset page to 1 if entriesPerPage, data, or sortConfig changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data, entriesPerPage, sortConfig]);

    // --- ACTIONS ---

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) {
            toast.error(tr("noneSelected"));
            return;
        }
        try {
            if (!window.confirm(tr("confirmDelete"))) return;

            await axios.post("/api/entry/delete-multiple", { ids: selectedIds });
            toast.success(tr("deleted"));
            setSelectedIds([]);
            fetchData && fetchData();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(tr("deleteError"));
        }
    };

    const handleGenerateBarcodePDF = async () => {
        // Use sortedData or original data based on preference, here we use original data via selectedIds
        const selectedData = data.filter((item) => selectedIds.includes(item.id));

        if (selectedData.length === 0) {
            toast.error(tr("noneSelected"));
            return;
        }
        // Vehicles are stored with dbName "v", which is what /api/barcode expects.
        let dbName = pathName.includes("entry-report") ? "m" : "v";
        await generateBarcodePDF(selectedData, dbName, year, user?.policeStation, undefined, barcodeLabels);
    };

    const handleDoubleClick = (item: any) => {
        setCurrentEntry(item)
        if (heading === "Malkhana Data") {

            router.push(`/maalkhana-entry`);
        } else if (heading === "Seized Vehicles Report") {
            router.push(`/report/siezed-report/${item.id}`);
        }

    };

    const handleClick = (item: any) => {
        const allKeys = Object.keys(item).filter((key) => !excluded.includes(key));
        const sortedVisibleKeys: any[] = [];
        orderedKeys.forEach((key) => {
            if (allKeys.includes(key)) {
                sortedVisibleKeys.push(key);
            }
        });
        allKeys.forEach((key) => {
            if (!sortedVisibleKeys.includes(key)) {
                sortedVisibleKeys.push(key);
            }
        });
        sessionStorage.setItem("visibleReportFields", JSON.stringify(sortedVisibleKeys));
        if (heading === "Malkhana Data") {
            router.push(`/report/entry-report/${item.id}`);
        } else if (heading === "Seized Vehicles Report") {
            router.push(`/report/siezed-report/${item.id}`);
        }
    }

    // =================================================================
    // ✅ VERIFIED AND FIXED: Conversion is strictly conditional on 1991-2021 Year.
    // =================================================================
    const renderCellContent = (key: string, value: any, entry: any) => {
        if (isFileUrlField(key, value)) {
            const ref = [entry?.firNo, entry?.srNo].filter(Boolean).join("-");
            return <MediaCell url={value} label={[getHeaderLabel(key), ref].filter(Boolean).join(" ")} />;
        }

        let formattedValue = formatValue(key, value);

        // Ensure formattedValue is a string before checking/converting
        const valueAsString = String(formattedValue);

        // Conditional conversion based on (Kurtidev Key) AND (Year is 1991-2021)

        //@ts-ignore
        if (kurtidevKeys.includes(key) && isEntryInLegacyYearRange(entry)) {
            // Only convert if it's a Devanagari key, the year is 1991-2021, and it's not already in Kurtidev (non-Unicode)
            if (valueAsString && valueAsString !== "-" && !isLikelyKurtidev(valueAsString)) {
                // IMPORTANT: This relies on the actual conversion logic being implemented in "@/utils/font"
                formattedValue = convertUnicodeToKurtidev(valueAsString);
            }
        }
        return formattedValue;
    };
    // =================================================================
    // -----------------------------------------------------------------


    const handleExport = () => {
        if (selectedIds.length === 0) {
            toast.error(tr("noneSelected"));
            return;
        }

        const selectedData = data.filter((item) => selectedIds.includes(item.id));

        if (exportColumns?.length) {
            // Column-specific export (e.g. the licensed-weapon view)
            const rows = selectedData.map((item) => {
                const row: Record<string, unknown> = {};
                exportColumns.forEach((key) => {
                    row[fieldLabel(resolveHeaderKey(key), getHeaderLabel(key))] = isFileUrlField(key, item[key]) ? item[key] : formatValue(key, item[key]);
                });
                return row;
            });
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");
            XLSX.writeFile(wb, `${heading.replace(/\s/g, "-")}-selected-report.xlsx`);
            toast.success(tr("exported"));
            return;
        }

        const exportedData = selectedData.map((item) => {
            const row = {};
            Object.keys(exportMap).forEach((header) => {
                //@ts-ignore
                const dbKey = exportMap[header];
                //@ts-ignore
                // Use the converted value for export if applicable
                row[fieldLabel(dbKey, header)] = isFileUrlField(dbKey, item[dbKey])
                    ? item[dbKey]
                    : formatValue(dbKey, item[dbKey]);
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        XLSX.writeFile(workbook, `${heading.replace(/\s/g, "-")}-selected-report.xlsx`);

        toast.success(tr("exported"));
    };

    const handleSelectAll = () => {
        const currentEntryIds = currentEntries.map((item) => item.id);

        if (selectAll) {
            setSelectedIds((prev) => prev.filter((id) => !currentEntryIds.includes(id)));
        } else {
            setSelectedIds((prev) => [
                ...prev.filter((id) => !currentEntryIds.includes(id)),
                ...currentEntryIds,
            ]);
        }
    };

    useEffect(() => {
        const currentEntryIds = currentEntries.map((item) => item.id);
        const selectedCurrentCount = selectedIds.filter(id => currentEntryIds.includes(id)).length;

        if (currentEntries.length > 0 && selectedCurrentCount === currentEntries.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedIds, currentEntries]);


    const renderPaginationControls = () => {
        if (totalPages <= 1) return null;

        const ENTRIES_PER_PAGE_OPTIONS = [20, 40, 60, 80, 100, 320, 500, 1000, 2000, 4000];
        // END MODIFIED

        const pageNumbers = [];
        const maxPagesToShow = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                    {/* Entries Per Page Dropdown */}
                    <span className="text-white text-sm">{tr("entriesPerPage")}</span>
                    <select
                        value={entriesPerPage}
                        onChange={(e) => {
                            setEntriesPerPage(Number(e.target.value));
                        }}
                        className="p-1 border bg-gray-700 text-white rounded text-sm"
                    >
                        {/* MODIFIED: Use new entries per page options */}
                        {ENTRIES_PER_PAGE_OPTIONS.map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>

                {/* Pagination Buttons */}
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                    <Button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-sm"
                        variant="outline"
                    >
                        {tr("previous")}
                    </Button>

                    {startPage > 1 && <span className="text-white">...</span>}

                    {pageNumbers.map(number => (
                        <Button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`p-2 text-sm ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        >
                            {number}
                        </Button>
                    ))}

                    {endPage < totalPages && <span className="text-white">...</span>}

                    <Button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-sm"
                        variant="outline"
                    >
                        {tr("next")}
                    </Button>
                </nav>
                <div className="text-white text-sm">
                    {tr("showing", { from: indexOfFirstEntry + 1, to: Math.min(indexOfLastEntry, sortedData.length), total: sortedData.length })}
                </div>
            </div>
        );
    };

    const getSortIndicator = (key: string) => {
        if (sortConfig.key !== key) {
            return null;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUp className="w-4 h-4 ml-1" />;
        }
        return <ChevronDown className="w-4 h-4 ml-1" />;
    };


    // Determine the keys to display in the header
    const headerKeysToRender = useMemo(() => {
        // Find the actual database key for each exportable header
        const mappedKeys = Object.entries(exportMap).map(([headerName, dbKey]) => ({
            header: headerName,
            key: dbKey,
        }));

        // Include other non-excluded keys if headers prop is not used
        if (!headers) {
            const extraKeys = orderedKeys
                .filter(key => !excluded.includes(key) && !Object.values(exportMap).includes(key))
                .map(key => ({
                    header: key === "photoUrl" ? "Photo" : key === "documentUrl" ? "Document" : key,
                    key: key,
                }));
            return [...mappedKeys, ...extraKeys];
        }

        // If 'headers' prop is provided, map them back to database keys if possible
        return headers.map(header => {
            const foundKey = resolveHeaderKey(header);
            return {
                header: getHeaderLabel(header),
                key: foundKey || (header === "ID" ? "id" : header),
            };
        }).filter(item => !!item.key);

    }, [headers]);


    return (
        <div className="p-4 relative ">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">{headingLabel}</h1>
                {/* Year range filter moved to the report filter bar */}
                <div className="flex gap-4 items-center">

                    {/* Kurtidev controls REMOVED */}
                    {onImportClick && <Button onClick={onImportClick}>
                        <Download />
                        {tr("import")}</Button>}
                    <Button onClick={handleExport}>
                        <Upload />
                        {tr("export")}</Button>
                    <Button className="cursor-pointer" onClick={handleDeleteSelected} variant="destructive">
                        <Trash />
                        {tr("delete")}
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button onClick={handleGenerateBarcodePDF} className="bg-green-600 cursor-pointer text-white hover:bg-green-700">
                            <Barcode />
                            {tr("barcode")}
                        </Button>
                    )}
                </div>
            </div>
            {data && data.length > 0 ? (
                <div className="overflow-x-auto h-fit ">
                    <table className="min-w-full table-auto border border-white/50 border-collapse">
                        <thead className="bg-gray-700/50 text-sm font-semibold text-white">
                            <tr>
                                <th className="px-4 py-2 text-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                    <div className="text-xs mt-1 font-normal">
                                        {tr("selected", { count: selectedIds.length })}
                                    </div>
                                </th>
                                <th className="px-4 py-2 text-left capitalize">{tr("srNo")}</th>
                                {/* MODIFIED: Add conditional class for wider header */}
                                {headerKeysToRender.map((item) => (
                                    <th
                                        key={item.key}
                                        className={`px-4 py-2 text-left capitalize cursor-pointer hover:bg-gray-600/50 transition duration-150 
                                            ${isWrapColumn(item.key) ? 'min-w-[260px] max-w-[420px]' : ''} `}
                                        onClick={() => requestSort(item.key)}
                                    >
                                        <div className="flex items-center">
                                            {fieldLabel(item.key, item.header)}
                                            {getSortIndicator(item.key)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white/90 text-black">
                            {currentEntries.map((item, index) => {
                                const actualSrNo = indexOfFirstEntry + index + 1;

                                // Determine keys to display (using the logic from headerKeysToRender)
                                const keysToRender = headerKeysToRender.map(h => h.key);

                                // Determine if this row should apply the visual Kurtidev class for eligible cells
                                // This is the core logic: check the Year for the legacy range
                                const shouldApplyKurtidevClass = isEntryInLegacyYearRange(item);


                                return (
                                    <tr
                                        onDoubleClick={() => handleDoubleClick(item)}
                                        onClick={() => handleClick(item)}
                                        key={item.id}
                                        className="text-sm cursor-pointer hover:bg-gray-300"
                                    >
                                        <td className="px-4 border border-black py-2 text-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="px-4 border border-black py-2">{actualSrNo}</td>

                                        {/* Pass 'item' to renderCellContent and conditionally apply 'font-kurtidev' class */}
                                        {keysToRender.map((finalKey) => (
                                            <td
                                                key={finalKey}
                                                className={`px-4 border border-black py-2 
                                                    ${shouldApplyKurtidevClass && isKurtidevCell(finalKey) ? 'font-kurtidev' : ''}
                                                    ${isWrapColumn(finalKey) ? 'min-w-[260px] max-w-[420px] whitespace-pre-line break-words align-top' : 'whitespace-nowrap'}`}
                                            >
                                                {renderCellContent(finalKey, item[finalKey], item)}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="h-80 flex items-center glass-effect justify-center w-full rounded-lg mt-4">
                    <div className="text-center">
                        <h1 className="text-blue-100 text-2xl">{emptyState?.title ?? tr("noData")}</h1>
                        {emptyState?.hint && <p className="mt-2 text-blue-100/70">{emptyState.hint}</p>}
                    </div>
                </div>
            )}

            {/* Render Pagination Controls */}
            {renderPaginationControls()}
        </div>
    );
};

export default Report;  
