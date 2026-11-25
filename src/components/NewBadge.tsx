"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * "New" highlights for recently added features (category menu, licensed
 * weapon entry, QR barcode labels). They switch off automatically after this
 * date, so nothing has to be cleaned up later. Change it to extend/shorten.
 */
export const NEW_FEATURES_UNTIL = "2027-01-31";

export const isNewFeaturePeriod = () => new Date() <= new Date(`${NEW_FEATURES_UNTIL}T23:59:59`);

/** Small "NEW / नया" pill. Renders nothing once the highlight period is over. */
const NewBadge = ({ className = "" }: { className?: string }) => {
    const t = useTranslations("whatsNew");
    if (!isNewFeaturePeriod()) return null;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-blue shadow-[0_0_10px_rgba(251,191,36,0.55)] ${className}`}
        >
            <Sparkles size={10} className="animate-pulse" />
            {t("badge")}
        </span>
    );
};

export default NewBadge;
