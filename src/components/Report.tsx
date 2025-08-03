"use client";

import { exportToExcel } from "@/utils/exportToExcel";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface ReportProps {
    data: [],
    heading: string
    link: string
    onImportClick?: () => void;
    onAddClick?: () => void;
}

const Report = ({ data, heading, link, onImportClick, onAddClick }: ReportProps) => {


    const router = useRouter()
    const formatValue = (key: string, value: any) => {
        if (key === "createdAt" || key === "updatedAt") {
            return new Date(value).toLocaleString();
        }
        return value || "-";
    };

    const handleExport = () => {
        data && exportToExcel(data, "data")
    }


    const excluded = ["Id", "id", "createdAt", "updatedAt", "photo", "document"]
    return (
        <div className="p-4  relative glass-effect  h-screen ">
            <div className='flex  justify-between'>
                <h1 className="text-2xl font-bold mb-4 text-white">{heading}</h1>
                <div className="flex gap-4 ">
                    <Button className="cursor-pointer" onClick={onImportClick}>Import</Button>
                    <Button className="cursor-pointer" onClick={() => {
                        router.push(link)
                    }}>Add Record</Button>
                    <Button onClick={handleExport}>Export </Button>
                </div>
            </div>
            {data && data.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-300">
                        <thead className="bg-gray-200 text-sm font-semibold">
                            <tr>
                                {data.length > 0 &&
                                    //@ts-ignore
                                    Object.keys(data[0])
                                        .filter((key) => !excluded.includes(key))
                                        .map((key) => (
                                            <th key={key} className="border border-gray-400 px-2 py-1 capitalize">
                                                {key}
                                            </th>
                                        ))}
                            </tr>
                        </thead>
                        <tbody className='bg-gray-100'>
                            {data.map((item, index) => (
                                <tr key={index} className="text-sm">
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
                <p>No data available</p>
            )}


        </div>
    )
}

export default Report