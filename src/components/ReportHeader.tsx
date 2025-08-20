"use client";

import { useOpenStore } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import DropDown from "./ui/DropDown";

const ReportHeader = () => {
    const { reportType, setReportType } = useOpenStore();
    const router = useRouter();
    const path = usePathname();

    const data = [
        { name: "Malkhana Entry", link: "/report/entry-report", colour: "bg-green-500" },
        { name: "Seized vehicle", link: "/report/siezed-report", colour: "bg-red-500" },
    ];


    const reportTypeOptions = ["All", "movement", "release", "destroy", "return"].map(item => ({
        value: item,
        label: item.charAt(0).toUpperCase() + item.slice(1) // Capitalize first letter for better display
    }));

    return (
        <div className="py-1 justify-start flex h-14">
            <div className="flex gap-8 px-4 h-full items-center">
                {data.map((item, index) => {
                    // ✅ FIX: Check if the current path ends with the item's link.
                    // This correctly handles locale prefixes like '/hi' or '/en'.
                    const isActive = path.endsWith(item.link);
                    return (
                        <div
                            key={index}
                            onClick={() => router.push(item.link)}
                            className={`${isActive ? "bg-maroon" : "glass-effect"} px-4 py-2 cursor-pointer flex items-center text-white rounded-xl`}
                        >
                            {item.name}
                        </div>
                    );
                })}

                <div>
                    <DropDown
                        selectedValue={reportType}
                        handleSelect={setReportType}
                        options={reportTypeOptions}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportHeader;