"use client";

import { useOpenStore } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import DropDown from "./ui/DropDown";

const ReportHeader = () => {
    const { reportType, setReportType } = useOpenStore()


    const router = useRouter()
    const path = usePathname()


    const data = [

        {
            name: "Malkhana Entry", link: "/report/entry-report", colour: "bg-green-500"
        },
        {
            name: "Seized vehicle", link: "/report/siezed-report", colour: "bg-red-500"
        },
    ]
    return (
        <div className="  py-1   justify- flex  h-14    ">
            <div className="flex   gap-8  px-4   h-full ">
                {
                    data.map((item, index) => {
                        const isActive = path === item.link
                        return <div key={index} onClick={() => {
                            router.push(item.link)
                        }}
                            className={`${isActive ? "bg-maroon" : "glass-effect"
                                } px-4 py-2 cursor-pointer  flex items-center   text-white  rounded-xl`}
                        >
                            {item.name}
                        </div>
                    }


                    )
                }

                <div>
                    <DropDown selectedValue={reportType} handleSelect={setReportType} options={["All", "movement", "release", "destroy", "return",]} />
                </div>
            </div>
        </div>
    )
}

export default ReportHeader