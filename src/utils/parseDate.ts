import * as XLSX from "xlsx";

export function parseExcelDate(value: any): string {
    if (value === null || value === undefined || value === "") return "";

    // Helper function to format date parts and handle 2-digit year
    const formatParts = (dd: string, mm: string, yy: string): string => {
        if (!dd || !mm || !yy) return "";
        // Convert to full year, assuming years 00-99 are 2000-2099 for now
        const fullYear = yy.length === 2 ? `20${yy}` : yy;

        // Return in 'YYYY-MM-DD' format, ensuring two digits for day/month if necessary (though they should be from split)
        return `${fullYear.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    };

    // 1️⃣ Excel serial number (number type)
    if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
        // Assuming XLSX.SSF.format is available in the scope (e.g., from the SheetJS library)
        try {
            return XLSX.SSF.format("yyyy-mm-dd", value);
        } catch (e) {
        }
    }

    if (typeof value === "string") {
        const trimmedValue = value.trim();

        const separatorMatch = trimmedValue.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);

        if (separatorMatch) {
            const dd = separatorMatch[1];
            const mm = separatorMatch[2];
            const yy = separatorMatch[3];

            return formatParts(dd, mm, yy);
        }

        const d = new Date(trimmedValue);
        if (!isNaN(d.getTime())) {
            if (d.getFullYear() >= 1900) {
                return d.toISOString().split("T")[0];
            }
        }
    }

    return "";
}
