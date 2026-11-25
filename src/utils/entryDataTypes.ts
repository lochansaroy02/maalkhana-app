// Coerces form values to the MalkhanaEntry column types before they reach
// Prisma. Forms send numbers as strings ("10", or "" when empty), and Prisma
// rejects a string for an Int column, which made release/movement saves fail.

const NUMBER_FIELDS = ["wine", "srNo", "gdNo", "Year", "boxNo", "cash", "yellowItemPrice", "malkhanaRackNo"];
const BOOLEAN_FIELDS = ["isReturned", "isMovement", "isRelease", "isNilami", "isDestroy"];

export const convertMalkhanaDataTypes = (data: any) => {
    const converted = { ...data };

    NUMBER_FIELDS.forEach((field) => {
        const v = converted[field];
        if (typeof v === "string") {
            if (v.trim() === "") {
                converted[field] = null;
            } else {
                const parsed = parseInt(v, 10);
                converted[field] = isNaN(parsed) ? null : parsed;
            }
        }
    });

    BOOLEAN_FIELDS.forEach((field) => {
        if (typeof converted[field] === "string") {
            converted[field] = converted[field].toLowerCase() === "true";
        }
    });

    if (converted.firNo === "null") converted.firNo = null;
    if (converted.releaseOrderedBy === "null") converted.releaseOrderedBy = null;

    return converted;
};
