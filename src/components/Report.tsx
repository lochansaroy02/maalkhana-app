"use client";
import { useSearchStore } from "@/store/searchStore";
import { generateBarcodePDF } from "@/utils/generateBarcodePDF";
import { exportMap, orderedKeys } from "@/utils/map";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import DropDown from "./ui/DropDown";

import * as XLSX from "xlsx";



interface ReportProps {
    data: any[];
    heading: string;
    detailsPathPrefix: string;
    onImportClick?: () => void;
    fetchData?: () => void;
    headers?: string[];
}

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
    const { setYear, year } = useSearchStore();
    const currentYear = new Date().getFullYear();

    const yearOptions = Array.from({ length: (currentYear + 5) - 1990 + 1 }, (_, i) => {
        const year = 1990 + i;
        return { value: String(year), label: String(year) };
    });



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
        await generateBarcodePDF(selectedData);
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
        return formatValue(key, value);
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

        console.log(exportedData)
        // Create a new workbook and add the data
        const worksheet = XLSX.utils.json_to_sheet(exportedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        // Generate the file and trigger download
        XLSX.writeFile(workbook, `${heading.replace(/\s/g, "-")}-selected-report.xlsx`);

        toast.success("Data exported successfully to XLSX.");
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
                                <th className="px-4 py-2 text-center">Select</th>
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
                            {data.map((item, index) => (
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
                                    <td className="px-4 border border-black py-2">{index + 1}</td>
                                    {headers && headers.map((header) => {
                                        const itemKey = orderedKeys.find(key => key.toLowerCase() === header.replace(" ", "").toLowerCase() || header.toLowerCase().includes(key.toLowerCase()));
                                        const finalKey = itemKey || (header === "ID" ? "id" : header);
                                        return (
                                            <td key={finalKey} className="px-4 border border-black py-2">
                                                {renderCellContent(finalKey, item[finalKey])}
                                            </td>
                                        );
                                    })}
                                    {!headers && Object.values(exportMap).map((dbKey) => (
                                        <td key={dbKey} className="px-4 border border-black py-2">
                                            {renderCellContent(dbKey, item[dbKey])}
                                        </td>
                                    ))}
                                    {!headers && orderedKeys
                                        .filter((key) => !excluded.includes(key) && !Object.values(exportMap).includes(key))
                                        .map((key) => (
                                            <td key={key} className="px-4 border border-black py-2">
                                                {renderCellContent(key, item[key])}
                                            </td>
                                        ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="h-80 flex items-center glass-effect justify-center w-full rounded-lg mt-4">
                    <h1 className="text-blue-100 text-2xl">No data available</h1>
                </div>
            )}
        </div>
    );
};

export default Report;