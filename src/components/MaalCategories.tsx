"use client";

import { exportItemsToExcel, exportItemsToPDF, ExportColumn } from "@/utils/exportCategoryItems";
import { ENTRY_TYPE_CATEGORIES, ITEM_STATUS_KEYS, isPlainCategorySpelling, MaalCategoryKey } from "@/utils/maalCategories";
import axios from "axios";
import { FileSpreadsheet, FileText, Layers, Loader2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import NewBadge, { isNewFeaturePeriod } from "./NewBadge";

interface CategoryItem {
    id: string;
    firNo: string;
    srNo: string;
    malkhanaNo: string;
    category: MaalCategoryKey;
    entryType: string;
    description: string;
    statusKey: string;
    date: string;
    policeStation: string;
}

interface Filters {
    search: string;
    subType: string;
    status: string;
    from: string;
    to: string;
}

const EMPTY_FILTERS: Filters = { search: "", subType: "", status: "", from: "", to: "" };
const PAGE_SIZE = 50;

// App theme: dark navy page, glass panels (white/10 + white/30 border),
// text-blue-100, maroon headers, #102647 blue.
const fieldClass =
    "h-10 rounded-lg border border-white/30 bg-white/10 px-3 text-sm text-blue-100 placeholder:text-blue-100/50 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-300/60 [color-scheme:dark] [&>option]:bg-blue [&>option]:text-blue-100";

const buildParams = (scope: Record<string, string | undefined>, category: string, filters: Filters, extra: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(scope).forEach(([k, v]) => v && params.set(k, v));
    params.set("category", category);
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v.trim()));
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    return params.toString();
};

/** Translated label for a category key (reuses the entry-type dropdown labels). */
const useCategoryLabel = () => {
    const tType = useTranslations("entry.malkhanaEntryForm.entryType.options");
    return (key: MaalCategoryKey) => tType(key);
};

// ----------------------------------------------------------------- modal

