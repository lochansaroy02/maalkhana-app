// pages/index.tsx (The Dashboard component)
"use client";

import { PiChart } from "@/components/Charts";
import ReportCard from "@/components/ReportCard";
import { useAuthStore } from "@/store/authStore";
import { useTotalEntriesStore } from "@/store/dashboardStore";
import { useDistrictStore } from "@/store/districtStore";
import { ArrowDownNarrowWide, Banknote, Car, Megaphone, Menu, Settings, Shield, Shredder, User, Wine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const Page = () => {
    const { fetchTotalEntries, data, fetchAdminEntries } = useTotalEntriesStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore()

    useEffect(() => {
        if (user?.role === "policeStation") {
            if (user?.id) {
                fetchTotalEntries(user?.id)
            }
        } else {
            if (!userId) {
                fetchAdminEntries()
            } else {
                fetchTotalEntries(userId)
            }
        }
    }, [user?.id, fetchTotalEntries, userId]);

    const t = useTranslations("Dashboard");
    const reportItems = [
        {
            title: t("totalPoliceStation"),
            icon: <Shield size={40} />,
            bgColour: `bg-neutral-500 `,
            value: data?.breakdown?.totalPoliceStation || 0,
            url: "/users"
        },
        {
            title: t("totalEntries"),
            icon: <Menu size={40} />,
            bgColour: "bg-cyan-500",
            value: data?.breakdown?.totalEntries || 0,
            url: "/report/entry-report"
        },
        {
            title: t("totalMalkhanaEntry"),
            icon: <User size={40} />,
            bgColour: "bg-red-500",
            value: data?.breakdown?.entry - data?.breakdown?.movement - data?.breakdown?.release || 0,
            url: "/report/entry-report"
        },
        {
            title: t("malkhanaMovement"),
            icon: <User size={40} />,
            bgColour: "bg-orange-500",
            value: data?.breakdown?.movement || 0,
            url: "/report/entry-report?reportType=movement"
        },
        {
            title: t("malkhanaRelease"),
            icon: <Settings size={40} />,
            bgColour: "bg-green-500",
            value: data?.breakdown?.release || 0,
            // Added URL with query parameter for filtering
            url: "/report/entry-report?reportType=release"
        },
        {
            title: t("seizedVehicles"),
            icon: <Car size={40} />,
            bgColour: "bg-blue-500",
            value: data?.breakdown?.siezed || 0,
            url: "/report/siezed-report"
        },
        {
            title: t("totalNilami"),
            icon: <Megaphone size={40} />,
            bgColour: "bg-purple-500",
            value: data?.breakdown?.nilami || 0,
            url: "/report/entry-report?reportType=nilami"
        },
        {
            title: t("totalDestroyedItems"),
            icon: <Shredder size={40} />,
            bgColour: "bg-pink-500",
            value: data?.breakdown?.destroy || 0,
            url: "/report/entry-report?reportType=destroy"
        },
        {
            title: t("returnedEntries"),
            icon: <ArrowDownNarrowWide size={40} />,
            bgColour: "bg-green-700",
            value: data?.breakdown?.totalReturn || 0,
            url: "/report/entry-report?reportType=return"
        },
        {
            title: t("totalWine"),
            icon: <Wine size={40} />,
            bgColour: "bg-purple-700",

            // I will fix it leter
            value: `${data?.breakdown?.totalWine._sum.wine || 0} ${t("unitLtr")}`,
        },

        {
            title: t("totalDesiWine"),
            icon: <Wine size={40} />,
            bgColour: "bg-purple-700",

            // I will fix it leter
            value: `${data?.desi?._sum.wine || 0} ${t("unitLtr")}`,
        },
        {
            title: t("totalEnglishWine"),
            icon: <Wine size={40} />,
            bgColour: "bg-amber-700",

            // I will fix it leter
            value: `${data?.angrezi?._sum.wine || 0} ${t("unitLtr")}`,
        },
        {
            title: t("totalCash"),
            icon: <Banknote size={40} />,
            bgColour: "bg-cyan-700",
            value: `₹${(data?.breakdown?.totalCash._sum.cash || 0).toLocaleString('en-IN')}`,
        },
        {
            title: t("totalYellowItem"),
            icon: <Banknote size={40} />,
            bgColour: "bg-yellow-500",
            value: ` ₹${(data?.breakdown?.totalYellowItems._sum.yellowItemPrice / 2 || 0).toLocaleString('en-IN')}`,
        },
    ];

    return (
        <div className="flex lg:h-fit flex-col glass-effect">
            <div className="flex justify-center py-4 border-b border-white/50 rounded-t-xl bg-maroon">
                <h1 className="text-textColor text-2xl text-blue-100 font-bold">Dashboard</h1>
            </div>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 p-6 gap-4">
                {reportItems.map((item, index) => {
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
                })}

            </div>

            <div className="p-4 ">
                <PiChart data={data} />
            </div>
            {/* <chart */}
        </div>
    );
};

export default Page;