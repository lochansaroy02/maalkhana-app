"use client";
import { Download, FileSpreadsheet, FileText, File as FileIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|avif|heic)$/i;

const fileNameOf = (url: string) => {
    try {
        const name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
        return name || "file";
    } catch {
        return "file";
    }
};

const extOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "");

const isImageKit = (url: string) => /(^|\.)imagekit\.io$/i.test((() => { try { return new URL(url).hostname; } catch { return ""; } })());

/** Small thumbnail: ImageKit resizes on the fly, other hosts get the original. */
const thumbUrl = (url: string) => {
    if (!isImageKit(url)) return url;
    const u = new URL(url);
    u.searchParams.set("tr", "w-96,h-96,c-at_max,q-70");
    return u.toString();
};

/** A link that makes the browser save the file instead of opening it. */
const attachmentUrl = (url: string) => {
    if (!isImageKit(url)) return url;
    const u = new URL(url);
    u.searchParams.set("ik-attachment", "true");
    return u.toString();
};

const saveBlob = (blob: Blob, name: string) => {
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
};

/**
 * Report cell for a photo / document URL: shows a preview (thumbnail for
 * images, a file badge for PDFs and Office files) and downloads the file on click.
 */
export default function MediaCell({ url, label }: { url: string; label?: string }) {
    const tc = useTranslations("ui.common");
    const [busy, setBusy] = useState(false);
    const [imgFailed, setImgFailed] = useState(false);

    const name = fileNameOf(url);
    const ext = extOf(name);
    const isImage = IMAGE_EXT.test(name) && !imgFailed;
    const downloadName = label ? `${label.replace(/[^\w-]+/g, "_")}.${ext || "bin"}` : name;

    const download = async (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation(); // the row click opens the entry
        if (busy) return;
        setBusy(true);
        try {
            const res = await fetch(url, { mode: "cors" });
            if (!res.ok) throw new Error(String(res.status));
            saveBlob(await res.blob(), downloadName);
        } catch {
            // CORS-blocked or offline: let the browser handle it.
            window.open(attachmentUrl(url), "_blank", "noopener,noreferrer");
        } finally {
            setBusy(false);
        }
    };

    const Badge = ext === "pdf" || ext === "doc" || ext === "docx" ? FileText : ext === "xls" || ext === "xlsx" || ext === "csv" ? FileSpreadsheet : FileIcon;

    return (
        <a
            href={url}
            onClick={download}
            title={tc("download", { name })}
            className="group relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/20 bg-white align-middle shadow-sm hover:ring-2 hover:ring-blue-500"
        >
            {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={thumbUrl(url)}
                    alt={label || name}
                    loading="lazy"
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-cover"
                />
            ) : (
                <span className="flex flex-col items-center gap-0.5 text-red-700">
                    <Badge className="h-6 w-6" />
                    <span className="text-[10px] font-semibold uppercase leading-none">{ext || "file"}</span>
                </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            </span>
            {busy && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </span>
            )}
        </a>
    );
}
