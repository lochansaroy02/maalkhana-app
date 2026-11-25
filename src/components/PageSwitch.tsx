"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { ReactNode } from "react";

export interface PageSwitchTab {
    key: string;
    label: string;
    href: string;
    icon?: ReactNode;
    count?: number;
}

/**
 * Two-way page switch (Malkhana / Seized vehicles) with a sliding maroon
 * highlight. Used by the Report and Entry sections. Keeps the current language.
 */
const PageSwitch = ({ tabs, label }: { tabs: PageSwitchTab[]; label: string }) => {
    const path = usePathname(); // without locale prefix
    const activeIndex = Math.max(0, tabs.findIndex((tab) => path.startsWith(tab.href)));
    const width = 100 / tabs.length;

    return (
        <div className="flex justify-center px-2 pt-4">
            <nav
                role="tablist"
                aria-label={label}
                className="relative grid w-full max-w-xl rounded-xl border border-white/30 bg-white/10 p-1 shadow-inner"
                style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
            >
                {/* Sliding active background */}
                <span
                    aria-hidden
                    className="absolute inset-y-1 left-1 rounded-lg bg-maroon shadow-md ring-1 ring-white/30 transition-transform duration-300 ease-out"
                    style={{ width: `calc(${width}% - 4px)`, transform: `translateX(${activeIndex * 100}%)` }}
                />
                {tabs.map((tab, i) => {
                    const active = i === activeIndex;
                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            role="tab"
                            aria-selected={active}
                            className={`relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:text-base ${active ? "text-cream" : "text-blue-100/70 hover:text-blue-100"}`}
                        >
                            {tab.icon}
                            <span className="truncate">{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`rounded-md px-1.5 text-xs font-bold ${active ? "bg-white/20 text-cream" : "bg-white/10 text-blue-100/80"}`}>
                                    {tab.count.toLocaleString("en-IN")}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default PageSwitch;
