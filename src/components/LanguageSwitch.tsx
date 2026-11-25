"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

const LOCALES = [
    { code: "en", short: "EN" },
    { code: "hi", short: "हि" },
] as const;

/**
 * EN | हि toggle switch. Keeps the current page and query string when
 * switching (e.g. /en/report/entry-report?reportType=release → /hi/…).
 */
const LanguageSwitch = () => {
    const t = useTranslations("Header");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname(); // path without the locale prefix
    const [isPending, startTransition] = useTransition();
    const isHindi = locale === "hi";

    const switchTo = (code: string) => {
        if (code === locale || isPending) return;
        const query = typeof window !== "undefined" ? window.location.search : "";
        startTransition(() => {
            router.replace(`${pathname}${query}`, { locale: code });
        });
    };

    return (
        <div
            role="radiogroup"
            aria-label={t("language")}
            title={t("language")}
            className={`relative grid h-9 w-[92px] shrink-0 grid-cols-2 items-center rounded-full border border-white/30 bg-white/10 p-1 text-sm font-semibold ${isPending ? "opacity-70" : ""}`}
        >
            {/* Sliding thumb */}
            <span
                aria-hidden
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-maroon shadow-md ring-1 ring-white/30 transition-transform duration-300 ease-out ${isHindi ? "translate-x-full" : "translate-x-0"}`}
            />
            {LOCALES.map(({ code, short }) => {
                const active = code === locale;
                return (
                    <button
                        key={code}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={code === "en" ? "English" : "हिंदी"}
                        onClick={() => switchTo(code)}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                                e.preventDefault();
                                switchTo(code === "en" ? "hi" : "en");
                            }
                        }}
                        className={`relative z-10 h-full rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${active ? "text-cream" : "text-blue-100/70 hover:text-blue-100"}`}
                    >
                        {short}
                    </button>
                );
            })}
        </div>
    );
};

export default LanguageSwitch;
