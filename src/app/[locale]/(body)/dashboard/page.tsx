"use client";

import ReportCard from "@/components/ReportCard";
import { useAuthStore } from "@/store/authStore";
import { useTotalEntriesStore } from "@/store/dashboardStore";
import { ArrowDownNarrowWide, Banknote, Car, Megaphone, Menu, Settings, Shield, Shredder, User, Wine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const Page = () => {
    const { fetchTotalEntries, data, fetchAdminEntries } = useTotalEntriesStore();
    const { user, } = useAuthStore();



    useEffect(() => {

        if (user?.role === "policeStation") {
            fetchTotalEntries(user.id)
        } else {
            fetchAdminEntries()
        }
    }, [user?.id, fetchTotalEntries]);


    const t = useTranslations("Dashboard");
    const reportItems = [
        {
            title: t("totalPoliceStation"),
            icon: <Shield size={40} />,
            bgColour: `bg-neutral-500 `,
            value: data?.breakdown?.totalPoliceStation || 0,
        },

        {
            title: t("totalEntries"),
            icon: <Menu size={40} />,
            bgColour: "bg-cyan-500",
            value: data?.breakdown?.totalEntries || 0,
        },
        {
            title: t("totalMalkhanaEntry"),
            icon: <User size={40} />,
            bgColour: "bg-red-500",
            value: data?.breakdown?.entry || 0,
        },
        {
            title: t("malkhanaMovement"),
            icon: <User size={40} />,
            bgColour: "bg-orange-500",
            value: data?.breakdown?.movement || 0,
        },
        {
            title: t("malkhanaRelease"),
            icon: <Settings size={40} />,
            bgColour: "bg-green-500",
            value: data?.breakdown?.release || 0,
        },
        {
            title: t("seizedVehicles"),
            icon: <Car size={40} />,
            bgColour: "bg-blue-500",
            value: data?.breakdown?.siezed || 0,
        },
        {
            title: t("totalNilami"),
            icon: <Megaphone size={40} />,
            bgColour: "bg-purple-500",
            value: data?.breakdown?.nilami || 0,
        },
        {
            title: t("totalDestroyedItems"),
            icon: <Shredder size={40} />,
            bgColour: "bg-pink-500",
            value: data?.breakdown?.destroy || 0,
        },
        {
            title: t("returnedEntries"),
            icon: <ArrowDownNarrowWide size={40} />,
            bgColour: "bg-green-700",
            value: data?.breakdown?.totalReturn || 0,
        },
        {
            title: t("totalEnglishWine"),
            icon: <Wine size={40} />,
            bgColour: "bg-gray-500",
            value: `${data?.breakdown?.english?._sum?.wine || 0} ${t("unitLtr")}`,
        },
        {
            title: t("totalDesiWine"),
            icon: <Wine size={40} />,
            bgColour: "bg-fuchsia-700",
            value: `${data?.breakdown?.desi?._sum?.wine || 0} ${t("unitLtr")}`,
        },
        {
            title: t("totalWine"),
            icon: <Wine size={40} />,
            bgColour: "bg-purple-700",
            value: `${data?.breakdown?.totalWine?._sum?.wine || 0} ${t("unitLtr")}`,
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
            value: ` ₹${(data?.breakdown?.totalYellowItems._sum.yellowItemPrice || 0).toLocaleString('en-IN')}`,

        },

    ];



    return (
        <div className="flex lg:h-screen  flex-col glass-effect">
            <div className="flex justify-center py-4 border-b border-white/50 rounded-t-xl bg-maroon">
                <h1 className="text-textColor text-2xl text-blue-100 font-bold">Dashboard</h1>
            </div>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 p-6 gap-4">
                {reportItems.map((item, index) => {
                    if (user?.role === "policeStation" && item.title === t("totalPoliceStation")) {
                        return null; // skip rendering
                    }
                    return (
                        <ReportCard
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            bgColour={item.bgColour}
                            data={item.value}
                        />
                    );
                })}
            </div>

        </div>
    );
};

export default Page;