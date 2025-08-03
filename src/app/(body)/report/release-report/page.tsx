"use client";

import Report from '@/components/Report';
import UploadModal from '@/components/UploadModal';
import { useReleaseStore } from '@/store/releaseStore';
import { useEffect, useState } from 'react';

const page = () => {

    const [isModalOpen, setIsModalOpen,] = useState(false);
    const { fetchReleaseEntries, entries, addReleaseEntry } = useReleaseStore()
    useEffect(() => {
        fetchReleaseEntries()
    }, [])

    const handleImportSuccess = (message: string) => {
        fetchReleaseEntries();
    };

    return (
        <>
            <Report
                onImportClick={() => { setIsModalOpen(true) }}
                //@ts-ignore
                data={entries}
                link='/maalkhana-release'
                heading="Maalkhana Release Report" />
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="entry"
                apiEndpoint="/api/seized"
                onSuccess={handleImportSuccess}
                addEntry={addReleaseEntry}
            />
        </>
    )
}

export default page