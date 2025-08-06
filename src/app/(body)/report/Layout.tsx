"use client";

import ExcelImport from '@/components/ExcelImport';
import Modal from '@/components/Modal';
import ReportHeader from '@/components/ReportHeader';
import { useOpenStore } from '@/store/store';
import { X } from 'lucide-react';
import React from 'react';

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const { isOpen, setIsOpen } = useOpenStore();
    return (
        <div className='relative h-screen glass-effect'>
            {/* Header */}
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Reports</h1>
            </div>

            {/* Sub Header */}
            <ReportHeader />


            {children}

            {/* Import Button */}
            <div
                onClick={() => setIsOpen(true)}
                className='fixed bottom-12 px-4 py-2 right-8 flex justify-center glass-effect items-center cursor-pointer hover:scale-105 transition'
            >
                <h1 className='text-lg font-bold text-blue-300'>Import</h1>
            </div>

            {/* Modal */}
            {isOpen && (
                <Modal>

                    <div
                        onClick={() => setIsOpen(false)}
                        className="absolute cursor-pointer bg-red-800 right-4 top-2 rounded-full p-1"
                    >
                        <span className="text-blue-100"><X size={24} /></span>
                    </div>
                    <div className="flex flex-col items-center gap-4 mt-6">
                        <ExcelImport />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Layout;
