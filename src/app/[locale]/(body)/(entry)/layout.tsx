"use client";

import PageSwitch from "@/components/PageSwitch";
import { Car, PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

/**
 * Entry section: one sidebar item ("Entry") with a switch between the
 * Malkhana entry form and the Seized vehicle form. The route group keeps the
 * existing URLs (/maalkhana-entry, /seized-vehical).
 */
const EntryLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const t = useTranslations("entrySwitch");

    const tabs = [
        { key: "m", label: t("malkhana"), href: "/maalkhana-entry", icon: <PackageOpen size={18} /> },
        { key: "v", label: t("vehicles"), href: "/seized-vehical", icon: <Car size={18} /> },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="glass-effect pb-4">
                <PageSwitch tabs={tabs} label={t("label")} />
            </div>
            {children}
        </div>
    );
};

export default EntryLayout;
