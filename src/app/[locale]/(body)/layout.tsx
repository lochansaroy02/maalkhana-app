
"use client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useSidebarStore } from "@/store/sidebarStore";

export default function BodyLayout({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebarStore()

    return (
        <>
            <Sidebar />
            <div className="lg:pl-[20%] w-full">
                <Header />
                <div className="lg-pt-18  pt-18  ">
                    {children}
                </div>
            </div>
        </>
    );
}
