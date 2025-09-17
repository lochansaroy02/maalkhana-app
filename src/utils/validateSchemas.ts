// A utility function to create a reverse map. 
// You can place this in a utils file or at the top of your component file.
const createReverseMap = (map: Record<string, string>): Record<string, string> => {
    const reverseMap: Record<string, string> = {};
    for (const key in map) {
        if (Object.prototype.hasOwnProperty.call(map, key)) {
            reverseMap[map[key as keyof typeof map]] = key;
        }
    }
    return reverseMap;
};

// Create the reverse map of your exportMap. 
// It should be created once outside of any function that runs repeatedly,
// like outside of the component or within a useEffect hook.
export const exportMap = {
    "SR. No.": "srNo",
    "FIR No.": "firNo",
    "GD No.": "gdNo",
    "GD Date": "gdDate",
    "Under Section": "underSection",
    "Description": "description",
    "Case Property": "caseProperty",
    "Police Station": "policeStation",
    "Year": "Year",
    "IO Name": "IOName",
    "Vadi Name": "vadiName",
    "Accused": "accused",
    "Status": "status",
    "Entry Type": "entryType",
    "Place": "place",
    "Box No.": "boxNo",
    "Court No.": "courtNo",
    "Court Name": "courtName",
    "Cash": "cash",
    "Wine": "wine",
    "Wine Type": "wineType",
    "HM": "HM",
};
const reverseExportMap = createReverseMap(exportMap);

// Your expected schema structure, as provided.
export const expectedSchemas = {
    MalkhanaEntry: [
        "id", "wine", "wineType", "srNo", "gdNo", "gdDate", "underSection", "Year",
        "policeStation", "IOName", "vadiName", "HM", "accused", "firNo", "status",
        "entryType", "place", "boxNo", "courtNo", "courtName", "createdAt", "updatedAt",
        "districtId", "photoUrl", "userId", "address", "document", "fathersName",
        "isReturned", "mobile", "moveDate", "movePurpose", "moveTrackingNo", "name",
        "photo", "releaseItemName", "returnBackFrom", "returnDate", "takenOutBy",
        "caseProperty", "receivedBy", "receiverName", "documentUrl", "cash",
        "description", "isMovement", "isRelease", "yellowItemPrice", "dbName",
        "releaseOrderedBy",
    ],
};

/**
 * Validates and maps raw Excel data to the database schema.
 * * @param {any[]} data - The raw JSON data from the Excel sheet.
 * @param {keyof typeof expectedSchemas} schemaType - The type of schema to validate against (e.g., "MalkhanaEntry").
 * @param {string | undefined} userId - The current user's ID to be added to the data.
 * @returns {{error: string | null, data: any[]}} An object containing a potential error and the validated data.
 */
export function validateAndMapExcelSchema(data: any[], schemaType: keyof typeof expectedSchemas, userId: string | undefined) {
    const expectedFields = expectedSchemas[schemaType];

    if (!expectedFields) {
        return { error: `❌ Unknown schema type: ${schemaType}`, data: [] };
    }

    const validatedData = data.map((row) => {
        const completeRow: Record<string, any> = {};

        expectedFields.forEach((dbField) => {
            // Find the corresponding Excel header from the reverse map
            const excelHeader = reverseExportMap[dbField];

            // Get the value from the raw row, using the mapped Excel header
            const importedValue = excelHeader ? row[excelHeader] : undefined;
            const importedValueTrimmed = importedValue ? String(importedValue).trim() : undefined;

            if (importedValueTrimmed !== undefined && importedValueTrimmed !== '' && importedValueTrimmed !== '-') {
                // If a non-empty value exists in the Excel file, assign it
                completeRow[dbField] = importedValue;
            } else if (dbField === "userId" && userId) {
                // Special case: Add the userId if it's available
                completeRow[dbField] = userId;
            } else {
                // Assign a default value for missing fields based on data type
                if (["wine", "cash", "yellowItemPrice", "boxNo"].includes(dbField)) {
                    completeRow[dbField] = 0; // Numbers
                } else if (["isReturned", "isMovement", "isRelease"].includes(dbField)) {
                    completeRow[dbField] = false; // Booleans
                } else if (["createdAt", "updatedAt", "returnDate"].includes(dbField)) {
                    completeRow[dbField] = null; // Dates
                } else {
                    completeRow[dbField] = ""; // Fallback for strings
                }
            }
        });

        // --- Post-processing for data types that need explicit conversion ---
        // This is crucial for "Cash" and "Wine" fields which are sometimes represented as "-" or strings
        if (completeRow.cash) {
            const cashValue = parseInt(completeRow.cash, 10);
            completeRow.cash = isNaN(cashValue) ? null : cashValue;
        }

        if (completeRow.wine) {
            const wineValue = parseInt(completeRow.wine, 10);
            completeRow.wine = isNaN(wineValue) ? null : wineValue;
        }


        
        return completeRow;
    });

    return { error: null, data: validatedData };
}