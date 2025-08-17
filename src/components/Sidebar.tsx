"use client";

import Logo from '@/assets/Logo';
import Spycore from '@/assets/Spycore';
import { useAuthStore } from '@/store/authStore'; // 1. Import the auth store
import { useSidebarStore } from '@/store/sidebarStore';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const Sidebar = () => {
    const path = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const { isOpen } = useSidebarStore()

    const sidebarData = useMemo(() => {
        const baseRoutes = [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Malkhana Entry", link: "/maalkhana-entry" },
            { name: "Seized vehicles", link: "/seized-vehical" },
            { name: "Malkhana Movement", link: "/maalkhana-movement" },
            { name: "Malkhana Release", link: "/maalkhana-release" },
            { name: "Scan Barcode", link: "/barcode" },
            { name: "Report", link: "/report/entry-report" },
        ];

        // 4. If the user's role is 'district', add the "Users" route
        if (user?.role === 'district') {
            return [...baseRoutes, { name: "Users", link: "/users" }];
        }

        // Otherwise, return only the base routes
        return baseRoutes;
    }, [user]); // The sidebarData will re-calculate whenever the user object changes

    return (
        <div className={` ${isOpen ? "flex" : "hidden"} h-screen   lg:flex transition-all ease-in-out duration-300  z-40  lg:w-[20%] lg:pt-0 pt-18 fixed lg:glass-effect border border-white/50 rounded-xl bg-blue  lg:bg-transparent`} >
            <div className='p-4 h-full  flex gap-4   flex-col'>
                <div className='flex justify-center '>
                    <Logo width={100} height={100} />
                </div>
                <div className='flex flex-col justify-between   h-full  lg:gap-12  gap-6  '>

                    <div className='gap-2  flex  flex-col '>
                        {
                            // 5. Map over the dynamically generated sidebarData
                            sidebarData.map((item, index) => {
                                if (!item) return null; // Handle potential null values from your original data
                                const isActive =
                                    (item.link === '/' && path === '/') ||
                                    (item.link !== '/' && (path === item.link || path.startsWith(item.link)));
                                return <div key={index} onClick={() => {
                                    router.push(item.link)
                                }} className={` ${isActive ? "bg-maroon" : "glass-effect "}
                            cursor-pointer py-2 px-4
                             transition-all ease-in-out
                               rounded-lg
                                `}>
                                    <h1 className='text-sm text-blue-100 '>{item.name}</h1>
                                </div>
                            }
                            )
                        }
                    </div>
                    <div className=' lg:p-4  items-center flex flex-col justify-center mb-2 rounded-xl border border-white/30 bg-blue'>
                        <Spycore />
                        <h1 className='text-blue-100'>Helpline</h1>
                        <h2 className='text-blue-100'>+917078146730</h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;
