"use client";

import Report from "@/components/Report";
import UploadModal from "@/components/UploadModal";
import { useAuthStore } from "@/store/authStore";
import { useMovementStore } from "@/store/movementStore";
import { useEffect, useState } from "react";

const page = () => {
    const { user } = useAuthStore()
    const [isModalOpen, setIsModalOpen,] = useState(false);
    const { fetchMovementEntries, entries, addMovementEntry } = useMovementStore()

    useEffect(() => {
        fetchMovementEntries(user?.id)
    }, [])


    const handleImportSuccess = (message: string) => {
        fetchMovementEntries(user?.id);
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
                //@ts-ignore
                addEntry={addMovementEntry}
            />

        </>
    )
}

export default page