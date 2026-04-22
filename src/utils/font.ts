// src/utils/font.ts

export const kurtidevKeys: any = [
    // "description",
    // "entryType",
    // "firNo",
    // "caseProperty",
    // "gdDate",
    // "IOName",
    // "isRelease"
    // "policeStation",
    // "underSection",
    // "vadiName",
    // "boxNo"
];

/**
 * 2. Utility to check if text is likely already in the non-Unicode Kurtidev font.
 * Checks for characters in the extended ASCII range (typical of legacy fonts) 
 * and checks for the *absence* of clear Unicode Devanagari characters.
 */
export const isLikelyKurtidev = (text: any): boolean => {
    if (typeof text !== 'string' || text.length === 0) return false;

    // Check for non-Unicode characters (e.g., extended ASCII/Latin-1 Supplement range)
    const nonUnicodePattern = /[\u0080-\u00FF]/;

    // Check for Devanagari Unicode range (Mangal)
    const unicodePattern = /[\u0900-\u097F]/;

    // Return true if it has non-Unicode characters AND few or no Unicode Devanagari characters
    // Using a slice for performance/relevance check.
    const textSample = text.substring(0, 50);
    return nonUnicodePattern.test(textSample) && !unicodePattern.test(textSample);
};


/**
 * 3. Utility for conversion from Unicode (e.g., Mangal) to Kurtidev.
 * THIS IS A PLACEHOLDER. You MUST implement your actual conversion function here.
 * The front-end is configured to apply the 'font-kurtidev' class *after* this conversion 
 * if the year is in the 1991-2021 range, which tells the browser to render the output 
 * as Kruti Dev 010.
 */
export const convertUnicodeToKurtidev = (unicodeText: string): string => {
    if (typeof unicodeText !== 'string') return unicodeText;
    // ⚠️ WARNING: REPLACE THE NEXT LINE WITH YOUR REAL UNICODE-TO-KRUTI-DEV-010 LOGIC
    // return yourActualConversionFunction(unicodeText);
    return unicodeText; // Placeholder - currently returns the original Unicode text
};


/**
 * Utility to convert Kruti Dev 010 to Unicode (Not used for display, but helpful for other utilities)
 */
