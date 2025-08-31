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

    const orderedKeys = [
        'firNo',
        'srNo',
        'gdNo',
        'gdDate',
        'underSection',
        'caseProperty',
        'policeStation',
        'I O Name',
        'vadiName',
        'accused',
        'status',
        'entryType',
        'place',
        'boxNo',
        'courtNo',
        'courtName',
        'address',
        'fathersName',
        'mobile',
        'name',
        'releaseItemName',
        'returnDate',

        'description',
        'wine',
        'wineType',
        'Year',
        'HM',
        'moveDate',
        'movePurpose',
        'moveTrackingNo',
        'returnBackFrom',
        'takenOutBy',
        'receivedBy',
        'receiverName',
        'documentUrl',
        'cash',
        'isMovement',
        'isRelease',
        'yellowItemPrice',
        'dbName'
    ];

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

    const excluded = ["Id", "id", "createdAt", "updatedAt", "photo", "document", "isReturned", "isRelease", "photoUrl", "userId", "districtId", "_id", "__v", ""];

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
        // You can remove this section as it's not directly related to the heading order issue
        const excluded = ["Id", "id", "createdAt", "updatedAt", "photo", "document", "userId", "districtId", "_id", "__v", ''];

        // Get all keys and filter out the excluded ones
        const allKeys = Object.keys(item).filter(key => !excluded.includes(key));

        // Create a new array to store the keys in the desired order
        const sortedVisibleKeys: string[] = [];

        // Add the keys from our predefined order list first
        orderedKeys.forEach(key => {
            if (allKeys.includes(key)) {
                sortedVisibleKeys.push(key);
            }
        });

        // Add any remaining keys that were not in the predefined list
        allKeys.forEach(key => {
            if (!sortedVisibleKeys.includes(key)) {
                sortedVisibleKeys.push(key);
            }
        });

        sessionStorage.setItem('visibleReportFields', JSON.stringify(sortedVisibleKeys));
        console.log(sortedVisibleKeys)

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
                                {/* Iterate over orderedKeys to control the column order
                                    and filter out excluded keys
                                */}
                                {orderedKeys
                                    .filter((key) => !excluded.includes(key))
                                    .map((key) => (
                                        <th key={key} className="px-4 py-2 text-left capitalize">
                                            {key}
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
                                    {/* Iterate over orderedKeys here as well to ensure data cells match the header order
                                    */}
                                    {orderedKeys
                                        .filter((key) => !excluded.includes(key))
                                        .map((key) => (
                                            <td key={key} className="px-4 border border-black py-2">
                                                {formatValue(key, item[key])}
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