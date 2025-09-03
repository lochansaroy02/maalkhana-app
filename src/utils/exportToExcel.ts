import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file with only the specified keys.
 * @param data The array of data objects to export.
 * @param fileName The name of the exported file.
 * @param orderedKeys The array of keys to include in the export, in the desired order.
 */
export const exportToExcel = (data: any[], fileName: string, orderedKeys: string[]) => {
    // 1. Create a new array with a serial number and only the selected keys.
    const exportedData = data.map((item, index) => {
        const newRow: Record<string, any> = { "Sr. No.": index + 1 };

        // Populate the new object with only the selected keys from the original item
        orderedKeys.forEach(key => {
            // Use a safe check in case a key doesn't exist on the item
            newRow[key] = item[key] !== undefined ? item[key] : "-";
        });

        return newRow;
    });

    // 2. Define the final headers for the worksheet
    const worksheetHeaders = ["Sr. No.", ...orderedKeys];

    // 3. Create the worksheet from the filtered data and specified headers
    const worksheet = XLSX.utils.json_to_sheet(exportedData, { header: worksheetHeaders });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Generate a buffer
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const fileData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `${fileName}.xlsx`);
};
