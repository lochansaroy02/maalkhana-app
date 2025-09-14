// components/ExcelImport.tsx

"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

// Define the exact fields you want to import from the Excel sheet.
// These are the fields from your prompt:
const excelHeaders = [
    "Sr. No.",
    "srlNO",
    "firNo",
    "wine",
    "cash",
    "wineType",
    "photoUrl",
    "srNo",
    "gdNo",
    "gdDate",
    "underSection",
    "description",
    "Year",
    "policeStation",
    "receiverName",
    "vadiName",
    "HM",
    "accused",
    "status",
    "entryType",
    "place",
    "boxNo",
    "courtNo",
    "caseProperty",
];

// Define a type for a single row from the Excel sheet with an index signature
interface ExcelRow {
    [key: string]: any;
}

const ExcelImport = () => {
    const [error, setError] = useState("");
    const [parsedData, setParsedData] = useState<ExcelRow[]>([]); // Use the correct type

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const workbook = XLSX.read(bstr, { type: "binary" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Explicitly type the jsonData to avoid the 'any' error
            const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet) as ExcelRow[];

            if (jsonData.length === 0) {
                setError("❌ The Excel file is empty.");
                setParsedData([]);
                return;
            }


            setError("");
            setParsedData(jsonData); // Directly set the parsed data without mapping
            
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