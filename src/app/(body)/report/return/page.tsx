"use client";

import Report from '@/components/Report';
import UploadModal from '@/components/UploadModal';
import { useAuthStore } from '@/store/authStore';
import { useMaalkhanaStore } from '@/store/malkhana/maalkhanaEntryStore';
import { useEffect, useState } from 'react';

const page = () => {
    const { user, } = useAuthStore()
    const [isModalOpen, setIsModalOpen,] = useState(false);
    const { fetchMaalkhanaEntry, entries, addMaalkhanaEntry } = useMaalkhanaStore();
    useEffect(() => {
        fetchMaalkhanaEntry(user?.id)
    }, [])

 
    const handleImportSuccess = (message: string) => {
        fetchMaalkhanaEntry(user?.id);
    };

    return (
        <>
            <Report
                //@ts-ignore
                data={entries}
                onImportClick={() => setIsModalOpen(true)}
                link='/maalkhana-entry'
                heading='Maalkhana Data' />
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="entry"
                onSuccess={handleImportSuccess}
                //@ts-ignore
                addEntry={addMaalkhanaEntry}
            />
        </>
    )
}

export default page