const CategoryModal = ({
    initialCategory,
    scope,
    counts,
    onClose,
}: {
    initialCategory: MaalCategoryKey;
    scope: Record<string, string | undefined>;
    counts: Record<string, number>;
    onClose: () => void;
}) => {
    const t = useTranslations("categories");
    const locale = useLocale();
    const categoryLabel = useCategoryLabel();
    const nf = new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN");

    const [category, setCategory] = useState<MaalCategoryKey>(initialCategory);
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<CategoryItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [subTypes, setSubTypes] = useState<{ value: string; count: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState<"" | "excel" | "pdf">("");

    const activeFilters = { ...filters, search: debouncedSearch };
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const title = categoryLabel(category);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(filters.search), 300);
        return () => clearTimeout(id);
    }, [filters.search]);

    const queryKey = JSON.stringify([category, debouncedSearch, filters.subType, filters.status, filters.from, filters.to]);
    useEffect(() => setPage(1), [queryKey]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        axios
            .get(`/api/report/categories?${buildParams(scope, category, activeFilters, { page: String(page), pageSize: String(PAGE_SIZE) })}`)
            .then((res) => {
                if (cancelled) return;
                setItems(res.data.items || []);
                setTotalItems(res.data.totalItems || 0);
                setSubTypes(res.data.subTypes || []);
            })
            .catch(() => !cancelled && toast.error(t("loadError")))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey, page, JSON.stringify(scope)]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const statusLabel = (key: string) => (ITEM_STATUS_KEYS as readonly string[]).includes(key) ? t(`statuses.${key}`) : key;
    // For "other", show the custom text the user typed when adding the entry.
    const rowCategory = (item: CategoryItem) =>
        !isPlainCategorySpelling(item.entryType)
            ? `${categoryLabel(item.category)} · ${item.entryType}`
            : categoryLabel(item.category);

    const exportColumns: ExportColumn[] = [
        { header: t("columns.index"), key: "#", width: 4 },
        { header: t("columns.firNo"), key: "firNo", width: 9 },
        { header: t("columns.malkhanaNo"), key: "malkhanaNo", width: 10 },
        { header: t("columns.category"), key: "categoryLabel", width: 12 },
        { header: t("columns.description"), key: "description", width: 40 },
        { header: t("columns.policeStation"), key: "policeStation", width: 10 },
        { header: t("columns.status"), key: "statusLabel", width: 11 },
        { header: t("columns.date"), key: "date", width: 9 },
    ];

    const handleExport = async (kind: "excel" | "pdf") => {
        if (exporting) return;
        setExporting(kind);
        try {
            const res = await axios.get(`/api/report/categories?${buildParams(scope, category, activeFilters, { all: "1" })}`);
            const rows = (res.data.items as CategoryItem[]).map((i) => ({
                ...i,
                categoryLabel: rowCategory(i),
                statusLabel: statusLabel(i.statusKey),
            }));
            if (rows.length === 0) {
                toast.error(t("exportEmpty"));
                return;
            }
            const stamp = new Date().toISOString().slice(0, 10);
            const base = `${category}_${stamp}`;
            if (kind === "excel") {
                exportItemsToExcel(rows, exportColumns, title, `${base}.xlsx`);
            } else {
                const parts = [t("total", { count: nf.format(rows.length) })];
                if (filters.subType) parts.push(filters.subType);
                if (filters.status) parts.push(statusLabel(filters.status));
                if (filters.from || filters.to) parts.push(`${filters.from || "…"} – ${filters.to || "…"}`);
                if (debouncedSearch) parts.push(`${t("searchLabel")}: "${debouncedSearch}"`);
                await exportItemsToPDF(rows, exportColumns, title, parts.join(" · "), `${base}.pdf`);
            }
            toast.success(t("exportDone", { count: nf.format(rows.length) }));
        } catch (err) {
            console.error("Category export failed:", err);
            toast.error(t("exportFailed"));
        } finally {
            setExporting("");
        }
    };

    const setFilter = (k: keyof Filters, v: string) => setFilters((f) => ({ ...f, [k]: v }));
    const startIdx = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const endIdx = Math.min(page * PAGE_SIZE, totalItems);
    const pagerBtn = "rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 font-medium text-blue-100 hover:bg-white/20 disabled:opacity-40";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-6" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/30 bg-blue-dark shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/30 bg-maroon px-5 py-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-cream">{title}</h2>
                        <span className="rounded-full bg-white/15 px-3 py-0.5 text-sm font-semibold text-cream">
                            {t("total", { count: nf.format(totalItems) })}
                        </span>
                        {loading && <Loader2 size={18} className="animate-spin text-cream/70" />}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleExport("excel")}
                            disabled={!!exporting}
                            className="flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                        >
                            {exporting === "excel" ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} {t("excel")}
                        </button>
                        <button
                            onClick={() => handleExport("pdf")}
                            disabled={!!exporting}
                            className="flex items-center gap-1.5 rounded-lg bg-blue px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-blue/80 disabled:opacity-60"
                        >
                            {exporting === "pdf" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} {t("pdf")}
                        </button>
                        <button onClick={onClose} aria-label={t("close")} className="rounded-lg bg-white/15 p-2 text-cream hover:bg-white/25">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className={`grid grid-cols-2 gap-2 border-b border-white/20 bg-white/5 px-4 py-3 ${subTypes.length > 0 ? "lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]" : "lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]"}`}>
                    <input
                        value={filters.search}
                        onChange={(e) => setFilter("search", e.target.value)}
                        placeholder={t("search")}
                        aria-label={t("searchLabel")}
                        className={`col-span-2 lg:col-span-1 ${fieldClass}`}
                    />
                    <select
                        aria-label={t("category")}
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value as MaalCategoryKey);
                            setFilter("subType", "");
                        }}
                        className={fieldClass}
                    >
                        {ENTRY_TYPE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{categoryLabel(c)} ({nf.format(counts[c] || 0)})</option>
                        ))}
                    </select>
                    {subTypes.length > 0 && (
                        <select aria-label={t("subType")} value={filters.subType} onChange={(e) => setFilter("subType", e.target.value)} className={fieldClass}>
                            <option value="">{t("subType")}</option>
                            {subTypes.map((s) => <option key={s.value} value={s.value}>{s.value} ({nf.format(s.count)})</option>)}
                        </select>
                    )}
                    <select aria-label={t("status")} value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className={fieldClass}>
                        <option value="">{t("status")}</option>
                        {ITEM_STATUS_KEYS.map((s) => <option key={s} value={s}>{t(`statuses.${s}`)}</option>)}
                    </select>
                    <input type="date" aria-label={t("from")} title={t("from")} value={filters.from} onChange={(e) => setFilter("from", e.target.value)} className={fieldClass} />
                    <input type="date" aria-label={t("to")} title={t("to")} value={filters.to} onChange={(e) => setFilter("to", e.target.value)} className={fieldClass} />
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-[820px] border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-blue text-left text-xs font-semibold tracking-wide text-blue-100">
                            <tr>
                                <th className="px-3 py-3">{t("columns.index")}</th>
                                <th className="px-3 py-3">{t("columns.firNo")}</th>
                                <th className="px-3 py-3">{t("columns.malkhanaNo")}</th>
                                <th className="px-3 py-3">{t("columns.category")}</th>
                                <th className="px-3 py-3">{t("columns.description")}</th>
                                <th className="px-3 py-3">{t("columns.status")}</th>
                                <th className="whitespace-nowrap px-3 py-3">{t("columns.date")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.id} className="border-b border-white/10 text-blue-100 even:bg-white/5 hover:bg-white/10">
                                    <td className="px-3 py-2.5 text-blue-100/60">{startIdx + idx}</td>
                                    <td className="whitespace-nowrap px-3 py-2.5">{item.firNo || "—"}</td>
                                    <td className="whitespace-nowrap px-3 py-2.5">{item.malkhanaNo || "—"}</td>
                                    <td className="whitespace-nowrap px-3 py-2.5">{rowCategory(item)}</td>
                                    <td className="max-w-[420px] px-3 py-2.5">
                                        <div className="line-clamp-2" title={item.description}>{item.description || "—"}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2.5">{statusLabel(item.statusKey)}</td>
                                    <td className="whitespace-nowrap px-3 py-2.5">{item.date || "—"}</td>
                                </tr>
                            ))}
                            {!loading && items.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-3 py-12 text-center text-blue-100/60">{t("noRecords")}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-white/20 bg-white/5 px-4 py-3 text-sm text-blue-100">
                    <span className="font-medium">
                        {nf.format(startIdx)}–{nf.format(endIdx)} / {nf.format(totalItems)}
                    </span>
                    <div className="flex items-center gap-3">
                        <button disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className={pagerBtn}>
                            {t("prev")}
                        </button>
                        <span className="font-semibold">{nf.format(page)} / {nf.format(totalPages)}</span>
                        <button disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={pagerBtn}>
                            {t("next")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------- chips

/**
 * Category chip bar, one chip per entry type. Pass userId for a
 * police-station view, or nothing for the district/admin view.
 */
const MaalCategories = ({ userId }: { userId?: string }) => {
    const t = useTranslations("categories");
    const locale = useLocale();
    const categoryLabel = useCategoryLabel();
    const nf = new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN");
    const [counts, setCounts] = useState<Record<string, number> | null>(null);
    const [open, setOpen] = useState<MaalCategoryKey | null>(null);
    const scope = { userId };

    useEffect(() => {
        // Ignore stale responses when userId changes (e.g. after auth rehydrates).
        let cancelled = false;
        setCounts(null);
        const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
        axios
            .get(`/api/report/categories${qs}`)
            .then((res) => !cancelled && setCounts(res.data.counts || {}))
            .catch((err) => {
                console.error("Failed to load categories", err);
                if (!cancelled) setCounts({});
            });
        return () => {
            cancelled = true;
        };
    }, [userId]);

    return (
        <div id="maal-categories" className={`glass-effect mb-4 flex scroll-mt-4 flex-wrap items-center gap-2 px-4 py-3 transition-shadow ${isNewFeaturePeriod() ? "ring-1 ring-amber-300/60 shadow-[0_0_18px_rgba(251,191,36,0.25)]" : ""}`}>
            <span className="mr-1 flex items-center gap-2 text-sm font-semibold text-blue-100">
                <span className="h-5 border-l-4 border-maroon" />
                <Layers size={16} /> {t("title")}:
                <NewBadge />
            </span>
            {counts === null
                ? ENTRY_TYPE_CATEGORIES.map((c) => <span key={c} className="h-8 w-24 animate-pulse rounded-lg bg-white/10" />)
                : ENTRY_TYPE_CATEGORIES.map((c) => (
                    <button
                        key={c}
                        onClick={() => setOpen(c)}
                        className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-blue-100 transition hover:bg-white/20 active:scale-95"
                    >
                        {categoryLabel(c)}
                        <span className="rounded-md bg-maroon px-1.5 py-0.5 text-xs font-bold text-cream">{nf.format(counts[c] || 0)}</span>
                    </button>
                ))}
            {/* Portal: ancestors use backdrop-filter, which would otherwise trap position:fixed */}
            {open && typeof document !== "undefined" && createPortal(
                <CategoryModal initialCategory={open} scope={scope} counts={counts || {}} onClose={() => setOpen(null)} />,
                document.body
            )}
        </div>
    );
};

export default MaalCategories;
