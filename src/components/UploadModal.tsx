"use client";
import { useAuthStore } from "@/store/authStore";
import { useDistrictStore } from "@/store/districtStore";
import { downloadMalkhanaTemplate, ImportOwner, prepareMalkhanaImport, PreparedImport } from "@/utils/malkhanaImport";
import { useFieldLabel } from "@/utils/useFieldLabel";
import axios from "axios";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    /** kept for older callers; the import always creates Malkhana entries */
    schemaType?: string;
    addEntry?: unknown;
}

const BATCH_SIZE = 300;
const PREVIEW_KEYS = ["srNo", "firNo", "gdNo", "gdDate", "Year", "underSection", "description", "entryType", "category", "caseProperty"];

/**
 * Excel import for Malkhana entries using the universal format
 * (download the empty format → fill → upload → check → import).
 */
const UploadModal = ({ isOpen, onClose, onSuccess }: UploadModalProps) => {
    const t = useTranslations("ui.importModal");
    const fl = useFieldLabel();
    const { user } = useAuthStore();
    const { userId: selectedStationId, getAllUsers } = useDistrictStore();

    const [fileName, setFileName] = useState("");
    const [prepared, setPrepared] = useState<PreparedImport | null>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState<"" | "reading" | "saving">("");
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stop the long report behind the window from scrolling while it is open.
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    if (!isOpen || typeof document === "undefined") return null;

    /** Whose entries these become: the station login, or the station picked in the header. */
    const resolveOwner = async (): Promise<ImportOwner | null> => {
        if (!user) return null;
        if (user.role === "policeStation") {
            return { userId: user.id, districtId: user.districtId, policeStation: user.policeStation };
        }
        if (!selectedStationId) return null;
        const districtId = user.role === "district" ? user.id : user.districtId;
        const stations: { id: string; policeStation?: string; name?: string }[] = (await getAllUsers(districtId)) || [];
        const station = stations.find((s) => s.id === selectedStationId);
        return { userId: selectedStationId, districtId, policeStation: station?.policeStation || station?.name };
    };

    const reset = () => {
        setPrepared(null);
        setFileName("");
        setError("");
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");
        setPrepared(null);
        setFileName(file.name);
        setBusy("reading");
        try {
            const owner = await resolveOwner();
            if (!owner) {
                setError(t("chooseStation"));
                return;
            }
            const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
            const result = prepareMalkhanaImport(wb, owner);
            if (result.matched.length === 0) {
                setError(t("noColumns"));
                return;
            }
            if (result.rows.length === 0) {
                setError(t("emptyFile"));
                return;
            }
            setPrepared(result);
        } catch (err) {
            console.error("Excel read failed:", err);
            setError(t("processFailed"));
        } finally {
            setBusy("");
        }
    };

    const handleImport = async () => {
        if (!prepared) return;
        setBusy("saving");
        setError("");
        let saved = 0;
        try {
            for (let i = 0; i < prepared.rows.length; i += BATCH_SIZE) {
                const batch = prepared.rows.slice(i, i + BATCH_SIZE);
                const res = await axios.post("/api/entry", batch);
                saved += res.data?.count ?? batch.length;
                setProgress(Math.min(prepared.rows.length, i + batch.length));
            }
            onSuccess(t("saved", { count: saved }));
            reset();
            onClose();
        } catch (err) {
            console.error("Import failed:", err);
            setError(saved > 0 ? t("partial", { saved, total: prepared.rows.length }) : t("submitFailed"));
        } finally {
            setBusy("");
        }
    };

    const close = () => {
        if (busy === "saving") return;
        reset();
        onClose();
    };

    // Portal to <body>: the report sits inside glass panels (backdrop-filter),
    // which would otherwise make this "fixed" window scroll away with the table.
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3" onClick={close}>
            <div
                role="dialog"
                aria-modal="true"
                className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/30 bg-blue shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between bg-maroon px-5 py-3">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-cream">
                        <FileSpreadsheet size={20} /> {t("heading")}
                    </h2>
                    <button onClick={close} aria-label="close" className="rounded-full bg-white/15 p-1.5 text-cream hover:bg-white/25">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5 text-blue-100">
                    {/* Step 1 */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/20 bg-white/5 p-4">
                        <div>
                            <p className="font-semibold">{t("step1")}</p>
                            <p className="text-sm text-blue-100/70">{t("step1Hint")}</p>
                        </div>
                        <Button onClick={downloadMalkhanaTemplate} className="bg-green-700 text-white hover:bg-green-600">
                            <Download size={16} /> {t("downloadFormat")}
                        </Button>
                    </div>

                    {/* Step 2 */}
                    <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                        <p className="font-semibold">{t("step2")}</p>
                        <p className="mb-3 text-sm text-blue-100/70">{t("step2Hint")}</p>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/40 px-4 py-3 hover:bg-white/10">
                            {busy === "reading" ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            <span className="truncate">{fileName || t("chooseFile")}</span>
                            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" disabled={!!busy} />
                        </label>
                    </div>

                    {error && (
                        <p className="flex items-start gap-2 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-100">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
                        </p>
                    )}

                    {/* Step 3: check */}
                    {prepared && (
                        <div className="space-y-3 rounded-lg border border-white/20 bg-white/5 p-4">
                            <p className="flex items-center gap-2 font-semibold">
                                <CheckCircle2 size={18} className="text-green-400" />
                                {t("ready", { count: prepared.rows.length })}
                            </p>
                            <p className="text-sm text-blue-100/80">
                                {t("matchedCols", { count: prepared.matched.length })}
                                {prepared.skippedEmpty > 0 && ` · ${t("skippedEmpty", { count: prepared.skippedEmpty })}`}
                            </p>
                            {prepared.unknown.length > 0 && (
                                <p className="text-sm text-amber-200">{t("unknownCols")}: {prepared.unknown.join(", ")}</p>
                            )}
                            {prepared.warnings.length > 0 && (
                                <details className="text-sm text-amber-200">
                                    <summary className="cursor-pointer">{t("warnings", { count: prepared.warnings.length })}</summary>
                                    <ul className="mt-1 max-h-32 list-disc overflow-y-auto pl-5">
                                        {prepared.warnings.map((w) => <li key={w}>{w}</li>)}
                                    </ul>
                                </details>
                            )}

                            <p className="text-sm font-semibold">{t("preview")}</p>
                            <div className="max-h-64 overflow-auto rounded border border-white/20">
                                <table className="w-full min-w-[900px] text-xs">
                                    <thead className="sticky top-0 bg-blue-dark text-left">
                                        <tr>{PREVIEW_KEYS.map((k) => <th key={k} className="px-2 py-2 font-semibold">{fl(k)}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {prepared.rows.slice(0, 10).map((row, i) => (
                                            <tr key={i} className="border-t border-white/10 even:bg-white/5">
                                                {PREVIEW_KEYS.map((k) => (
                                                    <td key={k} className="max-w-[260px] truncate px-2 py-1.5" title={String(row[k] ?? "")}>
                                                        {String(row[k] ?? "")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {prepared.rows.length > 10 && <p className="text-xs text-blue-100/60">{t("more", { count: prepared.rows.length - 10 })}</p>}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/20 px-5 py-3">
                    {busy === "saving" && prepared && (
                        <span className="mr-auto text-sm text-blue-100/80">{t("saving", { done: progress, total: prepared.rows.length })}</span>
                    )}
                    <Button onClick={prepared ? reset : close} disabled={busy === "saving"} className="border border-white/40 bg-transparent text-blue-50 hover:bg-white/10">
                        {prepared ? t("clearFile") : t("cancel")}
                    </Button>
                    <Button onClick={handleImport} disabled={!prepared || !!busy} className="bg-green-600 text-white hover:bg-green-700">
                        {busy === "saving" ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {busy === "saving" ? t("importing") : t("confirm", { count: prepared?.rows.length ?? 0 })}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UploadModal;
