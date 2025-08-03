"use client";

import Report from '@/components/Report';
import UploadModal from '@/components/UploadModal';
import { useSeizedVehicleStore } from '@/store/seizeStore';
import { useEffect, useState } from 'react';


const Page = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { vehicles, fetchVehicles, addVehicle } = useSeizedVehicleStore();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleImportSuccess = (message: string) => {
     
        fetchVehicles();
    };

    return (
        <>
            <Report
                onImportClick={() => setIsModalOpen(true)}
                //@ts-ignore
                data={vehicles}
                link='/seized-vehical'
                heading='Siezed vehicles Report' />
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="seizedVehicle"
                apiEndpoint="/api/seized"
                onSuccess={handleImportSuccess}
                addEntry={addVehicle}
            />
        </>
    );
};

export default Page;
