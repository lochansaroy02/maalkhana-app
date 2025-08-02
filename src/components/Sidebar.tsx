"use client";

import { useRouter } from 'next/navigation';

const Sidebar = () => {
    const data = [
        {
            name: "Dashboard", link: "/",
        },
        {
            name: "Seized vehical", link: "/seized-vehical",
        },
        {
            name: "Maalkhana Entry", link: "/maalkhana-entry",
        },
        {
            name: "Maalkhana Movement", link: "/maalkhana-movement",
        },
        {
            name: "Maalkhana Release", link: "/maalkhana-release",
        },
        {
            name: "Report", link: "/report",
        },

    ]
    const router = useRouter();
    return (
        <div className='bg-amber-200   h-screen ' >
            <div className='p-4  flex justify-center flex-col'>
                <div className='flex justify-center '>
                    <h1 className='text-2xl mb-8 '>
                        Sidebar
                    </h1>
                </div>
                <div className='gap-4  flex  flex-col '>
                    {
                        data.map((item: any, index: number) => (
                            <div key={index} onClick={() => {
                                router.push(item.link)
                            }} className='bg-neutral-400 cursor-pointer px-4 py-2  transition-all ease-in-out hover:bg-neutral-700 rounded-lg '>
                                <h1 className='text-base text-neutral-800'>{item.name}</h1>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Sidebar