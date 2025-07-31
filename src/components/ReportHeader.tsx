"use client";

import { usePathname, useRouter } from "next/navigation";

const ReportHeader = () => {


    const router = useRouter()
    const path = usePathname()


    const data = [

        {
            name: "Seized vehical", link: "/report", colour: "bg-red-500"
        },
        {
            name: "Maalkhana Entry", link: "/report/entry-report", colour: "bg-green-500"
        },
        {
            name: "Maalkhana Movement", link: "/report/movement-report", colour: "bg-blue-500"
        },
    ]
    return (
        <div className="bg-gray-500 h-12  ">
            <div className="flex  justify-between px-4  h-full ">
                {
                    data.map((item, index) => {
                        const isActive = path === item.link
                        return <div key={index} onClick={() => {
                            router.push(item.link)
                        }}
                            className={`${isActive ? "bg-cream" : "bg-gray-600"
                                } px-2 py-1 cursor-pointer mt-2  rounded-b-none rounded-xl`}
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