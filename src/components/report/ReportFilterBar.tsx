"use client";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarRange, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useRef, useState } from "react";

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export interface FilterDef {
    key: string;
    label: string;
    icon?: ReactNode;
    options: FilterOption[];
    selected: string[];
    onChange: (values: string[]) => void;
}

const control =
    "inline-flex h-10 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 text-sm text-blue-100 " +
    "transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300";

/** Multi-select dropdown in the app theme, with a selected-count badge. */
const FilterSelect = ({ def }: { def: FilterDef }) => {
    const t = useTranslations("reports.filters");
    const n = def.selected.length;
    const toggle = (v: string, checked: boolean) =>
        def.onChange(checked ? [...def.selected, v] : def.selected.filter((x) => x !== v));

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={`${control} ${n ? "border-amber-300/60 bg-white/15" : ""}`}>
                    {def.icon}
                    <span className="max-w-[140px] truncate">{def.label}</span>
                    {n > 0 && <span className="rounded-md bg-maroon px-1.5 text-xs font-bold text-cream">{n}</span>}
                    <ChevronDown size={14} className="text-blue-100/70" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-80 w-60 overflow-y-auto border-white/20 bg-blue-dark text-blue-100">
                <DropdownMenuLabel className="flex items-center justify-between text-xs font-semibold text-blue-100/70">
                    {def.label}
                    {n > 0 && (
                        <button onClick={() => def.onChange([])} className="text-amber-200 hover:underline">
                            {t("clear")}
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/15" />
                {def.options.length === 0 && <p className="px-2 py-1.5 text-xs text-blue-100/60">{t("noOptions")}</p>}
                {def.options.map((o) => (
                    <DropdownMenuCheckboxItem
                        key={o.value}
                        checked={def.selected.includes(o.value)}
                        onCheckedChange={(c) => toggle(o.value, Boolean(c))}
                        onSelect={(e) => e.preventDefault() /* keep the menu open for multi-select */}
                        className="cursor-pointer text-blue-100 focus:bg-white/10 focus:text-blue-100"
                    >
                        <span className="flex-1 truncate">{o.label}</span>
                        {o.count !== undefined && <span className="ml-2 text-xs text-blue-100/50">{o.count}</span>}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export interface YearRange {
    from: string;
    to: string;
    options: string[];
    onChange: (next: { from: string; to: string }) => void;
}

/**
 * Report filter bar: debounced search (press "/" to focus), multi-select
 * filters, optional year range, active-filter chips and a result count.
 */
const ReportFilterBar = ({
    search,
    onSearch,
    placeholder,
    filters,
    year,
    shown,
    total,
}: {
    search: string;
    onSearch: (q: string) => void;
    placeholder: string;
    filters: FilterDef[];
    year?: YearRange;
    shown: number;
    total: number;
}) => {
    const t = useTranslations("reports");
    const [text, setText] = useState(search);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce typing so large reports stay responsive.
    useEffect(() => {
        const id = setTimeout(() => onSearch(text), 250);
        return () => clearTimeout(id);
    }, [text, onSearch]);
    useEffect(() => setText(search), [search]);

    // "/" focuses the search box (unless the user is already typing somewhere).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement;
            if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) && !el.isContentEditable) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const chips = filters.flatMap((f) =>
        f.selected.map((v) => ({
            id: `${f.key}:${v}`,
            text: `${f.label}: ${f.options.find((o) => o.value === v)?.label ?? v}`,
            remove: () => f.onChange(f.selected.filter((x) => x !== v)),
        }))
    );
    if (year && (year.from || year.to)) {
        chips.push({
            id: "year",
            text: `${t("filters.year")}: ${year.from || "…"} – ${year.to || "…"}`,
            remove: () => year.onChange({ from: "", to: "" }),
        });
    }
    if (search) chips.unshift({ id: "search", text: `“${search}”`, remove: () => { setText(""); onSearch(""); } });

    const clearAll = () => {
        setText("");
        onSearch("");
        filters.forEach((f) => f.selected.length && f.onChange([]));
        year?.onChange({ from: "", to: "" });
    };

    const yearSelect = "h-10 rounded-lg border border-white/30 bg-white/10 px-2 text-sm text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 [&>option]:bg-blue";

    return (
        <div className="glass-effect mx-2 mt-2 space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <label className="relative flex min-w-[240px] flex-1 items-center">
                    <Search size={16} className="pointer-events-none absolute left-3 text-blue-100/60" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                setText("");
                                onSearch("");
                            }
                        }}
                        placeholder={placeholder}
                        aria-label={placeholder}
                        className="h-10 w-full rounded-lg border border-white/30 bg-white/10 pl-9 pr-16 text-sm text-blue-100 placeholder:text-blue-100/50 focus:outline-none focus:ring-2 focus:ring-blue-300 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {text ? (
                        <button
                            onClick={() => {
                                setText("");
                                onSearch("");
                                inputRef.current?.focus();
                            }}
                            aria-label={t("search.clear")}
                            className="absolute right-2 rounded-md p-1 text-blue-100/70 hover:bg-white/15 hover:text-blue-100"
                        >
                            <X size={16} />
                        </button>
                    ) : (
                        <kbd title={t("search.hint")} className="pointer-events-none absolute right-2 rounded border border-white/30 px-1.5 text-xs text-blue-100/60">/</kbd>
                    )}
                </label>

                <span className="ml-1 hidden items-center gap-1 text-sm font-semibold text-blue-100/80 md:inline-flex">
                    <SlidersHorizontal size={15} /> {t("filters.title")}
                </span>
                {filters.map((f) => <FilterSelect key={f.key} def={f} />)}

                {year && (
                    <div className="flex items-center gap-1.5" role="group" aria-label={t("filters.year")}>
                        <CalendarRange size={16} className="text-blue-100/70" />
                        <select aria-label={`${t("filters.year")} ${t("filters.yearFrom")}`} value={year.from} onChange={(e) => year.onChange({ from: e.target.value, to: year.to && e.target.value && year.to < e.target.value ? "" : year.to })} className={yearSelect}>
                            <option value="">{t("filters.yearFrom")}</option>
                            {year.options.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className="text-blue-100/60">–</span>
                        <select aria-label={`${t("filters.year")} ${t("filters.yearTo")}`} value={year.to} onChange={(e) => year.onChange({ from: year.from, to: e.target.value })} className={yearSelect}>
                            <option value="">{t("filters.yearTo")}</option>
                            {year.options.filter((y) => !year.from || y >= year.from).map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Active filters + result count */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-blue-100">
                    {t("results.showing", { shown: shown.toLocaleString("en-IN"), total: total.toLocaleString("en-IN") })}
                </span>
                {chips.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 py-0.5 pl-2.5 pr-1 text-xs text-blue-100">
                        <span className="max-w-[220px] truncate">{c.text}</span>
                        <button onClick={c.remove} aria-label={`${t("filters.clear")} ${c.text}`} className="rounded-full p-0.5 hover:bg-white/20">
                            <X size={12} />
                        </button>
                    </span>
                ))}
                {chips.length > 0 && (
                    <button onClick={clearAll} className="text-xs font-semibold text-amber-200 hover:underline">
                        {t("filters.clearAll")}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReportFilterBar;
