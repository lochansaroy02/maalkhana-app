// /utils/reportUtils.ts

import { kurtidevKeys } from "@/utils/font";
import { exportMap, orderedKeys } from "@/utils/map";

// =================================================================
// 🚀 FONT INTEGRATION: KURTIDEV UTILITIES
// =================================================================

/**
 * Utility to check if text is likely already in the non-Unicode Kurtidev font.
 * This is crucial to prevent double-conversion.
 */
export const isLikelyKurtidev = (text: any): boolean => {
    if (typeof text !== 'string' || text.length === 0) return false;
    // PLACEHOLDER: Checks for non-Unicode Hindi characters typically found in legacy fonts (e.g., specific ASCII ranges).
    const nonUnicodePattern = /[\u0080-\u00FF]/; // Simple check for characters in the extended ASCII range
    const unicodePattern = /[\u0900-\u097F]/; // Checks for Devanagari Unicode range (Mangal)

    // Return true if it has non-Unicode characters AND few or no Unicode Devanagari characters
    return nonUnicodePattern.test(text) && !unicodePattern.test(text.substring(0, 10));
};

/**
 * Utility for conversion from Unicode (e.g., Mangal) to Kurtidev.
 * THIS IS A PLACEHOLDER. You MUST implement your actual conversion function here.
 */
export const convertUnicodeToKurtidev = (unicodeText: string): string => {
    if (typeof unicodeText !== 'string') return unicodeText;
    // ⚠️ WARNING: REPLACE THIS LINE WITH YOUR REAL CONVERSION LOGIC
    // Example: return yourActualConversionFunction(unicodeText);
    return `${unicodeText}`; // Placeholder prefix
};

/**
 * Utility to determine if a table cell should have the Kurtidev font class.
 */
export const isKurtidevCell = (key: string) => kurtidevKeys.includes(key);

// =================================================================
// DATA & FORMATTING UTILITIES
// =================================================================

export const excludedKeys = [
    "Id", "id", "createdAt", "updatedAt", "photo", "document", "isReturned", "dbName", "isMovement", "isRelease", "userId", "districtId", "_id", "__v", "",
];

export const formatValue = (key: string, value: any): string => {
    // Date formatting logic
    if (key.toLowerCase().includes("date") || key.toLowerCase().includes("returndate") || key.toLowerCase().includes("movedate")) {
        if (!value) return "-";
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return value; // return original value if it's not a valid date object but exists
        }
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Default return
    return value || "-";
};

export interface HeaderKeyMap {
    header: string;
    key: string; // The database key
}

/**
 * Determines the final list of keys and headers to display in the table.
 * Prioritizes keys in `exportMap` and `orderedKeys`.
 */
export const getHeaderKeysToRender = (headersProp?: string[]): HeaderKeyMap[] => {
    // 1. Map all exportable fields
    const mappedKeys: HeaderKeyMap[] = Object.entries(exportMap).map(([headerName, dbKey]) => ({
        header: headerName,
        key: dbKey,
    }));

    // 2. If no `headers` prop, include other non-excluded keys
    if (!headersProp) {
        const exportMapKeys = Object.values(exportMap);
        const extraKeys: HeaderKeyMap[] = orderedKeys
            .filter(key => !excludedKeys.includes(key) && !exportMapKeys.includes(key))
            .map(key => ({
                header: key === "photoUrl" ? "Photo" : key === "documentUrl" ? "Document" : key,
                key: key,
            }));
        return [...mappedKeys, ...extraKeys];
    }

    // 3. If 'headers' prop is provided, map them back to database keys
    const finalKeys: HeaderKeyMap[] = headersProp.map(header => {
        // Try to find a match in orderedKeys
        const foundKey = orderedKeys.find(key => key.toLowerCase() === header.replace(/\s/g, '').toLowerCase() || header.toLowerCase().includes(key.toLowerCase()));
        return {
            header: header,
            key: foundKey || (header.toLowerCase() === "id" ? "id" : header),
        };
    }).filter(item => !!item.key); // Filter out any that couldn't be mapped

    return finalKeys;
};