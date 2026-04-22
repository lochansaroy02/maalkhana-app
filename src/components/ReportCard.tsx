"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface CardProps {
    title: string;
    // Changed to string | number to handle "₹500" or "10 Ltr"
    data: string | number | undefined;
    bgColour: string;
    icon: ReactNode;
    url?: string;
}

const ReportCard = ({ data, bgColour, icon, title, url }: CardProps) => {
    const router = useRouter();

    const handleClick = () => {
        // Only navigate if a URL is provided
        if (url) {
            router.push(url);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                ${bgColour} 
                ${url ? "cursor-pointer hover:brightness-110 active:scale-95" : "cursor-default"} 
                transition-all duration-200
                px-4 py-4 gap-2 
                min-h-[128px] w-full
                rounded-xl shadow-md
                flex flex-col justify-between
            `}
        >
            <div className="flex justify-between items-start gap-2">
                <h1 className="text-sm lg:text-base font-medium text-white/90 leading-tight">
                    {title}
                </h1>
                <div className="text-white/80">
                    {icon}
                </div>
            </div>

            <div className="flex items-end">
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    {data !== undefined && data !== null ? data : "0"}
                </h1>
            </div>
        </div>
    );
};

export default ReportCard;