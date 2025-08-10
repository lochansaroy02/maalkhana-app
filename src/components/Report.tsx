"use client";

import { exportToExcel } from "@/utils/exportToExcel";
import { generateSinglePDF } from "@/utils/exportToPDF";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { generateBarcodePDF } from "@/utils/generateBarcodePDF";

interface ReportProps {
    data: any[];
    heading: string;
    link: string;
    onImportClick?: () => void;
    onAddClick?: () => void;
    fetchData?: () => void;
}

const Report = ({
    data,
    heading,
    link,
    onImportClick,
    onAddClick,
    fetchData
}: ReportProps) => {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const formatValue = (key: string, value: any) => {
        if (key === "createdAt" || key === "updatedAt") {
            return new Date(value).toLocaleString();
        }
        if (key === "IsReturned") {
            return value || "No";
        }
        return value || "-";
    };

    const handleExport = () => {
        data && exportToExcel(data, "data");
    };

    const excluded = ["Id", "id", "createdAt", "updatedAt", "photo", "document", "photoUrl", "userId", "districtId"];

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return alert("No entries selected");

        try {
            await axios.post("/api/entry/delete-multiple", { ids: selectedIds });
            alert("Deleted successfully");
            setSelectedIds([]);
            fetchData && fetchData();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting entries");
        }
    };

    // Example handler
    const handlePrint = async (entryData: any,) => {
        await generateSinglePDF(entryData, "pdf1");
    };

    const handleGenerateBarcodePDF = async () => {
        const selectedData = data.filter(item => selectedIds.includes(item.id));
        if (selectedData.length === 0) return alert("No entries selected");
        await generateBarcodePDF(selectedData);
    };
    return (
        <div className="p-4 relative  ">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold mb-4 text-white">{heading}</h1>
                <div className="flex gap-4">
                    <Button onClick={onImportClick}>Import</Button>
                    <Button onClick={handleExport}>Export</Button>
                    <Button onClick={handleDeleteSelected} variant="destructive">
                        Delete Selected
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button onClick={handleGenerateBarcodePDF} className="bg-green-600 text-white">
                            Generate Barcode
                        </Button>
                    )}
                </div>
            </div>

            {data && data.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-300">
                        <thead className="bg-gray-200 text-sm font-semibold">
                            <tr>
                                <th className="border px-2 py-1">Select</th>
                                {Object.keys(data[0])
                                    .filter((key) => !excluded.includes(key))
                                    .map((key) => (
                                        <th key={key} className="border border-gray-400 px-2 py-1 capitalize">
                                            {key}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className="bg-gray-100">
                            {data.map((item, index) => (
                                <tr onDoubleClick={() => {
                                    handlePrint(item)
                                }} key={index} className="text-sm cursor-pointer">
                                    <td className="border px-2 py-1 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                        />
                                    </td>
                                    {Object.entries(item)
                                        .filter(([key]) => !excluded.includes(key))
                                        .map(([key, value]) => (
                                            <td key={key} className="border px-2 py-1">
                                                {formatValue(key, value)}
                                            </td>
                                        ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="h-3/4 flex mt-24 justify-center w-full">
                    <p className="text-blue-100 text-xl">No data available</p>
                </div>
            )}
        </div>
    );
};

export default Report;
