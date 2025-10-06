"use client";
import { useSearchStore } from "@/store/searchStore";
import { generateBarcodePDF } from "@/utils/generateBarcodePDF";
import { exportMap, orderedKeys } from "@/utils/map";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react"; // 💡 Added useMemo
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";
import DropDown from "./ui/DropDown";

// 💡 STEP 1: Import the converter utility
// Assuming you moved the converter and the keys definition to a utility file
import { convertUnicodeToKurtidev } from "@/utils/font";

interface ReportProps {
    data: any[];
    heading: string;
    detailsPathPrefix: string;
    onImportClick?: () => void;
    fetchData?: () => void;
    headers?: string[];
}

// 💡 STEP 2: Define ALL keys that *could* contain Hindi text
const kurtidevKeys = [
    "description", "firNo", "srNo", "gdNo", "gdDate", "underSection", "policeStation", "caseProperty",
    "vadiName", "courtName", "receiverName", "takenOutBy", "movePurpose", "returnBackFrom", "receivedBy",
];

// 💡 NEW UTILITY: Heuristic check for existing Kruti Dev / Kurtidev encoding
const isLikelyKurtidev = (text: any): boolean => {
    if (!text || typeof text !== 'string') return false;

    // Check for common Devanagari Unicode characters (U+0900 to U+097F).
    const hasDevanagariUnicode = /[\u0900-\u097F]/.test(text);

    // Check for specific non-standard ASCII characters common in Kruti Dev/Kurtidev encoding.
    const hasSpecificLegacyChars = /[\u0080-\u00FF\u00A0-\u00BF]/.test(text);

    // Rule: If it contains non-standard ASCII but *NO* Devanagari Unicode, it is likely legacy-encoded.
    if (hasSpecificLegacyChars && !hasDevanagariUnicode) {
        return true;
    }

    // If it contains Devanagari Unicode, assume it is Mangal/Unicode and does NOT need conversion.
    if (hasDevanagariUnicode) {
        return false;
    }

    return false;
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

    // --- PAGINATION STATES ---
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(25); // Set default to 25 entries per page
    // -------------------------

    const { setYear, year } = useSearchStore();
    const currentYear = new Date().getFullYear();

    const yearOptions = Array.from({ length: (currentYear + 5) - 1990 + 1 }, (_, i) => {
        const year = 1990 + i;
        return { value: String(year), label: String(year) };
    });

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(data.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

    const currentEntries = useMemo(() => {
        return data.slice(indexOfFirstEntry, indexOfLastEntry);
    }, [data, indexOfFirstEntry, indexOfLastEntry]);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const pathName = usePathname()

    // Reset page to 1 if entriesPerPage or data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data, entriesPerPage]);
    // -------------------------

    const formatValue = (key: string, value: any) => {
        if (key.toLowerCase().includes("date") || key.toLowerCase().includes("returndate") || key.toLowerCase().includes("movedate")) {
            if (!value) return "-";
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
        const selectedData = data.filter((item) => selectedIds.includes(item.id));

        if (selectedData.length === 0) {
            toast.error("No entries selected");
            return;
        }
        let dbName = pathName.includes("entry-report") ? "m" : "s"; // Simplified check

        await generateBarcodePDF(selectedData, dbName);
    };

    const handleDoubleClick = (item: any) => {
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
        if (heading === "Maalkhana Data") {
            router.push(`/report/entry-report/${item.id}`);
        } else if (heading === "Seized Vehicles Report") {
            router.push(`/report/siezed-report/${item.id}`);
        }
    };

    const renderCellContent = (key: string, value: any) => {
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

        // 💡 CONDITIONAL FONT CONVERSION LOGIC
        if (kurtidevKeys.includes(key)) {
            // ONLY convert if the text is NOT already detected as legacy Kurtidev
            if (!isLikelyKurtidev(formattedValue)) {
                formattedValue = convertUnicodeToKurtidev(formattedValue);
            }
        }
        return formattedValue;
    };

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
                row[header] = formatValue(dbKey, item[dbKey]);
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
        // Get the IDs of the entries currently visible on the page
        const currentEntryIds = currentEntries.map((item) => item.id);

        if (selectAll) {
            // Deselect all entries on the current page
            setSelectedIds((prev) => prev.filter((id) => !currentEntryIds.includes(id)));
        } else {
            // Select all entries on the current page, ensuring no duplicates
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

    const isKurtidevCell = (key: string) => kurtidevKeys.includes(key);

    const renderPaginationControls = () => {
        if (totalPages <= 1) return null;

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
                        {[25, 50, 100, 200, 500].map(num => (
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
                        {Math.min(indexOfLastEntry, data.length)}
                    </span>
                    of
                    <span className="font-bold mx-1 ">

                        {data.length}
                    </span> entries
                </div>
            </div>
        );
    };

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
                <div className="flex gap-4">
                    {onImportClick && <Button onClick={onImportClick}>Import</Button>}
                    <Button onClick={handleExport}>Export Selected</Button>
                    <Button onClick={handleDeleteSelected} variant="destructive">
                        Delete Selected
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button onClick={handleGenerateBarcodePDF} className="bg-green-600 text-white hover:bg-green-700">
                            Generate Barcode
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
                                {headers && headers.map((header) => (
                                    <th key={header} className="px-4 py-2 text-left capitalize">
                                        {header}
                                    </th>
                                ))}
                                {!headers && Object.keys(exportMap).map((key) => (
                                    <th key={key} className="px-4 py-2 text-left capitalize">
                                        {key}
                                    </th>
                                ))}
                                {!headers && orderedKeys
                                    .filter((key) => !excluded.includes(key) && !Object.values(exportMap).includes(key))
                                    .map((key) => (
                                        <th key={key} className="px-4 py-2 text-left capitalize">
                                            {key === "photoUrl" ? "Photo" : key === "documentUrl" ? "Document" : key}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white/90 text-black">
                            {/* 💡 Rendering ONLY the entries for the current page */}
                            {currentEntries.map((item, index) => {
                                const actualSrNo = indexOfFirstEntry + index + 1; // Calculate global index

                                // Determine keys to display (prioritizing the 'headers' prop)
                                const keysToRender = headers
                                    ? headers.map(header => {
                                        // Find the corresponding database key based on the header text
                                        const foundKey = orderedKeys.find(key => key.toLowerCase() === header.replace(/\s/g, '').toLowerCase() || header.toLowerCase().includes(key.toLowerCase()));
                                        return foundKey || (header === "ID" ? "id" : header);
                                    }).filter(key => !!key)
                                    : Object.keys(item).filter(key => !excluded.includes(key));

                                return (
                                    <tr
                                        onDoubleClick={() => handleDoubleClick(item)}
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

                                        {/* Render cells based on the determined keys */}
                                        {keysToRender.map((finalKey) => (
                                            <td
                                                key={finalKey}
                                                className={`px-4 border border-black py-2 ${isKurtidevCell(finalKey) ? 'font-kurtidev' : ''}`}
                                            >
                                                {renderCellContent(finalKey, item[finalKey])}
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

            {/* 💡 Render Pagination Controls */}
            {renderPaginationControls()}
        </div>
    );
};

export default Report;