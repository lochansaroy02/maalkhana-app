"use client";

import ExcelImport from '@/components/ExcelImport';
import Modal from '@/components/Modal';
import ReportHeader from '@/components/ReportHeader';
import { useAuthStore } from '@/store/authStore';
import { useMaalkhanaStore } from '@/store/malkhana/maalkhanaEntryStore';
import { useSeizedVehicleStore } from '@/store/siezed-vehical/seizeStore';
import { useOpenStore } from '@/store/store';
import { X } from 'lucide-react';
import React, { useEffect } from 'react'; // Import useEffect

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const { isOpen, setIsOpen } = useOpenStore();
    const { user } = useAuthStore();

    // Get the fetch functions from your stores
    const { fetchMaalkhanaEntry, fetchMovementData } = useMaalkhanaStore();
    const { fetchVehicles } = useSeizedVehicleStore();

    // This useEffect will run ONCE when the user enters the /report section
    useEffect(() => {
        if (user?.id) {
            // Fetch all data needed for all report tabs
            fetchMaalkhanaEntry(user.id);
            fetchMovementData(user.id);
            fetchVehicles(user.id);
            // Add any other fetch calls for release data, etc. here
        }
    }, [user?.id, fetchMaalkhanaEntry, fetchMovementData, fetchVehicles]); // Dependencies ensure it runs only once

    return (
        <div className='relative  glass-effect'>
            {/* Header */}
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Reports</h1>
            </div>

            {/* Sub Header */}
            <ReportHeader />


            {children}


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