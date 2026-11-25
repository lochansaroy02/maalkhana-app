"use client";

import Report from "@/components/Report";
import ReportFilterBar, { FilterDef } from "@/components/report/ReportFilterBar";
import UploadModal from "@/components/UploadModal";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useDistrictStore } from "@/store/districtStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { useSearchStore } from "@/store/searchStore";
import { useOpenStore } from "@/store/store";
import { ENTRY_TYPE_CATEGORIES, categoryForEntryType } from "@/utils/maalCategories";
import { ACTIVITY_KEYS, STATUS_KEYS, matchesActivity, matchesEntryType, matchesSearch, matchesStatus, matchesYearRange } from "@/utils/reportFilters";
import { Activity, CircleDot, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- CONFIGURATION: ADD OR REMOVE HEADERS HERE ---
const HEADER_CONFIG: Record<string, string[]> = {
    movement: ["firNo", "srNo", "entryType", "status", "caseProperty", "underSection", "policeStation", "moveDate", "takenOutBy", "returnBackFrom", "returnDate", "movePurpose", "moveTrackingNo", "movementPhotoUrl", "movementDocumentUrl"],
    release: ["firNo", "srNo", "entryType", "status", "caseProperty", "underSection", "courtName", "courtNo", "boxNo", "releaseDate", "releaseItemName", "releaseOrderedBy", "receiverName", "fathersName", "address", "mobile", "releasePhotoUrl", "releaseDocumentUrl"],
    destroy: ["firNo", "srNo", "entryType", "status", "caseProperty", "description", "destroyOrderedBy", "destroyDate", "destroyPurpose", "destroyPhotoUrl", "destroyDocumentUrl"],
    return: ["firNo", "srNo", "entryType", "status", "caseProperty", "description", "returnDate", "receivedBy", "returnBackFrom"],
    nilami: ["firNo", "srNo", "entryType", "status", "caseProperty", "description", "nilamiDate", "nilamiItemName", "nilamiValue", "nilamiOrderedBy", "nilamiPhotoUrl", "nilamiDocumentUrl"],
    licensedWeapon: ["receiptNo", "licenseNo", "ownerName", "address", "mobile", "weaponName", "weaponNo", "depositDate", "depositReason", "rackNo", "policeStation", "status", "photoUrl"],
    all: ["firNo", "srNo", "entryType", "status", "underSection", "description", "category", "malkhanaRackNo", "caseProperty", "gdNo", "gdDate", "Year", "policeStation", "HM", "vadiName", "IOName", "accused", "boxNo", "courtNo", "courtName", "photoUrl", "documentUrl"]
};

// Release / movement / destroy / nilami details are hidden in the default view
// and added only when that status is picked in the Status filter.
const STATUS_COLUMNS: Record<string, string[]> = {
    movement: ["moveDate", "takenOutBy", "movePurpose", "moveTrackingNo", "returnBackFrom", "returnDate", "movementPhotoUrl", "movementDocumentUrl"],
    released: ["releaseDate", "releaseItemName", "releaseOrderedBy", "receiverName", "fathersName", "address", "mobile", "releasePhotoUrl", "releaseDocumentUrl"],
    destroy: ["destroyDate", "destroyOrderedBy", "destroyPurpose", "destroyPhotoUrl", "destroyDocumentUrl"],
    nilami: ["nilamiDate", "nilamiItemName", "nilamiValue", "nilamiOrderedBy", "nilamiPhotoUrl", "nilamiDocumentUrl"],
    auctioned: ["nilamiDate", "nilamiItemName", "nilamiValue", "nilamiOrderedBy", "nilamiPhotoUrl", "nilamiDocumentUrl"],
};

interface MaalkhanaEntry {
    [key: string]: any; // Allows dynamic access for search and headers
}

// Fields the search box looks in (every word typed must match one of them).
const SEARCHABLE_FIELDS = [
    "firNo", "srNo", "Year", "gdNo", "gdDate", "description", "caseProperty", "entryType", "status", "policeStation",
    "underSection", "vadiName", "accused", "IOName", "HM", "place", "boxNo", "courtName", "registrationNo",
    "receiptNo", "licenseNo", "ownerName", "weaponName", "weaponNo", "receiverName", "releaseItemName",
    "category", "malkhanaRackNo",
];

const Page = () => {
    const { reportType, setReportType } = useOpenStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore();
    const { entries, fetchMaalkhanaEntry, addMaalkhanaEntry } = useMaalkhanaStore();
    const { year, setYear, searchData } = useSearchStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedEntryTypes, setSelectedEntryTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);

    const searchParams = useSearchParams();
    const [keyword, setKeyword] = useState<string>('');
    const onSearch = useCallback((q: string) => setKeyword(q), []);
    const t = useTranslations("reports");
    const tType = useTranslations("entry.malkhanaEntryForm.entryType.options");

    useEffect(() => {
        const urlReportType = searchParams.get('reportType');
        if (urlReportType) {
            setReportType(urlReportType);
            if (urlReportType !== 'all') {
                setSelectedReportTypes([urlReportType]);
            }
        }
    }, [searchParams, setReportType]);

    useEffect(() => {
        if (user?.role === "policeStation" && user?.id) {
            fetchMaalkhanaEntry(user.id, user.role);
        } else if (user && userId) {
            fetchMaalkhanaEntry(userId, user.role);
        } else if (user?.role === "asp" && user?.id) {
            fetchMaalkhanaEntry(user.districtId, user.role);
        }
    }, [user?.id, fetchMaalkhanaEntry, userId, user?.role]);

    const reportContent = useMemo(() => {
        const sourceEntries = Array.isArray(searchData) && searchData.length > 0
            ? searchData
            : Array.isArray(entries)
                ? entries
                : Array.isArray((entries as any)?.data)
                    ? (entries as any).data
                    : [];

        const filteredData = sourceEntries.filter((entry: MaalkhanaEntry) =>
            (selectedReportTypes.length === 0 || selectedReportTypes.some(type => matchesActivity(entry, type))) &&
            matchesYearRange(entry, year?.from, year?.to) &&
            (selectedEntryTypes.length === 0 || selectedEntryTypes.some(type => matchesEntryType(entry, type))) &&
            (selectedStatuses.length === 0 || selectedStatuses.some(status => matchesStatus(entry, status))) &&
            matchesSearch(entry, keyword, SEARCHABLE_FIELDS)
        );

        // --- DETERMINE HEADERS ---
        // If one specific type is selected in dropdown, use those headers. 
        // If multiple or none, fallback to reportType from URL or "all".
        let activeHeaderKey = "all";
        if (selectedReportTypes.length === 1) {
            activeHeaderKey = selectedReportTypes[0];
        } else if (reportType && reportType !== 'all') {
            activeHeaderKey = reportType;
        }

        let headers = HEADER_CONFIG[activeHeaderKey] || HEADER_CONFIG.all;

        // Licensed weapons have their own fields (receipt, licence, owner, weapon…).
        // Show them whenever "Licensed Weapon" is the only entry type selected;
        // with an activity (release, movement…) add that activity's columns.
        if (selectedEntryTypes.length === 1 && selectedEntryTypes[0] === "licensedWeapon") {
            const licenceCore = ["receiptNo", "licenseNo", "ownerName", "weaponName", "weaponNo"];
            headers = activeHeaderKey === "all"
                ? HEADER_CONFIG.licensedWeapon
                : [...licenceCore, ...headers.filter(h => !["firNo", "srNo", "entryType", "caseProperty", "underSection"].includes(h))];
        }

        // Add the detail columns of each selected status (no duplicates).
        const statusColumns = selectedStatuses.flatMap(st => STATUS_COLUMNS[st] || []);
        if (statusColumns.length) headers = [...new Set([...headers, ...statusColumns])];

        return { data: filteredData, headers, total: sourceEntries.length, source: sourceEntries as MaalkhanaEntry[] };
    }, [entries, year, searchData, selectedEntryTypes, selectedStatuses, keyword, selectedReportTypes, reportType]);

    // Option counts come from all records, so users can see what each filter holds.
    const countBy = (pred: (e: MaalkhanaEntry) => boolean) => reportContent.source.filter(pred).length;
    const filters: FilterDef[] = [
        {
            key: "entryType", label: t("filters.entryType"), icon: <Layers size={15} />,
            options: ENTRY_TYPE_CATEGORIES.map(k => ({ value: k, label: tType(k), count: countBy(e => categoryForEntryType(e.entryType) === k) })),
            selected: selectedEntryTypes, onChange: setSelectedEntryTypes,
        },
        {
            key: "status", label: t("filters.status"), icon: <CircleDot size={15} />,
            options: STATUS_KEYS.map(k => ({ value: k, label: t(`statuses.${k}`), count: countBy(e => matchesStatus(e, k)) })),
            selected: selectedStatuses, onChange: setSelectedStatuses,
        },
        {
            key: "activity", label: t("filters.type"), icon: <Activity size={15} />,
            options: ACTIVITY_KEYS.map(k => ({ value: k, label: t(`activities.${k}`), count: countBy(e => matchesActivity(e, k)) })),
            selected: selectedReportTypes,
            onChange: (values) => {
                setSelectedReportTypes(values);
                setReportType(values.length === 1 ? values[0] : 'all');
            },
        },
    ];
    const yearOptions = useMemo(() => {
        const now = new Date().getFullYear();
        return Array.from({ length: now - 1980 + 1 }, (_, i) => String(now - i));
    }, []);

    const handleImportSuccess = (message: string) => {
        toast.success(message);
        if (user?.role === "policeStation" && user?.id) fetchMaalkhanaEntry(user.id, user.role);
        else if (user && userId) fetchMaalkhanaEntry(userId, user.role);
    };

    return (
        <>
            <ReportFilterBar
                search={keyword}
                onSearch={onSearch}
                placeholder={t("search.placeholderMalkhana")}
                filters={filters}
                year={{ from: year.from, to: year.to, options: yearOptions, onChange: (next) => setYear(next) }}
                shown={reportContent.data.length}
                total={reportContent.total}
            />

            {user?.role !== 'asp' && (
                <UploadModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    schemaType="entry"
                    onSuccess={handleImportSuccess}
                    addEntry={addMaalkhanaEntry as any}
                />
            )}

            <Report
                data={reportContent.data}
                headers={reportContent.headers}
                exportColumns={selectedEntryTypes.length === 1 && selectedEntryTypes[0] === "licensedWeapon" ? reportContent.headers : undefined}
                emptyState={reportContent.total > 0 ? { title: t("results.none"), hint: t("results.noneHint") } : undefined}
                onImportClick={() => setIsModalOpen(true)}
                heading="Malkhana Data"
                detailsPathPrefix="/report/entry-report"
            />
        </>
    );
};

export default Page;
