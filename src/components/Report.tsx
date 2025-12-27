"use client";
import { useAuthStore } from "@/store/authStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { useSearchStore } from "@/store/searchStore";
import { convertUnicodeToKurtidev, isLikelyKurtidev, kurtidevKeys } from "@/utils/font"; // Assuming convertUnicodeToKurtidev and isLikelyKurtidev are now correctly exported from "@/utils/font"
import { generateBarcodePDF } from "@/utils/generateBarcodePDF";
import { exportMap, orderedKeys } from "@/utils/map";
import axios from "axios";
import { Barcode, ChevronDown, ChevronUp, Download, Trash, Upload } from "lucide-react"; // Import for sort icons
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";
import DropDown from "./ui/DropDown";

interface ReportProps {
    data: any[];
    heading: string;
    detailsPathPrefix: string;
    onImportClick?: () => void;
    fetchData?: () => void;
    headers?: string[];
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
}: ReportProps) => {
    const router = useRouter();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    // isKurtidevEnabled state REMOVED as requested.
    const { setCurrentEntry } = useMaalkhanaStore()
    // ✅ NEW STATE: Sorting configuration
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'descending' });
    const { user } = useAuthStore();
    // --- PAGINATION STATES ---
    // MODIFIED: Default entriesPerPage from 25 to 20
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    // -------------------------

    const { setYear, year } = useSearchStore();
    const currentYear = new Date().getFullYear();

    const yearOptions = Array.from({ length: (currentYear) - 1980 + 1 }, (_, i) => {
        const year = 1980 + i;
        return { value: String(year), label: String(year) };
    }).reverse();

    // --- UTILITIES ---

    const formatValue = (key: string, value: any) => {

        if (key.toLowerCase().includes("date") || key.toLowerCase().includes("returndate") || key.toLowerCase().includes("movedate")) {
            if (!value) return "-";

            // Check if value is a string that looks like an Excel-style date number
            if (typeof value === 'number' && value > 10000) {
                // Excel date serial number (e.g., 33564 for 01-Jan-1992)
                const date = new Date((value - (25569)) * 86400 * 1000);
                if (!isNaN(date.getTime())) {
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear();
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
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }

        return value || "-";
    };

    const excluded = [
        "Id", "id", "createdAt", "updatedAt", "photo", "document", "isReturned", "dbName", "isMovement", "isRelease", "userId", "districtId", "_id", "__v", "",
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
            toast.error("No entries selected");
            return;
        }
        try {
            if (!window.confirm("Are you sure you want to delete the selected entries?")) return;

            await axios.post("/api/entry/delete-multiple", { ids: selectedIds });
            toast.success("Deleted successfully");
            setSelectedIds([]);
            fetchData && fetchData();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Error deleting entries");
        }
    };

    const handleGenerateBarcodePDF = async () => {
        // Use sortedData or original data based on preference, here we use original data via selectedIds
        const selectedData = data.filter((item) => selectedIds.includes(item.id));

        if (selectedData.length === 0) {
            toast.error("No entries selected");
            return;
        }
        let dbName = pathName.includes("entry-report") ? "m" : "s";
        await generateBarcodePDF(selectedData, dbName, year, user?.policeStation,);
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
        if (key === "photoUrl" && value) {
            return (
                <div className="flex justify-center items-center h-full w-24 relative">
                    <Image
                        src={value}
                        alt="Case Property Photo"
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
            );
        }
        if (key === "documentUrl" && value) {
            return (
                <Link href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Download
                </Link>
            );
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
            toast.error("No entries selected for export.");
            return;
        }

        const selectedData = data.filter((item) => selectedIds.includes(item.id));

        const exportedData = selectedData.map((item) => {
            const row = {};
            Object.keys(exportMap).forEach((header) => {
                //@ts-ignore
                const dbKey = exportMap[header];
                //@ts-ignore
                // Use the converted value for export if applicable
                row[header] = renderCellContent(dbKey, item[dbKey], item);
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        XLSX.writeFile(workbook, `${heading.replace(/\s/g, "-")}-selected-report.xlsx`);

        toast.success("Data exported successfully to XLSX.");
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

        const ENTRIES_PER_PAGE_OPTIONS = [20, 40, 60, 80, 100, 500, 1000, 2000, 4000];
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
                    <span className="text-white text-sm">Entries per page:</span>
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
                        Previous
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
                        Next
                    </Button>
                </nav>
                <div className="text-white text-sm">
                    Showing <span className="font-bold mx-1 ">
                        {indexOfFirstEntry + 1}
                    </span> to
                    <span className="font-bold mx-1 ">
                        {Math.min(indexOfLastEntry, sortedData.length)}
                    </span>
                    of
                    <span className="font-bold mx-1 ">

                        {sortedData.length}
                    </span> entries
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
            const foundKey = orderedKeys.find(key => key.toLowerCase() === header.replace(/\s/g, '').toLowerCase() || header.toLowerCase().includes(key.toLowerCase()));
            return {
                header: header,
                key: foundKey || (header === "ID" ? "id" : header),
            };
        }).filter(item => !!item.key);

    }, [headers]);


    return (
        <div className="p-4 relative ">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">{heading}</h1>
                {heading === "Maalkhana Data" && (
                    <div className="flex gap-4">
                        <DropDown
                            label="From"
                            selectedValue={year.from}
                            handleSelect={(val) => setYear({ ...year, from: val })}
                            options={yearOptions}
                        />
                        <DropDown
                            label="to"
                            selectedValue={year.to}
                            handleSelect={(val) => setYear({ ...year, to: val })}
                            options={yearOptions}
                        />
                    </div>
                )}
                <div className="flex gap-4 items-center">

                    {/* Kurtidev controls REMOVED */}
                    {onImportClick && <Button onClick={onImportClick}>
                        <Download />
                        Import</Button>}
                    <Button onClick={handleExport}>
                        <Upload />
                        Export</Button>
                    <Button className="cursor-pointer" onClick={handleDeleteSelected} variant="destructive">
                        <Trash />
                        Delete
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button onClick={handleGenerateBarcodePDF} className="bg-green-600 cursor-pointer text-white hover:bg-green-700">
                            <Barcode />
                            Barcode
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
                                        {selectedIds.length} Selected
                                    </div>
                                </th>
                                <th className="px-4 py-2 text-left capitalize">Sr. No.</th>
                                {/* MODIFIED: Add conditional class for wider header */}
                                {headerKeysToRender.map((item) => (
                                    <th
                                        key={item.key}
                                        className={`px-4 py-2 text-left capitalize cursor-pointer hover:bg-gray-600/50 transition duration-150 
                                            ${item.key.toLowerCase().includes("description") ? 'min-w-[250px]' : ''} `}
                                        onClick={() => requestSort(item.key)}
                                    >
                                        <div className="flex items-center">
                                            {item.header}
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
                                                    ${finalKey.toLowerCase().includes("description") ? 'min-w-[250px] whitespace-normal' : 'whitespace-nowrap'}`}
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
                    <h1 className="text-blue-100 text-2xl">No data available</h1>
                </div>
            )}

            {/* Render Pagination Controls */}
            {renderPaginationControls()}
        </div>
    );
};

export default Report;  