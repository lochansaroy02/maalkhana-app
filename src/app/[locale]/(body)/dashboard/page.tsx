"use client";

import MaalCategories from "@/components/MaalCategories";
import ReportCard from "@/components/ReportCard";
import WhatsNewBanner from "@/components/WhatsNewBanner";
import { useAuthStore } from "@/store/authStore";
import { useTotalEntriesStore } from "@/store/dashboardStore";
import { useDistrictStore } from "@/store/districtStore";
import {
    ArrowDownNarrowWide,
    Banknote,
    Car,
    Coins,
    Gavel,
    Menu,
    PackageOpen,
    RotateCcw,
    Shield,
    Shredder,
    Truck,
    User,
    Wine
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

// --- Enhanced Skeleton Component ---
const CardSkeleton = () => (
    <div className="h-32 w-full rounded-xl bg-white/10 border border-white/20 relative overflow-hidden shadow-sm">
        {/* Animated Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <div className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between">
                <div className="h-4 w-24 bg-white/20 rounded"></div>
                <div className="h-8 w-8 bg-white/20 rounded-full"></div>
            </div>
            <div className="h-8 w-16 bg-white/20 rounded"></div>
        </div>
    </div>
);

// --- Header Skeleton ---
const HeaderSkeleton = () => (
    <div className="col-span-full mt-6 mb-2 h-10 w-48 bg-white/10 animate-pulse rounded border-l-4 border-maroon"></div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <div className="col-span-full mt-6 mb-2">
        <h2 className="text-xl font-semibold text-blue py-4 glass-effect pl-3">
            <div className="border border-l-4 border-maroon px-2 border-y-0 border-r-0">
                {title}
            </div>
        </h2>
    </div>
);

const Page = () => {
    const { fetchTotalEntries, data, fetchAdminEntries, loading } = useTotalEntriesStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore();
    const t = useTranslations("Dashboard");
    const tu = useTranslations("ui.dashboard");
    useEffect(() => {
        if (user?.role === "policeStation") {
            if (user?.id) fetchTotalEntries(user?.id);
        } else {
            if (!userId) {
                fetchAdminEntries();
            } else {
                fetchTotalEntries(userId);
            }
        }
    }, [user?.id, fetchTotalEntries, userId, fetchAdminEntries]);

    const malkhanaData = data?.breakdown?.malkhana;
    const vehicleData = data?.breakdown?.seizedVehicle;

    // Calculations
    const actualMalkhana = (malkhanaData?.total || 0) - (malkhanaData?.release || 0) - (malkhanaData?.destroy || 0) - (malkhanaData?.nilami || 0);
    const actualVehicles = (vehicleData?.total || 0) - (vehicleData?.release || 0) - (vehicleData?.destroy || 0) - (vehicleData?.nilami || 0);

    const malkhanaItems = [
        { title: tu("currentMalkhana"), icon: <PackageOpen size={36} />, bgColour: "bg-red-600", value: actualMalkhana < 0 ? 0 : actualMalkhana, url: "/report/entry-report" },
        { title: tu("malkhanaMovement"), icon: <User size={36} />, bgColour: "bg-orange-500", value: malkhanaData?.movement || 0, url: "/report/entry-report?reportType=movement" },
        { title: tu("malkhanaRelease"), icon: <RotateCcw size={36} />, bgColour: "bg-green-600", value: malkhanaData?.release || 0, url: "/report/entry-report?reportType=release" },
        { title: tu("malkhanaDestroyed"), icon: <Shredder size={36} />, bgColour: "bg-pink-600", value: malkhanaData?.destroy || 0, url: "/report/entry-report?reportType=destroy" },
        { title: t("totalWine"), icon: <Wine size={36} />, bgColour: "bg-fuchsia-700", value: `${data?.breakdown?.wine?.total || 0} ${t("unitLtr")}`, url: "/report/entry-report" },
        { title: t("totalCash"), icon: <Banknote size={36} />, bgColour: "bg-teal-700", value: `₹${(data?.breakdown?.seizedVehicle?.totalCash || 0).toLocaleString('en-IN')}`, url: "/report/entry-report" },
        { title: t("totalYellowItem"), icon: <Coins size={36} />, bgColour: "bg-yellow-600", value: `₹${(data?.breakdown?.seizedVehicle?.totalYellowItems || 0).toLocaleString('en-IN')}`, url: "/report/entry-report" },
        { title: tu("returnedItems"), icon: <ArrowDownNarrowWide size={36} />, bgColour: "bg-slate-600", value: malkhanaData?.returned || 0, url: "/report/entry-report?reportType=return" },
    ];

    const vehicleItems = [
        { title: tu("currentVehicles"), icon: <Car size={36} />, bgColour: "bg-blue-600", value: actualVehicles < 0 ? 0 : actualVehicles, url: "/report/siezed-report" },
        { title: tu("vehicleRelease"), icon: <RotateCcw size={36} />, bgColour: "bg-emerald-600", value: vehicleData?.release || 0, url: "/report/siezed-report?reportType=release" },
        { title: tu("vehicleNilami"), icon: <Gavel size={36} />, bgColour: "bg-purple-600", value: vehicleData?.nilami || 0, url: "/report/siezed-report?reportType=nilami" },
    ];

    return (
        <div className="flex lg:h-fit flex-col glass-effect min-h-screen pb-10">
            <div className="flex justify-center py-4 border-b border-white/50 rounded-t-xl bg-maroon">
                <h1 className="text-white text-2xl font-bold">{tu("overview")}</h1>
            </div>

            <div className="p-6">
                {/* Highlights for newly added features */}
                <WhatsNewBanner
                    onShowCategories={() => {
                        const el = document.getElementById("maal-categories");
                        if (!el) return;
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        el.classList.add("animate-pulse");
                        setTimeout(() => el.classList.remove("animate-pulse"), 2400);
                    }}
                />

                {/* Property categories, one per entry type */}
                <MaalCategories userId={user?.role === "policeStation" ? user?.id : userId || undefined} />
                {/* Item categories (श्रेणी chosen on the Malkhana Entry form) */}
                <MaalCategories by="category" userId={user?.role === "policeStation" ? user?.id : userId || undefined} />

                {/* Global Stats Grid */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
                    {loading ? (
                        <>
                            {/* Loading State for Admin Stats */}
                            {user?.role !== "policeStation" && (
                                <>
                                    <CardSkeleton />
                                    <CardSkeleton />
                                </>
                            )}

                            {/* Loading State for Malkhana Section */}
                            <HeaderSkeleton />
                            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={`m-skel-${i}`} />)}

                            {/* Loading State for Vehicle Section */}
                            <HeaderSkeleton />
                            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={`v-skel-${i}`} />)}
                        </>
                    ) : (
                        <>
                            {/* Admin Only Top Cards */}
                            {user?.role !== "policeStation" && (
                                <>
                                    <ReportCard title={t("totalPoliceStation")} icon={<Shield size={36} />} bgColour="bg-neutral-700" data={data?.breakdown?.totalPoliceStation || 0} url="/total-data" />
                                    <ReportCard title={t("totalEntries")} icon={<Menu size={36} />} bgColour="bg-cyan-700" data={data?.breakdown?.totalEntries || 0} url="/report/entry-report" />
                                </>
                            )}

                            <SectionHeader title={tu("malkhanaSection")} />
                            {malkhanaItems.map((item, idx) => (
                                <ReportCard key={idx} {...item} data={item.value} />
                            ))}

                            <SectionHeader title={tu("vehicleSection")} />
                            {vehicleItems.map((item, idx) => (
                                <ReportCard key={idx} {...item} data={item.value} />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Page;