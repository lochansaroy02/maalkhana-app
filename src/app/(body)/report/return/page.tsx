"use client";

import Report from '@/components/Report';
import UploadModal from '@/components/UploadModal';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useEffect, useState } from 'react';

const page = () => {


    const { user, } = useAuthStore()
    const [isModalOpen, setIsModalOpen,] = useState(false);
    const [data, setData] = useState([]);


    useEffect(() => {
        getData()
    }, [])



    const getData = async () => {
        try {
            const response = await axios.get(`/api/return?userId=${user?.id}`)
            const data = response.data;
            console.log(data.data);
            setData(data.data);

        } catch (error) {
            console.error("No data found", error)

        }

    }
    const handleImportSuccess = (message: string) => {
        getData();
    };

    return (
        <>
            <Report
                //@ts-ignore
                data={data}
                onImportClick={() => setIsModalOpen(true)}
                link='/maalkhana-entry'
                heading='Return entries' />
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="entry"
                onSuccess={handleImportSuccess}
                //@ts-ignore
                addEntry={getData}
            />
        </>
    )
}

export default page