"use client";

import { expectedSchemas, } from "@/constants/schemas";
import { headerMap } from "@/utils/headerMappings";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";

interface UploadModalProps {
    schemaType: keyof typeof expectedSchemas;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    addEntry: (data: any) => Promise<void>;
}

// Helper function for validation and mapping
const validateAndMapExcelSchema = (
    sheetData: Record<string, any>[],
    schemaType: keyof typeof expectedSchemas
) => {
    if (!sheetData || sheetData.length === 0) {
        return { error: "❌ Empty sheet or no rows found.", data: null };
    }

    const excelHeaders = Object.keys(sheetData[0]);
    const expectedDbFields = expectedSchemas[schemaType];

    const mappedData: Record<string, any>[] = [];

    const reverseHeaderMap: Record<string, string> = {};
    for (const key in headerMap) {
        if (Object.prototype.hasOwnProperty.call(headerMap, key)) {
            reverseHeaderMap[headerMap[key as keyof typeof headerMap]] = key;
        }
    }

    const missingExcelFields = expectedDbFields.filter(
        (dbField) => !excelHeaders.includes(reverseHeaderMap[dbField])
    );
    const extraExcelFields = excelHeaders.filter(
        (excelHeader) => !Object.keys(headerMap).includes(excelHeader)
    );

    if (missingExcelFields.length > 0) {
        const missingHeaders = missingExcelFields
            .map((f) => reverseHeaderMap[f] || f)
            .join(", ");
        return {
            error: `❌ Schema mismatch: The following required headers are missing: ${missingHeaders}.`,
            data: null,
        };
    }

    if (extraExcelFields.length > 0) {
        console.warn(`⚠️ Warning: Extra Excel headers found and will be ignored: ${extraExcelFields.join(", ")}`);
    }

    for (const row of sheetData) {
        const newRow: Record<string, any> = {};
        for (const excelHeader of excelHeaders) {
            const dbField = headerMap[excelHeader as keyof typeof headerMap];
            if (dbField && expectedDbFields.includes(dbField)) {
                const rawValue = row[excelHeader];
                let processedValue;

                switch (dbField) {
                    case "firNo":
                    case "srNo":
                        processedValue = String(rawValue || "");
                        break;
                    case "gdNo":
                    case "gdDate":
                    case "underSection":
                    case "Year":
                    case "cash":
                    case "wine":
                    case "srlNO":
                        processedValue = parseInt(rawValue, 10);
                        if (isNaN(processedValue)) {
                            processedValue = null;
                        }
                        break;
                    default:
                        processedValue = String(rawValue || "");
                        break;
                }
                newRow[dbField] = processedValue;
            }
        }
        mappedData.push(newRow);
    }

    return { error: null, data: mappedData };
};


const UploadModal = ({ schemaType, isOpen, onClose, onSuccess, addEntry }: UploadModalProps) => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError("");

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const workbook = XLSX.read(bstr, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const headers: any = data[1];
                const jsonData = data.slice(2).map((row: any) => {
                    const obj: Record<string, any> = {};
                    row.forEach((value: any, index: any) => {
                        const header = headers[index]?.toString().trim();
                        if (header) {
                            obj[header] = value;
                        }
                    });
                    return obj;
                }).filter(obj => Object.keys(obj).length > 0 && Object.values(obj).some(v => v !== ''));

                const { error, data: mappedData } = validateAndMapExcelSchema(jsonData, schemaType);

                if (error) {
                    setError(error);
                    setLoading(false);
                    return;
                }

                await addEntry(mappedData);
                onSuccess("✅ Data imported successfully");
                onClose();

            } catch (err: any) {
                console.error("Error processing file:", err);
                setError(`❌ Failed to process the Excel file. Please ensure it's in the correct format.`);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleClearFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            setError("");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center">
            <div className="bg-blue p-6 relative rounded w-[200%] max-w-md">
                <h2 className="text-lg text-blue-100 font-bold mb-4">Import Excel - {schemaType}</h2>
                <div className="p-4 ">
                    <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4 text-blue-100/70 border border-dotted border-blue-100 px-4 py-2 rounded-xl" />
                    <Button onClick={handleClearFile} className="border border-white">Clear File</Button>
                </div>

                {loading && <p className="text-blue-500">Importing...</p>}
                {error && <p className="text-red-500  whitespace-pre-wrap">{error}</p>}
                <div className="flex top-56 right-56  absolute justify-end gap-2 mt-4">
                    <Button className=" flex rounded-full bg-red-700 hover:bg-red-500 items-center justify-center " onClick={onClose}><X size={12} /></Button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;