// Canvas helpers for producing PDFs that contain Hindi (Devanagari) text.
// jsPDF cannot shape Devanagari conjuncts/matras, so text is drawn on a
// <canvas> (which uses the browser's text shaper) and the canvas is embedded
// in the PDF as an image.

import { isLikelyKurtidev, kurtidevToUnicode } from "./font";

export const HINDI_FONT_STACK = `"Noto Sans Devanagari", "Nirmala UI", "Mangal", "Arial Unicode MS", "Noto Sans", Arial, sans-serif`;

export const font = (px: number, weight: "normal" | "bold" | "600" = "normal") =>
    `${weight} ${px}px ${HINDI_FONT_STACK}`;

/** Converts legacy KrutiDev text to Unicode so it prints correctly. */
export const toPrintable = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const s = String(value).replace(/\s+/g, " ").trim();
    return isLikelyKurtidev(s) ? kurtidevToUnicode(s) : s;
};

export const ensureFontsReady = async () => {
    if (typeof document !== "undefined" && document.fonts?.ready) {
        try {
            await document.fonts.ready;
        } catch {
            /* ignore */
        }
    }
};

/**
 * Splits text into lines that fit maxWidth. Lines beyond maxLines are dropped
 * and the last kept line gets an ellipsis.
 */
export const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines = Infinity
): string[] => {
    const words = text.split(" ").filter(Boolean);
    const lines: string[] = [];
    let line = "";

    const pushLongWord = (word: string) => {
        // A single word wider than the column: break it by characters.
        let chunk = "";
        for (const ch of Array.from(word)) {
            if (ctx.measureText(chunk + ch).width > maxWidth && chunk) {
                lines.push(chunk);
                chunk = ch;
            } else {
                chunk += ch;
            }
        }
        return chunk;
    };

    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth) {
            line = candidate;
        } else {
            if (line) lines.push(line);
            line = ctx.measureText(word).width > maxWidth ? pushLongWord(word) : word;
        }
    }
    if (line) lines.push(line);

    if (lines.length > maxLines) {
        const kept = lines.slice(0, maxLines);
        let last = kept[maxLines - 1];
        while (last && ctx.measureText(`${last}…`).width > maxWidth) {
            last = Array.from(last).slice(0, -1).join("");
        }
        kept[maxLines - 1] = `${last}…`;
        return kept;
    }
    return lines;
};

/** Draws a single line, truncating with an ellipsis if it does not fit. */
export const fitText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t && ctx.measureText(`${t}…`).width > maxWidth) t = Array.from(t).slice(0, -1).join("");
    return `${t}…`;
};