export const kurtidevToUnicode = (krutiText: string): string => {
    // ... (Your existing, extensive Kruti Dev 010 to Unicode conversion logic remains here)
    if (!krutiText || typeof krutiText !== 'string') {
        return krutiText;
    }

    let unicodeText = krutiText;

    // --- Special Characters (Top Priority) ---
    unicodeText = unicodeText.replace(/®/g, "र्");
    unicodeText = unicodeText.replace(/Ü/g, "ह्न");
    unicodeText = unicodeText.replace(/Ø/g, "क्त");
    unicodeText = unicodeText.replace(/Ç/g, "त्र");
    unicodeText = unicodeText.replace(/Ú/g, "छ्र");
    unicodeText = unicodeText.replace(/é/g, "झ्");
    unicodeText = unicodeText.replace(/¥/g, "द्ध");
    unicodeText = unicodeText.replace(/Î/g, "ट्ट");
    unicodeText = unicodeText.replace(/Ç/g, "त्र");
    unicodeText = unicodeText.replace(/Ê/g, "कृ");
    unicodeText = unicodeText.replace(/»/g, "द्र");
    unicodeText = unicodeText.replace(/†/g, "ङ");
    unicodeText = unicodeText.replace(/þ/g, "घ्");

    // --- Halant (Virama) and Special Consonants (High Priority) ---
    // unicodeText = unicodeText.replace(/V/g, "्");
    unicodeText = unicodeText.replace(/\//g, "ध");// Virama/Halant
    unicodeText = unicodeText.replace(/\*/g, "त्र");
    unicodeText = unicodeText.replace(/}/g, "ज्ञ");
    unicodeText = unicodeText.replace(/Z/g, "ज़");
    unicodeText = unicodeText.replace(/ò/g, "ड़");
    unicodeText = unicodeText.replace(/ó/g, "ढ़");
    unicodeText = unicodeText.replace(/Q/g, "फ");
    unicodeText = unicodeText.replace(/K/g, "क");

    // --- Vowels and Matras (Right-Side Vowels first) ---
    unicodeText = unicodeText.replace(/k/g, "ा");
    unicodeText = unicodeText.replace(/h/g, "ि");
    unicodeText = unicodeText.replace(/h/g, "ी");
    unicodeText = unicodeText.replace(/u/g, "ु");
    unicodeText = unicodeText.replace(/w/g, "ू");
    unicodeText = unicodeText.replace(/\s/g, "े");
    unicodeText = unicodeText.replace(/a/g, "ौ");
    unicodeText = unicodeText.replace(/\E/g, "ऎ");
    unicodeText = unicodeText.replace(/\D/g, "ए");

    // --- Consonants and Modifiers ---
    unicodeText = unicodeText.replace(/p/g, "च");
    unicodeText = unicodeText.replace(/j/g, "ज");
    unicodeText = unicodeText.replace(/l/g, "ल");
    unicodeText = unicodeText.replace(/;/g, "स");
    unicodeText = unicodeText.replace(/N/g, "न");
    unicodeText = unicodeText.replace(/O/g, "ध");
    unicodeText = unicodeText.replace(/P/g, "द");
    unicodeText = unicodeText.replace(/x/g, "ट");
    unicodeText = unicodeText.replace(/\M/g, "ङ");
    unicodeText = unicodeText.replace(/#/g, "क्ष");
    unicodeText = unicodeText.replace(/\)/g, "य");

    // --- Remaining common mappings ---
    unicodeText = unicodeText.replace(/d/g, "ि");
    unicodeText = unicodeText.replace(/f/g, "ी");
    unicodeText = unicodeText.replace(/i/g, "ा");
    unicodeText = unicodeText.replace(/e/g, "ा");

    // More common mappings
    unicodeText = unicodeText.replace(/s/g, "म");
    unicodeText = unicodeText.replace(/S/g, "ट");
    unicodeText = unicodeText.replace(/t/g, "त");
    unicodeText = unicodeText.replace(/T/g, "थ");
    unicodeText = unicodeText.replace(/g/g, "ह");
    unicodeText = unicodeText.replace(/G/g, "घ");
    unicodeText = unicodeText.replace(/y/g, "ऱ");
    unicodeText = unicodeText.replace(/r/g, "र");
    unicodeText = unicodeText.replace(/R/g, "रु");
    unicodeText = unicodeText.replace(/I/g, "ई");
    unicodeText = unicodeText.replace(/A/g, "ऐ");
    unicodeText = unicodeText.replace(/C/g, "ण");
    unicodeText = unicodeText.replace(/J/g, "झ");
    unicodeText = unicodeText.replace(/L/g, "ल");
    unicodeText = unicodeText.replace(/U/g, "ड़");
    unicodeText = unicodeText.replace(/W/g, "ऊ");
    unicodeText = unicodeText.replace(/Y/g, "श्र");
    unicodeText = unicodeText.replace(/b/g, "ब");
    unicodeText = unicodeText.replace(/B/g, "भ");
    unicodeText = unicodeText.replace(/m/g, "व");
    unicodeText = unicodeText.replace(/M/g, "म");
    unicodeText = unicodeText.replace(/v/g, "य");
    unicodeText = unicodeText.replace(/n/g, "न");
    unicodeText = unicodeText.replace(/H/g, "अ");
    unicodeText = unicodeText.replace(/;/g, "स");
    unicodeText = unicodeText.replace(/:/g, "श");
    unicodeText = unicodeText.replace(/'/g, "ष");
    unicodeText = unicodeText.replace(/\"/g, "श्");
    unicodeText = unicodeText.replace(/\./g, "।");

    // Rephrasing R-akar and others: Needs careful context-sensitive regex in a real-world scenario.
    // For simplicity and common use:
    unicodeText = unicodeText.replace(/\^/g, "्र"); // R-akar below consonant

    // --- Numbers ---
    unicodeText = unicodeText.replace(/1/g, "१");
    unicodeText = unicodeText.replace(/2/g, "२");
    unicodeText = unicodeText.replace(/3/g, "३");
    unicodeText = unicodeText.replace(/4/g, "४");
    unicodeText = unicodeText.replace(/5/g, "५");
    unicodeText = unicodeText.replace(/6/g, "६");
    unicodeText = unicodeText.replace(/7/g, "७");
    unicodeText = unicodeText.replace(/8/g, "८");
    unicodeText = unicodeText.replace(/9/g, "९");
    unicodeText = unicodeText.replace(/0/g, "०");

    return unicodeText;
};