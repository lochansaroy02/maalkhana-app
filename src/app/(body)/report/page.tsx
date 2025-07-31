"use client";

import Report from '@/components/Report';
import { useSeizedVehicleStore } from '@/utils/store';
import { useEffect } from 'react';


const Page = () => {
    const { vehicles, fetchVehicles } = useSeizedVehicleStore();

    useEffect(() => {
        fetchVehicles();
    }, []);


    return (
        //@ts-ignore
        <Report data={vehicles} heading='Siezed vehicles Report' />
    );
};

export default Page;
