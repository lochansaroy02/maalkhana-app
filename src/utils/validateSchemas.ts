// utils/validateSchema.ts

export const validateExcelSchema = (
    sheetData: Record<string, any>[],
    expectedFields: string[]
) => {
    if (!sheetData || sheetData.length === 0) {
        return { error: "❌ Empty sheet or no rows found." };
    }

    const sheetFields = Object.keys(sheetData[0]);

    const missingFields = expectedFields.filter((f) => !sheetFields.includes(f));
    const extraFields = sheetFields.filter((f) => !expectedFields.includes(f));

    if (missingFields.length > 0 || extraFields.length > 0) {
        return {
            error: `❌ Schema mismatch:\nMissing: ${missingFields.join(
                ", "
            )}\nExtra: ${extraFields.join(", ")}`
        };
    }

    return { error: null, data: sheetData };
};
