"use client";

import Logo from '@/assets/Logo';
import Spycore from '@/assets/Spycore';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { Barcode, Bus, Clipboard, LayoutDashboard, Package, PackageOpen, Shredder, UploadIcon, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const Sidebar = () => {
    const path = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const { isOpen } = useSidebarStore();
    const t = useTranslations("Sidebar");

    const sidebarData = useMemo(() => {
        const baseRoutes = [
            { name: t("dashboard"), link: "/dashboard", icon: <LayoutDashboard size={16} /> },
            { name: t("malkhana"), link: "/maalkhana-entry", icon: < Package size={16} /> },
            { name: t("vehicles"), link: "/seized-vehical", icon: <Bus size={16} /> },
            { name: t("movement"), link: "/movement", icon: <UploadIcon size={16} /> },
            { name: t("release"), link: "/release", icon: <PackageOpen size={16} /> },
            { name: t("destroy"), link: "/destroy", icon: <Shredder size={16} /> },
            { name: t("barcode"), link: "/barcode", icon: <Barcode size={16} /> },
            { name: t("report"), link: "/report", icon: <Clipboard size={16} /> },
        ];

        if (user?.role === 'district') {
            return [...baseRoutes, { name: "Users", link: "/users", icon: <Users size={16} /> }];
        }
        return baseRoutes;
    }, [user, t]);

    return (
        <div className={` ${isOpen ? "flex" : "hidden"} h-screen lg:flex transition-all ease-in-out duration-300 z-40 lg:w-[20%] lg:pt-0 pt-18 fixed lg:glass-effect border border-white/50 rounded-xl bg-blue `}>
            <div className='p-4 h-full flex gap-4 flex-col'>
                <div className='flex justify-center'>
                    <Logo width={100} height={100} />
                </div>
                <div className='flex flex-col justify-between   h-full lg:gap-4 gap-6'>
                    <div className='gap-2 flex flex-col'>
                        {sidebarData.map((item, index) => {
                            if (!item) return null;
                            const baseLink = item.link.split('/').pop() || item.link;
                            const isActive = path.includes(baseLink);
                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        // For reports, navigate to the default entry report page
                                        const targetLink = item.link === '/report' ? '/report/entry-report' : item.link;
                                        router.push(targetLink);
                                    }}
                                    className={`${isActive ? "bg-maroon" : "glass-effect"} cursor-pointer py-2 px-4 transition-all ease-in-out rounded-lg`}
                                >
                                    <div className='flex items-center gap-1'>
                                        <span className='text-blue-100/80 '>
                                            {item.icon}
                                        </span>
                                        <h1 className='text-sm text-blue-100'>{item.name}</h1>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className='lg:p-2 items-center flex flex-col justify-center mb-2 rounded-xl  border-white/20 bg-blue'>
                        <div className='w-3/4 flex flex-col justify-center items-center'>
                            <Spycore />
                            <h1 className='text-blue-100 text-sm'>Helpline</h1>
                            <h2 className='text-blue-100 text-sm'>+917500064949</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
