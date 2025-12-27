"use client";

import { expectedSchemas } from "@/constants/schemas";
import { useAuthStore } from "@/store/authStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { sikandrabad } from "@/utils/headerMap";
import { parseExcelDate } from "@/utils/parseDate";
import { validateAndMapExcelSchema } from "@/utils/validateSchemas";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";

interface UploadModalProps {
    schemaType: keyof typeof expectedSchemas;
    isOpen: boolean;
    onClose: () => void;
    addEntry: (data: any) => Promise<void>;
    onSuccess: (message: string) => void;
}

const UploadModal = ({ schemaType, isOpen, onClose, onSuccess }: UploadModalProps) => {


    const exportMap = sikandrabad;

    const { user } = useAuthStore();
    const { addMaalkhanaEntry } = useMaalkhanaStore();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ⭐ NEW STATE: To hold the data before final submission
    const [uploadedData, setUploadedData] = useState<any[] | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const integerFields = ["srNo", "gdNo", "boxNo", "Year", "cash", "wine"];
    const allDatabaseKeys = Object.values(exportMap);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        setLoading(true);
        setUploadedData(null); // Clear previous data

        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const workbook = XLSX.read(evt.target?.result, { type: "binary" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawJsonData: any[] = XLSX.utils.sheet_to_json(sheet);

                if (rawJsonData.length === 0) {
                    setError("❌ The uploaded file is empty.");
                    setLoading(false);
                    return;
                }

                // ⭐ STEP 1: Map Excel headers → DB keys
                const mappedData = rawJsonData.map((row) => {
                    const newRow: any = {};

                    for (const excelHeader in row) {
                        const cleaned = excelHeader.trim();

                        // @ts-ignore
                        const dbKey = exportMap[cleaned];

                        if (dbKey) {
                            newRow[dbKey] = row[excelHeader];
                        }
                    }
                    return newRow;
                });

                // ⭐ STEP 2: Validate schema
                const { error, data: validatedData } = validateAndMapExcelSchema(
                    mappedData,
                    "MalkhanaEntry",
                    user?.id
                );

                if (error) {
                    setError(error);
                    setLoading(false);
                    return;
                }

                // ⭐ STEP 3: Final data cleanup
                const fixedData = validatedData.map((entry: any) => {
                    const newEntry: any = {};

                    if (user?.id) newEntry.userId = user.id;

                    for (const key of allDatabaseKeys) {
                        let rawValue = entry[key];

                        // Handle gdDate specifically
                        if (key === "gdDate") {
                            newEntry[key] = parseExcelDate(rawValue);
                            continue;
                        }

                        // Integer fields
                        if (integerFields.includes(key)) {
                            const str = rawValue ? String(rawValue).trim() : "";
                            const parsed = parseInt(str, 10);
                            newEntry[key] =
                                !str || isNaN(parsed) || String(parsed) !== str
                                    ? null
                                    : parsed;
                            continue;
                        }

                        // String fields
                        newEntry[key] = rawValue ? String(rawValue).trim() : "";
                    }

                    return newEntry;
                });

                // ⭐ NEW: Store the cleaned data and show the confirmation modal
                setUploadedData(fixedData);
                // Note: Loading is set to false in finally block, but we keep it true
                // until the user confirms or cancels the submission.

            } catch (err) {
                console.error(err);
                setError("❌ Failed to process Excel file.");
            } finally {
                setLoading(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleClearFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            setError("");
            setUploadedData(null); // Clear data on file clear
        }
    };

    // ⭐ NEW FUNCTION: Handles the final API submission
    const handleConfirmUpload = async () => {
        if (!uploadedData || uploadedData.length === 0) return;

        setLoading(true);
        setError("");

        try {
            // ⭐ STEP 4: Submit to backend
            const isSuccess = await addMaalkhanaEntry(uploadedData);

            if (isSuccess) {
                onSuccess("✅ Data imported successfully!");
                onClose();
            } else {
                setError("❌ Failed to import data.");
            }
        } catch (err) {
            console.error(err);
            setError("❌ An unexpected error occurred during submission.");
        } finally {
            setLoading(false);
            setUploadedData(null); // Clear data after submission attempt
        }
    };

    const handleCancelUpload = () => {
        setUploadedData(null); // Close confirmation modal
        setLoading(false);
        // Optionally clear the file input as well
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (!isOpen) return null;

    // --- Confirmation Modal Display ---
    if (uploadedData) {
        return (
            <div className="fixed z-50 inset-0 bg-black/60  flex justify-center items-center">
                <div className="bg-blue rounded-xl p-6 relative  w-full max-w-xl max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl text-blue-100 font-bold mb-4">
                        Confirm Data Import
                    </h2>
                    <p className="text-blue-200 mb-4">
                        A total of
                        <span className="font-bold mx-2 ">

                            {uploadedData.length}
                        </span>
                        records are ready to be imported. Please review the first few records:
                    </p>

                    {/* Display first 3 records for review */}
                    <div className="bg-blue-100 p-3 rounded-lg text-xs font-mono max-h-60 overflow-y-auto mb-4">
                        {uploadedData.slice(0, 10).map((item, index) => (
                            <pre key={index} className="mb-2 p-1 border-b border-gray-300 last:border-b-0 overflow-x-auto">
                                {JSON.stringify(item, null, 2)}
                            </pre>
                        ))}
                        {uploadedData.length > 3 && (
                            <p className="text-center text-gray-500 mt-2">
                                ... and {uploadedData.length - 10} more records.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={handleCancelUpload}
                            disabled={loading}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                            No, Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmUpload}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {loading ? "Importing..." : "Yes, Import Data"}
                        </Button>
                    </div>

                    {error && <p className="text-red-500 whitespace-pre-wrap mt-4">{error}</p>}
                </div>
            </div>
        );
    }

    // --- Initial File Upload Modal Display ---
    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center">
            <div className="bg-blue p-6 relative rounded w-full max-w-md">
                <h2 className="text-xl text-blue-100 font-bold mb-4">
                    Import Excel - {schemaType}
                </h2>

                <div className="p-4   rounded-lg">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="mb-4 text-blue-200/90 border border-dotted border-gray-400/70 px-4 py-2 rounded-xl w-full"
                        disabled={loading}
                    />
                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={handleClearFile}
                            disabled={loading}
                            className=" border border-blue-100/70 cursor-pointer  text-blue-50"
                        >
                            Clear File
                        </Button>
                    </div>
                </div>

                <div className="absolute top-0 right-2 mt-4">
                    <Button
                        className="rounded-full bg-red-700 hover:bg-red-500 p-2"
                        onClick={onClose}
                    >
                        <X size={16} className="text-white" />
                    </Button>
                </div>

                {loading && <p className="text-blue-500 mt-4">Processing file...</p>}
                {error && <p className="text-red-500 whitespace-pre-wrap mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default UploadModal;