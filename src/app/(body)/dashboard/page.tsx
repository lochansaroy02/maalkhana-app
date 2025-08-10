"use client";

import ReportCard from "@/components/ReportCard";
import { useAuthStore } from "@/store/authStore";
import { useTotalEntriesStore } from "@/store/dashboardStore";
import { Banknote, Car, Megaphone, Menu, Settings, Shredder, User, Wine } from "lucide-react";
import { useEffect } from "react";

const Page = () => {
    const { fetchTotalEntries, data } = useTotalEntriesStore();
    const { user } = useAuthStore()

    useEffect(() => {
        fetchTotalEntries(user?.id);
    }, [user?.id]);

    console.log(data);
    const reportItems = [
        {
            title: "Total Entries",
            icon: <Menu size="50px" />,
            bgColour: "bg-cyan-500",
            value: data?.total,
        },
        {
            title: "Total Malkhana Entry",
            icon: <User size="50px" />,
            bgColour: "bg-red-500",
            value: data?.breakdown?.entry,
        },
        {
            title: "Malkhana Movement",
            icon: <User size="50px" />,
            bgColour: "bg-orange-500",
            value: data?.breakdown?.movement,
        },
        {
            title: "Malkhana Release",
            icon: <Settings size="50px" />,
            bgColour: "bg-green-500",
            value: data?.breakdown?.release,
        },
        {
            title: "Seized Vehicle",
            icon: <Car size="50px" />,
            bgColour: "bg-blue-500",
            value: data?.breakdown?.siezed,
        },
        {
            title: "Total Nilami",
            icon: <Megaphone size="50px" />,
            bgColour: "bg-yellow-500",
            value: data?.breakdown?.nilami,
        },
        {
            title: "Total Destroy",
            icon: <Shredder size="50px" />,
            bgColour: "bg-pink-500",
            value: data?.breakdown?.destroy,
        },

        {
            title: "Total Wine (in ltr)",
            icon: <Wine size="50px" />,
            bgColour: "bg-gray-500",
            //@ts-ignore
            value: data?.breakdown?.wineCount?._sum?.wine,
        },
        {
            title: "Total Cash ",
            icon: <Banknote size="50px" />,
            bgColour: "bg-fuchsia-700",
            //@ts-ignore
            value: `₹ ${data?.breakdown?.totalCash?._sum?.cash}`,
        },
    ];

    return (
        <div className="flex h-screen  flex-col glass-effect">
            <div className="flex justify-center py-4 border-b border-white/50 rounded-t-xl bg-maroon">
                <h1 className="text-textColor text-2xl text-blue-100 font-bold">Dashboard</h1>
            </div>
            <div className="grid grid-cols-4 p-6  gap-4">
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
