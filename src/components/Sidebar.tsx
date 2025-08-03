"use client";

import Logo from '@/assets/Logo';
import { usePathname, useRouter } from 'next/navigation';

const Sidebar = () => {
    const path = usePathname()

    const data = [
        {
            name: "Dashboard", link: "/",
        },
        {
            name: "Malkhana Entry", link: "/maalkhana-entry",
        },
        {
            name: "Malkhana Movement", link: "/maalkhana-movement",
        },
        {
            name: "Malkhana Release", link: "/maalkhana-release",
        },
        {
            name: "Seized vehical", link: "/seized-vehical",
        },
        {
            name: "Report", link: "/report/siezed-report",
        },
        {
            name: "users", link: "/users",
        },

    ]
    const router = useRouter();
    return (
        <div className=' h-screen  w-[20%] fixed glass-effect ' >
            <div className='p-4  flex gap-4  justify-center flex-col'>
                <div className='flex justify-center '>
                    <Logo width={100} height={100} />
                </div>
                <div className='gap-4  flex  flex-col '>
                    {
                        data.map((item: any, index: number) => {
                            const isActive =
                                (item.link === '/' && path === '/') ||
                                (item.link !== '/' && (path === item.link || path.includes(item.link)));

                            return <div key={index} onClick={() => {
                                router.push(item.link)
                            }} className={` ${isActive ? "bg-maroon" : "glass-effect "}
                            cursor-pointer py-2 px-4 
                             transition-all ease-in-out 
                               rounded-lg  `}>
                                <h1 className='text-base text-blue-100 '>{item.name}</h1>
                            </div>
                        }
                        )
                    }
                </div>
                <div className=' p-4  mb-2 glass-effect'>
                    <h1 className='text-blue-100'>Helpline</h1>
                    <h2 className='text-blue-100'>+9187787873</h2>
                </div>
            </div>
        </div>
    )
}

export default Sidebar