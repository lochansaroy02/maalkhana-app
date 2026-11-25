"use client";

import Report from '@/components/Report';
import ReportFilterBar, { FilterDef } from '@/components/report/ReportFilterBar';
import { useAuthStore } from '@/store/authStore';
import { useDistrictStore } from '@/store/districtStore';
import { useSearchStore } from '@/store/searchStore';
import { useSeizedVehicleStore } from '@/store/siezed-vehical/seizeStore';
import { useOpenStore } from '@/store/store';
import { matchesActivity, matchesSearch, matchesYearRange, rowYear } from '@/utils/reportFilters';
import { Activity, Car, FolderOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from 'react';

type SeizedVehicleEntry = Record<string, any>;

// Columns per activity. Vehicles are only released or auctioned (no movement / destroy).
const VEHICLE_ACTIVITIES = ["release", "nilami"] as const;

const HEADER_CONFIG: Record<string, string[]> = {
    release: ["FIR No", "Sr No", "Case Property", "Court Name", "Court No", "Receiver Name"],
    nilami: ["FIR No", "Sr No", "Status", "Case Property", "Description"],
    all: ["FIR No", "Sr No", "underSection", "description", "vehicleType", "Case Property", "GD No", "GD Date", "Year", "status", "Police Station", "colour", "registrationNo", "seizedBy", ""],
};

// Fields the search box looks in (every word typed must match one of them).
const SEARCHABLE_FIELDS = [
    "firNo", "srNo", "gdNo", "gdDate", "registrationNo", "engineNo", "vehicleType", "colour", "ownerName", "fathersName",
    "description", "caseProperty", "underSection", "policeStation", "seizedBy", "rtoName", "status", "mobile", "address",
];

const Page = () => {
    const t = useTranslations("reports");
    const { reportType, setReportType } = useOpenStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore();
    const { vehicles, fetchVehicles } = useSeizedVehicleStore();
    const { searchData } = useSearchStore();

    const [keyword, setKeyword] = useState("");
    const onSearch = useCallback((q: string) => setKeyword(q), []);
    const [activities, setActivities] = useState<string[]>([]);
    const [caseProperties, setCaseProperties] = useState<string[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
    const [years, setYears] = useState({ from: "", to: "" });

    const searchParams = useSearchParams();

    // ?reportType=movement etc. (dashboard cards link here)
    useEffect(() => {
        const urlReportType = searchParams.get('reportType');
        if (urlReportType) {
            setReportType(urlReportType);
            setActivities(urlReportType !== 'all' && (VEHICLE_ACTIVITIES as readonly string[]).includes(urlReportType) ? [urlReportType] : []);
        }
    }, [searchParams, setReportType]);

    useEffect(() => {
        if (user?.role === "policeStation" && user?.id) {
            fetchVehicles(user.id, user.role);
        } else if (user && userId) {
            fetchVehicles(userId, user.role);
        }
    }, [user?.id, fetchVehicles, userId, user?.role]);

    const source: SeizedVehicleEntry[] = useMemo(
        () => (Array.isArray(searchData) && searchData.length > 0 ? searchData : Array.isArray(vehicles) ? vehicles : []),
        [searchData, vehicles]
    );

    const reportContent = useMemo(() => {
        const lc = (v: unknown) => String(v ?? "").trim().toLowerCase();
        const data = source.filter((v) =>
            (activities.length === 0 || activities.some((a) => matchesActivity(v, a))) &&
            (caseProperties.length === 0 || caseProperties.includes(lc(v.caseProperty))) &&
            (vehicleTypes.length === 0 || vehicleTypes.includes(lc(v.vehicleType))) &&
            matchesYearRange(v, years.from, years.to, "gdDate") &&
            matchesSearch(v, keyword, SEARCHABLE_FIELDS)
        );
        const headerKey = activities.length === 1 ? activities[0] : reportType && reportType !== 'all' && activities.length === 0 ? reportType : 'all';
        return { data, headers: HEADER_CONFIG[headerKey] || HEADER_CONFIG.all };
    }, [source, activities, caseProperties, vehicleTypes, years, keyword, reportType]);

    // Filter options are built from the data itself, with counts.
    const distinct = (field: string) => {
        const map = new Map<string, { label: string; count: number }>();
        source.forEach((v) => {
            const label = String(v[field] ?? "").trim();
            if (!label) return;
            const key = label.toLowerCase();
            const cur = map.get(key);
            map.set(key, { label: cur?.label ?? label, count: (cur?.count ?? 0) + 1 });
        });
        return [...map.entries()].sort((a, b) => b[1].count - a[1].count).map(([value, o]) => ({ value, label: o.label, count: o.count }));
    };

    const filters: FilterDef[] = [
        {
            key: "activity", label: t("filters.type"), icon: <Activity size={15} />,
            options: VEHICLE_ACTIVITIES.map((k) => ({ value: k, label: t(`activities.${k}`), count: source.filter((v) => matchesActivity(v, k)).length })),
            selected: activities,
            onChange: (values) => {
                setActivities(values);
                setReportType(values.length === 1 ? values[0] : 'all');
            },
        },
        { key: "caseProperty", label: t("filters.caseProperty"), icon: <FolderOpen size={15} />, options: distinct("caseProperty"), selected: caseProperties, onChange: setCaseProperties },
        { key: "vehicleType", label: t("filters.vehicleType"), icon: <Car size={15} />, options: distinct("vehicleType"), selected: vehicleTypes, onChange: setVehicleTypes },
    ];

    const yearOptions = useMemo(() => {
        const ys = new Set<string>();
        source.forEach((v) => {
            const y = rowYear(v, "gdDate");
            if (y) ys.add(String(y));
        });
        return [...ys].sort((a, b) => Number(b) - Number(a));
    }, [source]);

    return (
        <>
            <ReportFilterBar
                search={keyword}
                onSearch={onSearch}
                placeholder={t("search.placeholderVehicles")}
                filters={filters}
                year={yearOptions.length ? { ...years, options: yearOptions, onChange: setYears } : undefined}
                shown={reportContent.data.length}
                total={source.length}
            />

            <Report
                data={reportContent.data}
                headers={reportContent.headers}
                emptyState={source.length > 0 ? { title: t("results.none"), hint: t("results.noneHint") } : undefined}
                heading="Seized Vehicles Report"
                detailsPathPrefix="/report/siezed-report"
            />
        </>
    );
};

export default Page;
