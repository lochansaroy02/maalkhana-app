// components/ui/UploadModal.tsx

"use client";

import { expectedSchemas } from "@/constants/schemas";
import { validateExcelSchema } from "@/utils/validateSchemas";
import { useState } from "react";
import * as XLSX from "xlsx";

interface UploadModalProps {
    schemaType: keyof typeof expectedSchemas;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    addEntry: (data: any, districtId: string | undefined) => Promise<void>
}

const UploadModal = ({ schemaType, isOpen, onClose, onSuccess, addEntry }: UploadModalProps) => {


    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target?.result;
            const workbook = XLSX.read(bstr, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

            const { error, data } = validateExcelSchema(jsonData, expectedSchemas[schemaType]);

            if (error) {
                setError(error);
                return;
            }

            // Post to backend
            setLoading(true);
            try {
                //@ts-ignore
                addEntry(data)
                onSuccess("✅ Data imported successfully");

                onClose();
            } catch (err: any) {
                setError("❌ Failed to import data.");
            } finally {
                setLoading(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[90%] max-w-md">
                <h2 className="text-lg font-bold mb-4">Import Excel - {schemaType}</h2>

                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />

                {loading && <p className="text-blue-500">Importing...</p>}
                {error && <p className="text-red-500 whitespace-pre-wrap">{error}</p>}

                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
