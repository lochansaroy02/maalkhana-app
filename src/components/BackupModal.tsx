"use client";

import { BackupResult, BackupSummary, useBackupStore } from "@/store/backupStore";
import { AlertCircle, CheckCircle2, DatabaseBackup, FileArchive, FileSpreadsheet, Loader2, Mail, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Format = "bak" | "csv";

const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/**
 * Backup dialog: shows where the backup goes (the logged-in account's own
 * email), what it contains, and lets the user pick .bak and/or .csv files.
 */
const BackupModal = ({ userId, role, onClose }: { userId: string; role: string; onClose: () => void }) => {
    const t = useTranslations("backup");
    const locale = useLocale();
    const nf = new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN");
    const { getSummary, sendBackup } = useBackupStore();

    const [summary, setSummary] = useState<BackupSummary | null>(null);
    const [summaryError, setSummaryError] = useState(false);
    const [formats, setFormats] = useState<Format[]>(["bak", "csv"]);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<BackupResult | null>(null);

    useEffect(() => {
        let cancelled = false;
        getSummary(userId, role).then((s) => {
            if (cancelled) return;
            if (s) setSummary(s);
            else setSummaryError(true);
        });
        return () => {
            cancelled = true;
        };
    }, [userId, role, getSummary]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && !sending && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, sending]);

    const toggle = (f: Format) =>
        setFormats((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

    const handleSend = async () => {
        if (sending || formats.length === 0) return;
        setSending(true);
        setResult(null);
        setResult(await sendBackup(userId, role, formats));
        setSending(false);
    };

    const succeeded = result?.success;
    const options: { key: Format; icon: React.ReactNode; title: string; text: string }[] = [
        { key: "bak", icon: <FileArchive size={20} />, title: t("bak.title"), text: t("bak.text") },
        { key: "csv", icon: <FileSpreadsheet size={20} />, title: t("csv.title"), text: t("csv.text") },
    ];

    const modal = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => !sending && onClose()}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={t("title")}
                className="w-full max-w-lg overflow-hidden rounded-xl border border-white/30 bg-blue-dark text-blue-100 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/30 bg-maroon px-5 py-3">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-cream">
                        <DatabaseBackup size={20} /> {t("title")}
                    </h2>
                    <button onClick={onClose} disabled={sending} aria-label={t("close")} className="rounded-lg bg-white/15 p-1.5 text-cream hover:bg-white/25 disabled:opacity-50">
                        <X size={16} />
                    </button>
                </div>

                {succeeded ? (
                    /* Success */
                    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
                        <CheckCircle2 size={48} className="text-green-400" />
                        <p className="text-lg font-semibold text-cream">{t("sentTitle")}</p>
                        <p className="text-sm">{t("sentTo", { email: result?.data?.email || summary?.email || "" })}</p>
                        {!!result?.data?.files?.length && (
                            <ul className="w-full space-y-1 rounded-lg border border-white/20 bg-white/5 p-3 text-left text-sm">
                                {result.data.files.map((f) => (
                                    <li key={f.name} className="flex justify-between gap-3">
                                        <span className="truncate">{f.name}</span>
                                        <span className="shrink-0 text-blue-100/60">{fmtSize(f.size)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="text-xs text-blue-100/60">{t("checkSpam")}</p>
                        <button onClick={onClose} className="mt-2 rounded-lg bg-maroon px-6 py-2 font-semibold text-cream ring-1 ring-white/30 hover:bg-lightMaroon">
                            {t("done")}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 px-5 py-5">
                        {/* Recipient */}
                        <div className="rounded-lg border border-white/20 bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-blue-100/60">{t("sendTo")}</p>
                            <p className="mt-1 flex items-center gap-2 font-semibold text-cream">
                                <Mail size={16} />
                                {summary ? summary.email : summaryError ? "—" : <span className="h-4 w-48 animate-pulse rounded bg-white/15" />}
                            </p>
                            <p className="mt-1 text-xs text-blue-100/60">{t("sendToHint")}</p>
                        </div>

                        {/* Contents */}
                        <div className="grid grid-cols-2 gap-3 text-center">
                            {[
                                { label: t("entries"), value: summary?.entries },
                                { label: t("vehicles"), value: summary?.vehicles },
                            ].map((s) => (
                                <div key={s.label} className="rounded-lg border border-white/20 bg-white/5 py-3">
                                    <p className="text-2xl font-bold text-cream">
                                        {s.value === undefined ? (summaryError ? "—" : <Loader2 size={20} className="mx-auto animate-spin" />) : nf.format(s.value)}
                                    </p>
                                    <p className="text-xs text-blue-100/70">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        {summary?.label && <p className="-mt-2 text-center text-xs text-blue-100/60">{t("scope", { name: summary.label })}</p>}

                        {/* File types */}
                        <fieldset className="space-y-2">
                            <legend className="mb-2 text-sm font-semibold">{t("filesLegend")}</legend>
                            {options.map((o) => {
                                const checked = formats.includes(o.key);
                                return (
                                    <label
                                        key={o.key}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${checked ? "border-amber-300/60 bg-white/10" : "border-white/20 bg-white/5 hover:bg-white/10"}`}
                                    >
                                        <input type="checkbox" checked={checked} onChange={() => toggle(o.key)} disabled={sending} className="mt-1 h-4 w-4 accent-[#741e1c]" />
                                        <span className="text-amber-200">{o.icon}</span>
                                        <span>
                                            <span className="block font-semibold text-cream">{o.title}</span>
                                            <span className="block text-xs text-blue-100/70">{o.text}</span>
                                        </span>
                                    </label>
                                );
                            })}
                            {formats.length === 0 && <p className="text-xs text-amber-300">{t("pickOne")}</p>}
                        </fieldset>

                        {/* Error */}
                        {(result && !result.success) || summaryError ? (
                            <p className="flex items-start gap-2 rounded-lg border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-200">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                {result && !result.success ? `${t("failed")}${result.message ? ` — ${result.message}` : ""}` : t("summaryFailed")}
                            </p>
                        ) : null}

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-1">
                            <button onClick={onClose} disabled={sending} className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-50">
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending || formats.length === 0 || !summary}
                                className="flex items-center gap-2 rounded-lg bg-maroon px-4 py-2 text-sm font-semibold text-cream ring-1 ring-white/30 hover:bg-lightMaroon disabled:opacity-50"
                            >
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                {sending ? t("sending") : result && !result.success ? t("retry") : t("send")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return typeof document === "undefined" ? null : createPortal(modal, document.body);
};

export default BackupModal;
