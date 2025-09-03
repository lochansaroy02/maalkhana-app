"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

const expectedFields = [
    "क्र0सं0",
    "fir No",
    "wine",
    "cash",
    "wine type",
    "photo url",
    "Sr No",
    "Gd no",
    "Gd Date",
    "under section",
    "descrition",
    "year",
    "policestation",
    "विवेचक का नाम",
    "वादी का नाम",
    "एचएम दाखिल कर्ता का नाम",
    "accused",
    "status",
    "entry type",
    "place",
    "box no",
    "court no",
    "court name",
    "case property",
];

const ExcelImport = () => {
    const [error, setError] = useState("");
    const [parsedData, setParsedData] = useState([]);

    const handleFileUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const workbook = XLSX.read(bstr, { type: "binary" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            if (jsonData.length === 0) {
                setError("❌ The Excel file is empty.");
                setParsedData([]);
                return;
            }

            const sheetFields = Object.keys(jsonData[0] as any);

            // Check for missing fields
            const missingFields = expectedFields.filter(
                (field) => !sheetFields.includes(field)
            );

            // Check for extra fields
            const extraFields = sheetFields.filter(
                (field) => !expectedFields.includes(field)
            );

            if (missingFields.length > 0 || extraFields.length > 0) {
                setError(
                    `❌ Schema mismatch:\nMissing Fields: ${missingFields.join(
                        ", "
                    )}\nExtra Fields: ${extraFields.join(", ")}`
                );
                setParsedData([]);
                return;
            }

            setError("");
            setParsedData(jsonData as any);
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