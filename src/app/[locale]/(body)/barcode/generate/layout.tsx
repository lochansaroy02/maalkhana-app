"use client";

import Link from 'next/link'; // Import Link for navigation
import { usePathname } from 'next/navigation'; // Import usePathname to track the active page

// This component is now a Layout, so it receives 'children' as a prop
const GenerateBarcodeLayout = ({ children }: { children: any }) => {

    // Get the current URL path to highlight the active tab
    const pathname = usePathname();
    const tabs = [
        { name: 'Single', href: '/barcode/generate/single' },
        { name: 'Multiple', href: '/barcode/generate/multiple' }
    ];

    return (
        <div className='h-screen glass-effect'>
            {/* HEADER */}
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>
                    generate barcode
                </h1>
            </div>

            {/* TAB NAVIGATION */}
            <div className='flex justify-center border-b border-gray-300 bg-white/20 backdrop-blur-sm'>
                {tabs.map((tab) => {
                    // Check if the current path starts with the tab's href
                    // This makes the tab stay active even on nested routes
                    // e.g., /generate-barcode/single/preview
                    const isActive = pathname.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`
                                py-3 px-8 text-sm font-medium uppercase transition-all
                                ${isActive
                                    ? 'border-b-2 border-maroon text-maroon' // Active tab style
                                    : 'text-gray-600 hover:text-black hover:border-b-2 hover:border-gray-400' // Inactive tab style
                                }
                            `}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </div>
            <div className='p-4 md:p-8'>
                {children}
            </div>

        </div>
    );
}

export default GenerateBarcodeLayout;