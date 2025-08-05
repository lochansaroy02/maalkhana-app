"use client";

import Report from '@/components/Report';
import UploadModal from '@/components/UploadModal';
import { useAuthStore } from '@/store/authStore';
import { useMaalkhanaStore } from '@/store/maalkhanaEntryStore';
import { useEffect, useState } from 'react';

const page = () => {
    const { district } = useAuthStore()
    const [isModalOpen, setIsModalOpen,] = useState(false);
    const { fetchMaalkhanaEntry, entries, addMaalkhanaEntry } = useMaalkhanaStore();
    useEffect(() => {
        fetchMaalkhanaEntry(district?.id)
    }, [])

    const handleImportSuccess = (message: string) => {
        fetchMaalkhanaEntry(district?.id);
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
                addEntry={addMaalkhanaEntry}
            />
        </>
    )
}

export default page