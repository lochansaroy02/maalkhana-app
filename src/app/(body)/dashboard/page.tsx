"use client";

import ReportCard from "@/components/ReportCard";
import { useAuthStore } from "@/store/authStore";
import { useTotalEntriesStore } from "@/store/dashboardStore";
import { Banknote, Car, LucideArrowDownNarrowWide, Megaphone, Menu, Settings, Shredder, User, Wine } from "lucide-react";
import { useEffect } from "react";

const Page = () => {
    const { fetchTotalEntries, data } = useTotalEntriesStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.id) {
            fetchTotalEntries(user.id);
        }
    }, [user?.id, fetchTotalEntries]);

    // ✅ FIXED: The reportItems array now correctly accesses the data from the API.
    const reportItems = [
        {
            title: "Total Entries",
            icon: <Menu size="50px" />,
            bgColour: "bg-cyan-500",
            value: data?.total || 0,
        },
        {
            title: "Total Malkhana Entry",
            icon: <User size="50px" />,
            bgColour: "bg-red-500",
            value: data?.breakdown?.entry || 0,
        },
        {
            title: "Malkhana Movement",
            icon: <User size="50px" />,
            bgColour: "bg-orange-500",
            value: data?.breakdown?.movement || 0,
        },
        {
            title: "Malkhana Release",
            icon: <Settings size="50px" />,
            bgColour: "bg-green-500",
            value: data?.breakdown?.release || 0,
        },
        {
            title: "Seized Vehicle",
            icon: <Car size="50px" />,
            bgColour: "bg-blue-500",
            value: data?.breakdown?.siezed || 0,
        },
        {
            title: "Total Nilami",
            icon: <Megaphone size="50px" />,
            bgColour: "bg-yellow-500",
            value: data?.breakdown?.nilami || 0, // Corrected key
        },
        {
            title: "Total Destroy",
            icon: <Shredder size="50px" />,
            bgColour: "bg-pink-500",
            value: data?.breakdown?.destroy || 0, // Corrected key
        },
        {
            title: "Total English Wine Entries", // Title clarified
            icon: <Wine size="50px" />,
            bgColour: "bg-gray-500",
            value: data?.breakdown?.english || 0,
        },
        {
            title: "Total Desi Wine Entries", // Title clarified
            icon: <Wine size="50px" />,
            bgColour: "bg-fuchsia-700",
            value: data?.breakdown?.desi || 0,
        },
        {
            title: "Returned Entries", // Title clarified
            icon: <LucideArrowDownNarrowWide size="50px" />,
            bgColour: "bg-green-700",
            value: (data?.breakdown?.returnVehical || 0) + (data?.breakdown?.returnMalkhana || 0),
        },
        {
            title: "Total Cash",
            icon: <Banknote size="50px" />,
            bgColour: "bg-cyan-700",
            value: `₹ ${data?.breakdown?.totalCash || 0}`, // Corrected data access
        },
        {
            title: "Total Wine (in ltr)", // Added missing card for total wine sum
            icon: <Wine size="50px" />,
            bgColour: "bg-purple-700",
            value: `${data?.breakdown?.totalWine || 0} Ltr`,
        },
    ];

    return (
        <div className="flex h-screen  flex-col glass-effect">
            <div className="flex justify-center py-4 border-b border-white/50 rounded-t-xl bg-maroon">
                <h1 className="text-textColor text-2xl text-blue-100 font-bold">Dashboard</h1>
            </div>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 p-6  gap-4">
                {reportItems.map((item, index) => (
                    <ReportCard
                        key={index}
                        title={item.title}
                        icon={item.icon}
                        bgColour={item.bgColour}
                        data={item.value}
                    />
                ))}
            </div>
        </div>
    );
};

export default Page;