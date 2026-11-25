// Excel / PDF export for the category drill-down modal.

import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { ensureFontsReady, fitText, font, toPrintable, wrapText } from "./hindiCanvas";

export interface ExportColumn {
    header: string;
    key: string;
    /** Relative column width. */
    width: number;
}

export const exportItemsToExcel = (
    rows: Record<string, unknown>[],
    columns: ExportColumn[],
    sheetName: string,
    fileName: string
) => {
    const data = rows.map((row, i) => {
        const out: Record<string, unknown> = {};
        columns.forEach((c) => {
            out[c.header] = c.key === "#" ? i + 1 : toPrintable(row[c.key]);
        });
        return out;
    });
    const ws = XLSX.utils.json_to_sheet(data, { header: columns.map((c) => c.header) });
    ws["!cols"] = columns.map((c) => ({ wch: Math.max(6, Math.round(c.width * 1.6)) }));
    const wb = XLSX.utils.book_new();
    // Sheet names: max 31 chars, no []:*?/\
    XLSX.utils.book_append_sheet(wb, ws, sheetName.replace(/[[\]:*?/\\]/g, " ").slice(0, 31) || "Sheet1");
    XLSX.writeFile(wb, fileName);
};

/**
 * Renders a table to an A4-landscape PDF. Each page is drawn on a canvas so
 * Hindi text is shaped correctly.
 */
export const exportItemsToPDF = async (
    rows: Record<string, unknown>[],
    columns: ExportColumn[],
    title: string,
    subtitle: string,
    fileName: string
) => {
    await ensureFontsReady();

    const PX_PER_MM = 6; // ~150 dpi – sharp enough for print, keeps the file small
    const PAGE_W_MM = 297;
    const PAGE_H_MM = 210;
    const W = PAGE_W_MM * PX_PER_MM;
    const H = PAGE_H_MM * PX_PER_MM;
    const MARGIN = 10 * PX_PER_MM;
    const HEADER_H = 22 * PX_PER_MM;
    const TABLE_HEAD_H = 8 * PX_PER_MM;
    const FOOTER_H = 8 * PX_PER_MM;
    const CELL_PAD = 1.5 * PX_PER_MM;
    const FONT_PX = 3.2 * PX_PER_MM;
    const LINE_H = FONT_PX * 1.45;
    const MAX_LINES = 3;

    const tableW = W - MARGIN * 2;
    const totalWeight = columns.reduce((s, c) => s + c.width, 0);
    const colW = columns.map((c) => (c.width / totalWeight) * tableW);

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");

    const doc = new jsPDF({ orientation: "l", unit: "mm", format: "a4" });
    const generatedOn = new Date().toLocaleString("en-IN");

    // Pre-compute wrapped cell lines and row heights.
    ctx.font = font(FONT_PX);
    const prepared = rows.map((row, i) => {
        const cells = columns.map((c, ci) => {
            const text = c.key === "#" ? String(i + 1) : toPrintable(row[c.key]);
            return wrapText(ctx, text, colW[ci] - CELL_PAD * 2, MAX_LINES);
        });
        const lines = Math.max(1, ...cells.map((l) => l.length));
        return { cells, height: lines * LINE_H + CELL_PAD * 2 };
    });

    const drawPageFrame = (pageNo: number) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#102647";
        ctx.textBaseline = "top";
        ctx.font = font(6 * PX_PER_MM, "bold");
        ctx.fillText(title, MARGIN, MARGIN);
        ctx.font = font(3.4 * PX_PER_MM);
        ctx.fillStyle = "#475569";
        ctx.fillText(subtitle, MARGIN, MARGIN + 8 * PX_PER_MM);
        ctx.textAlign = "right";
        ctx.fillText(generatedOn, W - MARGIN, MARGIN + 8 * PX_PER_MM);
        ctx.textAlign = "left";

        // Table header
        const y = HEADER_H;
        ctx.fillStyle = "#102647";
        ctx.fillRect(MARGIN, y, tableW, TABLE_HEAD_H);
        ctx.fillStyle = "#ffffff";
        ctx.font = font(FONT_PX, "bold");
        ctx.textBaseline = "middle";
        let x = MARGIN;
        columns.forEach((c, ci) => {
            ctx.fillText(fitText(ctx, c.header, colW[ci] - CELL_PAD * 2), x + CELL_PAD, y + TABLE_HEAD_H / 2);
            x += colW[ci];
        });

        // Footer
        ctx.fillStyle = "#64748b";
        ctx.font = font(3 * PX_PER_MM);
        ctx.textAlign = "center";
        ctx.fillText(`Page ${pageNo}`, W / 2, H - FOOTER_H / 2 - MARGIN / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
    };

    const flushPage = (first: boolean) => {
        if (!first) doc.addPage();
        doc.addImage(canvas.toDataURL("image/jpeg", 0.85), "JPEG", 0, 0, PAGE_W_MM, PAGE_H_MM);
    };

    let pageNo = 1;
    let firstPage = true;
    drawPageFrame(pageNo);
    let y = HEADER_H + TABLE_HEAD_H;
    const bottomLimit = H - MARGIN - FOOTER_H;

    if (prepared.length === 0) {
        ctx.fillStyle = "#475569";
        ctx.font = font(FONT_PX);
        ctx.fillText("No records", MARGIN + CELL_PAD, y + CELL_PAD);
    }

    prepared.forEach((row, ri) => {
        if (y + row.height > bottomLimit) {
            flushPage(firstPage);
            firstPage = false;
            pageNo++;
            drawPageFrame(pageNo);
            y = HEADER_H + TABLE_HEAD_H;
        }
        if (ri % 2 === 1) {
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(MARGIN, y, tableW, row.height);
        }
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MARGIN, y + row.height);
        ctx.lineTo(MARGIN + tableW, y + row.height);
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.font = font(FONT_PX);
        ctx.textBaseline = "top";
        let x = MARGIN;
        row.cells.forEach((lines, ci) => {
            lines.forEach((line, li) => ctx.fillText(line, x + CELL_PAD, y + CELL_PAD + li * LINE_H));
            x += colW[ci];
        });
        y += row.height;
    });

    flushPage(firstPage);
    doc.save(fileName);
};
