"use client";

import { useAuthStore } from "@/store/authStore";
import { useSearchStore } from "@/store/searchStore";
import { useOpenStore } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
const ReportHeader = () => {
    const { setDbName, dbName, getSearchResult, } = useSearchStore()
 
    const { user } = useAuthStore()
    const router = useRouter();
    const path = usePathname();





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




 


    return (
        <div className="py-1 justify-center flex h-14">
            <div className="flex px-4 gap-4  h-full  items-center">
                {data.map((item, index) => {
                    const isActive = path.endsWith(item.link);
                    return (
                        <div
                            key={index}
                            onClick={() => router.push(item.link)}
                            className={`${isActive ? "bg-maroon" : ""}  px-4 py-2 cursor-pointer flex items-center text-white rounded-xl  ease-in transition-all `}
                        >
                            {item.name}
                        </div>
                    );
                })}



            </div>
        </div>
    );
};

export default ReportHeader;