import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';


export const exportToExcel = (data: any[], fileName: string) => {
    // Create a worksheet from your data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a workbook 
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SeizedVehicles");

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
