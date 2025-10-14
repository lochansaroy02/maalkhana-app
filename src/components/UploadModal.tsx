"use client";

import { expectedSchemas } from "@/constants/schemas";
import { useAuthStore } from "@/store/authStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
// 🚨 This is where the logic for handling missing/empty columns must reside.
// It should map missing Excel headers to 'null' or skip non-required fields.
import { validateAndMapExcelSchema } from "@/utils/validateSchemas";
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
// // Your provided map for mapping Excel headers to database keys
// const exportMap = {
//     "SR. No.": "srNo",
//     "FIR No.": "firNo",
//     "GD No.": "gdNo",
//     "GD Date": "gdDate",
//     "Under Section": "underSection",
//     "Description": "description",
//     "Case Property": "caseProperty",
//     "Police Station": "policeStation",
//     "Year": "Year",
//     "IO Name": "IOName",
//     "Vadi Name": "vadiName",
//     "Accused": "accused",
//     "Status": "status",
//     "Entry Type": "entryType",
//     "Place": "place",
//     "Box No.": "boxNo",
//     "Court No.": "courtNo",
//     "Court Name": "courtName",
//     "Cash": "cash",
//     "Wine": "wine",
//     "Wine Type": "wineType",
//     "HM": "HM",
// };
// // Your provided map for mapping Excel headers to database keys
const exportMap = {
    "माल सं0": "srNo",
    "मु0अ0सं0 (FIR No)": "firNo",
    "जीडी न0": "gdNo",
    "जीडी दिनांक": "gdDate",
    "धारा": "underSection",
    "विवरण": "description",
    "case property": "caseProperty",
    "थाना": "policeStation",
    "वर्ष": "Year",
    "विवेचक का नाम": "IOName",
    "वादी का नाम": "vadiName",
    "अभियुक्त": "accused",
    "अभियोग की स्थिति (STATUS)": "status",
    "दाखिल मालखाना (ENTRY TYPE)": "entryType",
    "स्थान": "place",
    "बोक्स न0": "boxNo",
    "कोर्ट सं0": "courtNo",
    "कोर्ट का नाम": "courtName",
    "नकद (case)": "cash",
    "शराब (wine)": "wine",
    "शराब का प्रकार (wine type)": "wineType",
    "HM/दाखिल कर्ता का नाम": "HM",
};

