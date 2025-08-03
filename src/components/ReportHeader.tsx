"use client";

import { usePathname, useRouter } from "next/navigation";
const ReportHeader = () => {


    const router = useRouter()
    const path = usePathname()


    const data = [

        {
            name: "Seized vehical", link: "/report/siezed-report", colour: "bg-red-500"
        },
        {
            name: "Malkhana Entry", link: "/report/entry-report", colour: "bg-green-500"
        },
        {
            name: "Malkhana Movement", link: "/report/movement-report", colour: "bg-blue-500"
        },
        {
            name: "Malkhana Release", link: "/report/release-report", colour: "bg-amber-500"
        },
    ]
    return (
        <div className="  py-1  h-14    ">
            <div className="flex  justify-between px-4   h-full ">
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
            </div>
        </div>
    )
}

export default ReportHeader