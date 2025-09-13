import { expectedSchemas } from "@/constants/schemas";

// Corrected header map based on the provided image and schema
export const headerMap = {
    "क्र0सं0": "srlNO", // "srlNO" isn't in your model, consider if you need it. I'll include it for the purpose of the mapping.
    "fir No": "firNo",
    "wine": "wine",
    "cash": "cash",
    "wine type": "wineType",
    "photo url": "photoUrl",
    "Sr No": "srNo",
    "Gd no": "gdNo",
    "Gd Date": "gdDate",
    "under section": "underSection",
    "description": "description",
    "year": "Year",
    "policestatiion": "policeStation",
    "विवेचक का नाम": "IOName", // Mapped to 'IOName' as per your model
    "वादी का नाम": "vadiName",
    "एचएम दाखिल कर्ता का नाम": "HM",
    "accused": "accused",
    "status": "status",
    "entry type": "entryType",
    "place": "place",
    "box no": "boxNo",
    "court no": "courtNo",
    "court name": "courtName", // Added based on your model
    "case protery": "caseProperty", // Corrected typo
};

export const validateAndMapExcelSchema = (
    sheetData: Record<string, any>[],
    schemaType: keyof typeof expectedSchemas
) => {
    if (!sheetData || sheetData.length === 0) {
        return { error: "❌ Empty sheet or no rows found." };
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

    if (missingExcelFields.length > 0 || extraExcelFields.length > 0) {
        return {
            error: `❌ Schema mismatch:\nMissing Excel Headers for DB fields: ${missingExcelFields
                .map((f) => reverseHeaderMap[f] || f)
                .join(", ")}\nExtra Excel Headers: ${extraExcelFields.join(", ")}`,
        };
    }

    // Transform and map the data
    for (const row of sheetData) {
        const newRow: Record<string, any> = {};
        for (const excelHeader of excelHeaders) {
            const dbField = headerMap[excelHeader as keyof typeof headerMap];
            if (dbField) {
                // Convert string values for 'cash' and 'wine' to numbers
                if (dbField === "cash" || dbField === "wine") {
                    newRow[dbField] = parseInt(row[excelHeader], 10) || 0;
                } else {
                    newRow[dbField] = row[excelHeader];
                }
            }
        }
        mappedData.push(newRow);
    }

    return { error: null, data: mappedData };
};