const UploadModal = ({ schemaType, isOpen, onClose, onSuccess, addEntry }: UploadModalProps) => {

    const { user } = useAuthStore()
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addMaalkhanaEntry } = useMaalkhanaStore()

    // 1. Define fields that MUST be integers (Int or Null)
    const integerFields = ["srNo", "gdNo", "boxNo", "Year", "cash", "wine"];
    // 2. Get ALL possible database keys from your export map to ensure no argument is missing
    const allDatabaseKeys = Object.values(exportMap);


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

                // Get the raw JSON data from the Excel sheet (keys are original headers)
                const rawJsonData: any[] = XLSX.utils.sheet_to_json(sheet);

                if (rawJsonData.length === 0) {
                    setError("❌ The uploaded file is empty.");
                    setLoading(false);
                    return;
                }

                // --- STEP 1: Map Excel Headers to Database Keys ---
                const excelToDbKeyMap: Record<string, string> = exportMap;
                const mappedData = rawJsonData.map((row) => {
                    const newRow: any = {};
                    for (const excelHeader in row) {
                        // Trim whitespace from the Excel header for robust matching
                        const cleanedHeader = excelHeader.trim();
                        const dbKey = excelToDbKeyMap[cleanedHeader];

                        // Map the value if the header is recognized
                        if (dbKey) {
                            newRow[dbKey] = row[excelHeader];
                        }
                    }
                    return newRow;
                });

                console.log(mappedData);

                // --- STEP 2: Validate Schema (using mapped keys) ---
                // The validateAndMapExcelSchema is assumed to run validation and potentially 
                // fill in other required fields. We pass the data with mapped keys.
                // NOTE: If validateAndMapExcelSchema is a simple validator, you can pass mappedData directly.
                // If it relies on a specific schema for MalkhanaEntry, we keep it here.
                const { error, data: validatedData } = validateAndMapExcelSchema(mappedData, "MalkhanaEntry", user?.id);

                if (error) {
                    setError(error);
                    setLoading(false);
                    return;
                }
                console.log(validatedData);
                // --- STEP 3: Coerce Types and Ensure All Fields are Present (Type Fixing) ---
                const fixedData = validatedData.map((entry: any) => {
                    const newEntry: any = {};
                    if (user?.id) {
                        newEntry.userId = user.id;
                    }

                    // Iterate over ALL possible database keys to ensure every field is present (or null/empty string)
                    for (const key of allDatabaseKeys) {
                        const rawValue = entry[key];

                        if (integerFields.includes(key)) {
                            // --- Logic for Integer Fields (Int or Null) ---
                            const valueStr = rawValue != null ? String(rawValue).trim() : "";

                            if (valueStr === "") {
                                newEntry[key] = null; // Set to null for missing integers
                            } else {
                                const parsedInt = parseInt(valueStr, 10);

                                // Robust check: isNaN OR if string representation of parsed int doesn't match original string
                                if (isNaN(parsedInt) || String(parsedInt) !== valueStr) {
                                    newEntry[key] = null;
                                } else {
                                    newEntry[key] = parsedInt;
                                }
                            }

                        } else {
                            // --- Logic for String Fields (String or Empty String) ---
                            if (rawValue == null || String(rawValue).trim() === "") {
                                // Explicitly set missing/empty string fields to empty string ("") 
                                // as per your example JSON for fields like 'firNo'.
                                newEntry[key] = "";
                            } else {
                                // Ensure it is explicitly a string and trim whitespace
                                newEntry[key] = String(rawValue).trim();
                            }
                        }
                    }

                    return newEntry; // Return the new entry with all keys guaranteed
                });


                const isSuccess = await addMaalkhanaEntry(fixedData);

                if (isSuccess) {
                    onSuccess("✅ Data imported successfully");
                    onClose();
                } else {
                    setError("❌ Failed to import data. Check server logs.");
                }

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







































































// "use client";

// import { expectedSchemas } from "@/constants/schemas";
// import { useAuthStore } from "@/store/authStore";
// import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
// // 🚨 This is where the logic for handling missing/empty columns must reside.
// // It should map missing Excel headers to 'null' or skip non-required fields.
// import { validateAndMapExcelSchema } from "@/utils/validateSchemas";
// import { X } from "lucide-react";
// import { useRef, useState } from "react";
// import * as XLSX from "xlsx";
// import { Button } from "./ui/button";

// interface UploadModalProps {
//     schemaType: keyof typeof expectedSchemas;
//     isOpen: boolean;
//     onClose: () => void;
//     onSuccess: (message: string) => void;
//     addEntry: (data: any) => Promise<void>;
// }

// // Your provided map for mapping Excel headers to database keys
// const exportMap = {
//     "SR. No.": "srNo",
//     "FIR No.": "firNo",
//     "GD No.": "gdNo",
//     "GD Date": "gdDate",
//     "Under Section": "underSection",
//     "Description": "description",
//     "Case Property": "caseProperty",
//     "Police Station": "policeStation",
//     "Year": "Year",
//     "IO Name": "IOName",
//     "Vadi Name": "vadiName",
//     "Accused": "accused",
//     "Status": "status",
//     "Entry Type": "entryType",
//     "Place": "place",
//     "Box No.": "boxNo",
//     "Court No.": "courtNo",
//     "Court Name": "courtName",
//     "Cash": "cash",
//     "Wine": "wine",
//     "Wine Type": "wineType",
//     "HM": "HM",
// };

// const UploadModal = ({ schemaType, isOpen, onClose, onSuccess, addEntry }: UploadModalProps) => {

//     const { user } = useAuthStore()
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const { addMaalkhanaEntry } = useMaalkhanaStore()





//     const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         setLoading(true);
//         setError("");

