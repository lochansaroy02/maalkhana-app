"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

const expectedFields = [
    "id",
    "srNo",
    "gdNo",
    "gdDate",
    "underSection",
    "vehicleType",
    "colour",
    "registrationNo",
    "engineNo",
    "description",
    "status",
    "policeStation",
    "ownerName",
    "seizedBy",
    "caseProperty",
    "updatedAt",
    "createdAt",
];

const ExcelImport = () => {
    const [error, setError] = useState("");
    const [parsedData, setParsedData] = useState<any[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const workbook = XLSX.read(bstr, { type: "binary" });

            // assuming first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

            // Validate schema
            const sheetFields = Object.keys(jsonData[0]);

            const missingFields = expectedFields.filter((f) => !sheetFields.includes(f));
            const extraFields = sheetFields.filter((f) => !expectedFields.includes(f));

            if (missingFields.length > 0 || extraFields.length > 0) {
                setError(
                    `❌ Schema mismatch:\nMissing: ${missingFields.join(
                        ", "
                    )}\nExtra: ${extraFields.join(", ")}`
                );
                setParsedData([]);
                return;
            }

            setError("");
            setParsedData(jsonData);
            console.log("✅ Valid data:", jsonData);
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Import Excel Data</h2>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="mb-4"
            />

            {error && <p className="text-red-600 whitespace-pre-wrap">{error}</p>}

            {parsedData.length > 0 && (
                <div>
                    <h3 className="font-semibold">Imported Data:</h3>
                    <pre className="bg-gray-100 p-2 rounded max-h-[300px] overflow-y-auto text-sm">
                        {JSON.stringify(parsedData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default ExcelImport;
