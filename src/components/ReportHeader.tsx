"use client";

import { useAuthStore } from "@/store/authStore";
import { useSearchStore } from "@/store/searchStore";
import { useOpenStore } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InputComponent from "./InputComponent";
import DropDown from "./ui/DropDown";
import { Button } from "./ui/button";
const ReportHeader = () => {
    const { setDbName, dbName, getSearchResult } = useSearchStore()
    const { reportType, setReportType } = useOpenStore();

    const { user } = useAuthStore()
    const router = useRouter();
    const path = usePathname();


    const [keyword, setKeyword] = useState<any>([])


    const data = [
        { name: "Malkhana Entry", link: "/report/entry-report", colour: "bg-green-500" },
        { name: "Seized vehicle", link: "/report/siezed-report", colour: "bg-red-500" },
    ];

    useEffect(() => {
        if (path.endsWith("/report/entry-report")) {
            setDbName("m")
        }
        if (path.endsWith("/report/siezed-report")) {
            setDbName("v")
        }

    }, [path])




    const reportTypeOptions = ["All", "movement", "release", "destroy", "return"].map(item => ({
        value: item,
        label: item.charAt(0).toUpperCase() + item.slice(1) // Capitalize first letter for better display
    }));


    const handleSearch = async () => {
        try {
            const data = await getSearchResult(keyword, user?.id)
            console.log(data)
        } catch (error) {

        }

    }
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

                <div className="flex gap-4 ">
                    <InputComponent id="search"
                        value={keyword}
                        setInput={(e) => setKeyword(e.target.value)} />
                    <Button onClick={handleSearch}>Search</Button>
                </div>
            </div>
        </div>
    );
};

export default ReportHeader;