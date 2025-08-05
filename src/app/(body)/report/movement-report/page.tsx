"use client";

import Report from "@/components/Report";
import UploadModal from "@/components/UploadModal";
import { useAuthStore } from "@/store/authStore";
import { useMovementStore } from "@/store/movementStore";
import { useEffect, useState } from "react";

const page = () => {
    const { district } = useAuthStore()
    const [isModalOpen, setIsModalOpen,] = useState(false);
    const { fetchMovementEntries, entries, addMovementEntry } = useMovementStore()

    useEffect(() => {
        fetchMovementEntries(district?.id)
    }, [])
    console.log(entries)

    const handleImportSuccess = (message: string) => {
        fetchMovementEntries(district?.id);
    };







    return (
        <>
            <Report
                //@ts-ignore
                data={entries} link="/maalkhana-movement" heading="Maalkhana Movement Report" onImportClick={() => setIsModalOpen(true)} />
            <UploadModal
                schemaType="movement"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleImportSuccess}
                addEntry={addMovementEntry}
            />

        </>
    )
}

export default page