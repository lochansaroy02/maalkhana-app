
export const kurtidevKeys = [
    "description",
    "firNo",
    "caseProperty",

    "gdDate",
    "policeStation"
];


// export function convertUnicodeToKurtidev(unicodeText: any) {
//     if (!unicodeText) return "";

//     let convertedText = unicodeText;
//     return convertedText;
//     // --- END: PLACEHOLDER CONVERSION LOGIC (REPLACE THIS) ---
// }

const convertUnicodeToKurtidev = (unicodeText: string): string => {
    if (typeof unicodeText !== 'string') return unicodeText;
    // *** PLACEHOLDER FOR ACTUAL CONVERSION LOGIC ***
    // This function must take a Mangal/Unicode string and return a Kurtidev string.
    // return yourActualConversionFunction(unicodeText);
    return `[KDV]${unicodeText}`; // Placeholder to show it was processed
};

export const isLikelyKurtidev = (text: any): boolean => {
    if (typeof text !== 'string') return false;
    // PLACEHOLDER: A robust check is needed here. 
    // For example, checking for specific characters that are unique to the non-unicode font.
    return /[\xA1-\xFF]/.test(text.substring(0, 10)) && !/[\u0900-\u097F]/.test(text.substring(0, 10)); // Very simple placeholder
};
