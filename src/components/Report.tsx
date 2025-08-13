"use client";

import { exportToExcel } from "@/utils/exportToExcel";
import { generateBarcodePDF } from "@/utils/generateBarcodePDF";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

interface ReportProps {
    data: any[];
    heading: string;
    detailsPathPrefix: string;
    onImportClick?: () => void;
    fetchData?: () => void;
}

const Report = ({
    data,
    heading,
    detailsPathPrefix,
    onImportClick,
    fetchData
}: ReportProps) => {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const formatValue = (key: string, value: any) => {
        if (key === "createdAt" || key === "updatedAt" || key === 'gdDate' || key === 'moveDate' || key == 'returnDate') {
            // Check if value is valid before creating a Date object
            return value ? new Date(value).toLocaleDateString('en-IN') : "-";
        }
        if (key === "isReturned") {
            return value ? "Yes" : "No";
        }
        return value || "-";
    };

    const handleExport = () => {
        if (data && data.length > 0) {
            exportToExcel(data, "report_data");
        }
    };

    const excluded = ["Id", "id", "createdAt", "updatedAt", "photo", "document", "photoUrl", "userId", "districtId", "_id", "__v"];

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
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
        const selectedData = data.filter(item => selectedIds.includes(item.id));
        if (selectedData.length === 0) {
            toast.error("No entries selected");
            return;
        }
        await generateBarcodePDF(selectedData);
    };


    const handleDoubleClick = (item: any) => {
        const excluded = ["Id", "id", "createdAt", "updatedAt", "photo", "document", "userId", "districtId", "_id", "__v"];

        const visibleKeys = Object.keys(item).filter(key => !excluded.includes(key));
        console.log(visibleKeys)

        sessionStorage.setItem('visibleReportFields', JSON.stringify(visibleKeys));


        router.push(`/report/entry-report/${item.id}`);
    }
    return (
        <div className="p-4 relative ">
            <div className="flex justify-between  items-center mb-4">
                <h1 className="text-2xl font-bold text-white">{heading}</h1>
                <div className="flex gap-4">
                    {onImportClick && <Button onClick={onImportClick}>Import</Button>}
                    <Button onClick={handleExport}>Export</Button>
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
                <div className="overflow-x-auto   h-fit rounded-lg">
                    <table className="min-w-full table-auto border-collapse">
                        <thead className="bg-gray-700/50 border border-white rounded-xl text-sm font-semibold text-white">
                            <tr>
                                <th className="px-4 py-2 text-center">Select</th>
                                {Object.keys(data[0])
                                    .filter((key) => !excluded.includes(key))
                                    .map((key) => (
                                        <th key={key} className="px-4 py-2 text-left capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()} {/* Adds space before capital letters for readability */}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white text-black">
                            {data.map((item) => (
                                <tr
                                    onDoubleClick={() => handleDoubleClick(item)}
                                    key={item.id}
                                    className="text-sm cursor-pointer  hover:bg-gray-300 "
                                >
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                            onClick={(e) => e.stopPropagation()} // Prevents double-click from firing on checkbox click
                                        />
                                    </td>
                                    {Object.entries(item)
                                        .filter(([key]) => !excluded.includes(key))
                                        .map(([key, value]) => (
                                            <td key={key} className="px-4 border border-black py-2">
                                                {formatValue(key, value)}
                                            </td>
                                        ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center w-full glass-effect rounded-lg mt-4">
                    <p className="text-gray-400 text-xl">No data available</p>
                </div>
            )}
        </div>
    );
};

export default Report;