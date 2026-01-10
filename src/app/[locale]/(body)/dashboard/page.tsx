"use client";

import { PiChart } from "@/components/Charts";
import ReportCard from "@/components/ReportCard";
import { useAuthStore } from "@/store/authStore";
import { useTotalEntriesStore } from "@/store/dashboardStore";
import { useDistrictStore } from "@/store/districtStore";
import { ArrowDownNarrowWide, Banknote, Car, Megaphone, Menu, Settings, Shield, Shredder, User, Wine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

// --- Skeleton Component for individual cards ---
const CardSkeleton = () => (
    <div className="h-32 w-full bg-slate-200 animate-pulse rounded-xl border border-slate-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer"></div>
    </div>
);

// --- Skeleton for the Chart ---
const ChartSkeleton = () => (
    <div className="h-[400px] w-full bg-blue-100 animate-pulse rounded-xl flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border-8 border-slate-200 border-t-slate-300 animate-spin"></div>
    </div>
);

const Page = () => {
    // Assuming your store has an 'isLoading' or 'loading' property
    const { fetchTotalEntries, data, fetchAdminEntries, loading } = useTotalEntriesStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore();
    const t = useTranslations("Dashboard");

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

    const totalEntry = (data?.breakdown?.entry || 0) - (data?.breakdown?.movement || 0) - (data?.breakdown?.release || 0) - (data?.breakdown?.destroy || 0);
    const actualEntries = totalEntry < 0 ? "0" : totalEntry;
    const movementvalue = (data?.breakdown?.movement || 0) < 0 ? 0 : data?.breakdown?.movement;

    const reportItems = [
        { title: t("totalPoliceStation"), icon: <Shield size={40} />, bgColour: "bg-neutral-500", value: data?.breakdown?.totalPoliceStation || 0, url: "/total-data" },
        { title: t("totalEntries"), icon: <Menu size={40} />, bgColour: "bg-cyan-500", value: data?.breakdown?.totalEntries || 0, url: "/report/entry-report" },
        { title: t("totalMalkhanaEntry"), icon: <User size={40} />, bgColour: "bg-red-500", value: actualEntries || 0, url: "/report/entry-report" },
        { title: t("malkhanaMovement"), icon: <User size={40} />, bgColour: "bg-orange-500", value: movementvalue || 0, url: "/report/entry-report?reportType=movement" },
        { title: t("malkhanaRelease"), icon: <Settings size={40} />, bgColour: "bg-green-500", value: data?.breakdown?.release || 0, url: "/report/entry-report?reportType=release" },
        { title: t("seizedVehicles"), icon: <Car size={40} />, bgColour: "bg-blue-500", value: data?.breakdown?.siezed || 0, url: "/report/siezed-report" },
        { title: t("totalNilami"), icon: <Megaphone size={40} />, bgColour: "bg-purple-500", value: data?.breakdown?.nilami || 0, url: "/report/entry-report?reportType=nilami" },
        { title: t("totalDestroyedItems"), icon: <Shredder size={40} />, bgColour: "bg-pink-500", value: data?.breakdown?.destroy || 0, url: "/report/entry-report?reportType=destroy" },
        { title: t("returnedEntries"), icon: <ArrowDownNarrowWide size={40} />, bgColour: "bg-green-700", value: data?.breakdown?.totalReturn || 0, url: "/report/entry-report?reportType=return" },
        { title: t("totalWine"), icon: <Wine size={40} />, bgColour: "bg-purple-700", value: `${data?.breakdown?.totalWine?._sum?.wine || 0} ${t("unitLtr")}` },
        { title: t("totalDesiWine"), icon: <Wine size={40} />, bgColour: "bg-purple-700", value: `${data?.desi?._sum?.wine || 0} ${t("unitLtr")}` },
        { title: t("totalEnglishWine"), icon: <Wine size={40} />, bgColour: "bg-amber-700", value: `${data?.angrezi?._sum?.wine || 0} ${t("unitLtr")}` },
        { title: t("totalCash"), icon: <Banknote size={40} />, bgColour: "bg-cyan-700", value: `₹${(data?.breakdown?.totalCash?._sum?.cash || 0).toLocaleString('en-IN')}` },
        { title: t("totalYellowItem"), icon: <Banknote size={40} />, bgColour: "bg-yellow-500", value: ` ₹${(data?.breakdown?.totalYellowItems?._sum?.yellowItemPrice / 2 || 0).toLocaleString('en-IN')}` },
    ];

    return (
        <div className="flex lg:h-fit flex-col glass-effect min-h-screen">
            <div className="flex justify-center py-4 border-b border-white/50 rounded-t-xl bg-maroon">
                <h1 className="text-white text-2xl font-bold">Dashboard</h1>
            </div>

            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 p-6 gap-4">
                {loading ? (
                    // Show 12 skeleton cards while loading
                    Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                    reportItems.map((item, index) => {
                        if (user?.role === "policeStation" && item.title === t("totalPoliceStation") && userId === "") {
                            return null;
                        }
                        return (
                            <ReportCard
                                url={item.url}
                                key={index}
                                title={item.title}
                                icon={item.icon}
                                bgColour={item.bgColour}
                                data={item.value}
                            />
                        );
                    })
                )}
            </div>

            <div className="p-4">
                {loading ? <ChartSkeleton /> : <PiChart data={data} />}
            </div>
        </div>
    );
};

export default Page;