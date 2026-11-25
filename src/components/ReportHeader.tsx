"use client";

import { usePathname } from "@/i18n/navigation";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { useSearchStore } from "@/store/searchStore";
import { useSeizedVehicleStore } from "@/store/siezed-vehical/seizeStore";
import { Car, PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import PageSwitch from "./PageSwitch";

const listLength = (v: unknown) =>
    Array.isArray(v) ? v.length : Array.isArray((v as any)?.data) ? (v as any).data.length : undefined;

/** Switch between the Malkhana and Seized-vehicle reports (keeps the current language). */
const ReportHeader = () => {
    const t = useTranslations("reports.tabs");
    const path = usePathname();
    const { setDbName } = useSearchStore();
    const { entries } = useMaalkhanaStore();
    const { vehicles } = useSeizedVehicleStore();

    const tabs = [
        { key: "m", label: t("malkhana"), href: "/report/entry-report", icon: <PackageOpen size={18} />, count: listLength(entries) },
        { key: "v", label: t("vehicles"), href: "/report/siezed-report", icon: <Car size={18} />, count: listLength(vehicles) },
    ];
    const activeKey = path.startsWith("/report/siezed-report") ? "v" : "m";

    // The global search API still reads dbName ("m" / "v").
    useEffect(() => {
        setDbName(activeKey);
    }, [activeKey, setDbName]);

    return <PageSwitch tabs={tabs} label={t("label")} />;
};

export default ReportHeader;
