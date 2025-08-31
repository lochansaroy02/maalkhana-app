import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, orderedKeys: string[]) => {
    // 1. Create a new array to hold the data with a serial number.
    const dataWithSerial = data.map((item, index) => {
        return { "Sr. No.": index + 1, ...item };
    });

    const excluded = [
        "Id", "id", "createdAt", "updatedAt", "photoUrl", "documentUrl", "isReturned",
        "isRelease", "photoUrl", "userId", "districtId", "id", "__v", "isRelease", "dbName", "userId"
    ];


    // 2. Filter the orderedKeys to create the final header for the Excel file.
    const excelHeaders = orderedKeys.filter(key => !excluded.includes(key));


    excelHeaders.unshift("Sr. No.");


    const worksheet = XLSX.utils.json_to_sheet(dataWithSerial, { header: excelHeaders });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Generate a buffer
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    // Create a Blob and trigger download
    const fileData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `${fileName}.xlsx`);
};