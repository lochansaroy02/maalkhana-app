"use client";

import { Layers, QrCode, ShieldCheck, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isNewFeaturePeriod } from "./NewBadge";

const STORAGE_KEY = "whatsNew.dismissed.2026-11";

/**
 * Dismissible "What's new" banner for the dashboard. Hidden once dismissed
 * (remembered per browser) or after the highlight period ends.
 */
const WhatsNewBanner = ({ onShowCategories }: { onShowCategories?: () => void }) => {
    const t = useTranslations("whatsNew");
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!isNewFeaturePeriod()) return;
        let dismissed = false;
        try {
            dismissed = localStorage.getItem(STORAGE_KEY) === "1";
        } catch {
            /* storage unavailable: just show it */
        }
        setVisible(!dismissed);
    }, []);

    const dismiss = () => {
        setVisible(false);
        try {
            localStorage.setItem(STORAGE_KEY, "1");
        } catch {
            /* ignore */
        }
    };

    if (!visible) return null;

    const features = [
        { icon: <Layers size={18} />, title: t("categories.title"), text: t("categories.text"), action: t("categories.action"), onClick: onShowCategories },
        { icon: <ShieldCheck size={18} />, title: t("license.title"), text: t("license.text"), action: t("license.action"), onClick: () => router.push("/maalkhana-entry") },
        { icon: <QrCode size={18} />, title: t("barcode.title"), text: t("barcode.text"), action: t("barcode.action"), onClick: () => router.push("/report/entry-report") },
    ];

    return (
        <div className="relative mb-4 overflow-hidden rounded-xl border border-amber-300/50 bg-gradient-to-r from-maroon/90 via-maroon/70 to-blue/80 p-4 shadow-lg">
            <button onClick={dismiss} aria-label={t("dismiss")} className="absolute right-3 top-3 rounded-lg bg-white/10 p-1.5 text-cream hover:bg-white/20">
                <X size={16} />
            </button>
            <div className="mb-3 flex items-center gap-2 pr-10">
                <Sparkles size={20} className="text-amber-300" />
                <h2 className="text-lg font-bold text-cream">{t("title")}</h2>
                <span className="text-sm text-cream/70">{t("subtitle")}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
                {features.map((f) => (
                    <div key={f.title} className="flex flex-col gap-2 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur">
                        <div className="flex items-center gap-2 font-semibold text-cream">
                            <span className="rounded-md bg-amber-300/90 p-1.5 text-blue">{f.icon}</span>
                            {f.title}
                        </div>
                        <p className="flex-1 text-sm text-blue-100">{f.text}</p>
                        {f.onClick && (
                            <button onClick={f.onClick} className="self-start rounded-md border border-amber-300/60 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-300/15">
                                {f.action} →
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={dismiss} className="mt-3 text-xs font-medium text-cream/70 underline-offset-2 hover:text-cream hover:underline">
                {t("gotIt")}
            </button>
        </div>
    );
};

export default WhatsNewBanner;
