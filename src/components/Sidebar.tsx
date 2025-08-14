"use client";

import Logo from '@/assets/Logo';
import Spycore from '@/assets/Spycore';
import { useAuthStore } from '@/store/authStore'; // 1. Import the auth store
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const Sidebar = () => {
    const path = usePathname();
    const router = useRouter();
    const { user } = useAuthStore(); // 2. Get the logged-in user from the store

    // 3. Use useMemo to create the sidebar data based on the user's role
    const sidebarData = useMemo(() => {
        const baseRoutes = [
            { name: "Dashboard", link: "/dashboard" },
            { name: "Malkhana Entry", link: "/maalkhana-entry" },
            { name: "Seized vehicles", link: "/seized-vehical" },
            { name: "Malkhana Movement", link: "/maalkhana-movement" },
            { name: "Malkhana Release", link: "/maalkhana-release" },
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
        <div className=' h-screen  w-[20%] fixed glass-effect ' >
            <div className='p-4  flex gap-4   flex-col'>
                <div className='flex justify-center '>
                    <Logo width={100} height={100} />
                </div>
                <div className='flex flex-col  gap-24 '>

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
                    <div className=' p-4  items-center flex flex-col justify-center mb-2 rounded-xl border border-white/30 bg-blue'>
                        <Spycore height={240} width={240} />
                        <h1 className='text-blue-100'>Helpline</h1>
                        <h2 className='text-blue-100'>+917505065746</h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;
