"use client";

import Report from '@/components/Report';
import UploadModal from '@/components/UploadModal';
import { useAuthStore } from '@/store/authStore';
import { useReleaseStore } from '@/store/releaseStore';
import { useEffect, useState } from 'react';

const page = () => {
    const { user } = useAuthStore()
    const [isModalOpen, setIsModalOpen,] = useState(false);
    const { fetchReleaseEntries, entries, addReleaseEntry } = useReleaseStore()

    useEffect(() => {
        fetchReleaseEntries(user?.id)
    }, [])


    const handleImportSuccess = (message: string) => {
        fetchReleaseEntries(user?.id);
    };

    return (
        <>
            <Report
                onImportClick={() => { setIsModalOpen(true) }}
                //@ts-ignore
                data={entries}

                //@ts-ignore
                link='/maalkhana-release'
                heading="Maalkhana Release Report" />
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="release"
                onSuccess={handleImportSuccess}
                //@ts-ignore
                addEntry={addReleaseEntry}
            />
        </>
    )
}

export default page