//         const reader = new FileReader();
//         reader.onload = async (evt) => {
//             try {
//                 const bstr = evt.target?.result;
//                 const workbook = XLSX.read(bstr, { type: "binary" });
//                 const sheetName = workbook.SheetNames[0];
//                 const sheet = workbook.Sheets[sheetName];

//                 // Get the raw JSON data from the Excel sheet
//                 const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

//                 if (jsonData.length === 0) {
//                     setError("❌ The uploaded file is empty.");
//                     setLoading(false);
//                     return;
//                 }

//                 // Validate, map, and fill missing fields using our custom function
//                 const { error, data: validatedData } = validateAndMapExcelSchema(jsonData, "MalkhanaEntry", user?.id);

//                 if (error) {
//                     setError(error);
//                     setLoading(false);
//                     return;
//                 }

//                 // 1. Define fields that MUST be integers (Int or Null)
//                 // Includes previous fields and likely numeric ones (Cash, Wine)
//                 const integerFields = ["srNo", "gdNo", "boxNo", "Year", "cash", "wine"];

//                 // 2. Get ALL possible database keys from your export map to ensure no argument is missing
//                 const allDatabaseKeys = Object.values(exportMap);

//                 const fixedData = validatedData.map((entry: any) => {
//                     const newEntry: any = {};
//                     if (user?.id) {
//                         newEntry.userId = user.id;
//                     }
//                     // Iterate over ALL possible database keys to ensure every field is present (or null)
//                     for (const key of allDatabaseKeys) {
//                         // The value from the Excel data
//                         const rawValue = entry[key];

//                         if (integerFields.includes(key)) {
//                             // --- Logic for Integer Fields (Int or Null) ---
//                             const valueStr = rawValue != null ? String(rawValue).trim() : "";

//                             if (valueStr === "") {
//                                 newEntry[key] = null;
//                             } else {
//                                 const parsedInt = parseInt(valueStr, 10);
//                                 newEntry[key] = isNaN(parsedInt) || String(parsedInt) !== valueStr ? null : parsedInt;
//                             }

//                         } else {
//                             // --- Logic for String Fields (String or Null, including 'wineType', 'accused',a etc.) ---

//                             if (rawValue == null || String(rawValue).trim() === "") {
//                                 // Explicitly set missing/empty string fields to null 
//                                 newEntry[key] = "";
//                             } else {
//                                 // Ensure it is explicitly a string and trim whitespace
//                                 newEntry[key] = String(rawValue).trim();
//                             }
//                         }
//                     }

//                     return newEntry; // Return the new entry with all keys guaranteed
//                 });

//                 // Now, send the FIXED data (which is an array) to the API
//                 console.log(validatedData);
//                 const isSuccess = await addMaalkhanaEntry(fixedData);

//                 if (isSuccess) {
//                     onSuccess("✅ Data imported successfully");
//                     onClose();
//                 } else {
//                     setError("❌ Failed to import data. Check server logs.");
//                 }

//             } catch (err: any) {
//                 console.error("Error processing file:", err);
//                 setError(`❌ Failed to process the Excel file. Please ensure it's in the correct format.`);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         reader.readAsBinaryString(file);
//     };

//     const handleClearFile = () => {
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//             setError("");
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center">
//             <div className="bg-blue p-6 relative rounded w-[200%] max-w-md">
//                 <h2 className="text-lg text-blue-100 font-bold mb-4">Import Excel - {schemaType}</h2>
//                 <div className="p-4 ">
//                     <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4 text-blue-100/70 border border-dotted border-blue-100 px-4 py-2 rounded-xl" />
//                     <Button onClick={handleClearFile} className="border border-white">Clear File</Button>
//                 </div>

//                 {loading && <p className="text-blue-500">Importing...</p>}
//                 {error && <p className="text-red-500  whitespace-pre-wrap">{error}</p>}
//                 <div className="flex top-56 right-56  absolute justify-end gap-2 mt-4">
//                     <Button className=" flex rounded-full bg-red-700 hover:bg-red-500 items-center justify-center " onClick={onClose}><X size={12} /></Button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UploadModal;