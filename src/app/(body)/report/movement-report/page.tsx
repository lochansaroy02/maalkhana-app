"use client";

import Report from "@/components/Report";
import { Checkbox } from "@/components/ui/checkbox";
import UploadModal from "@/components/UploadModal";
import { useAuthStore } from "@/store/authStore";
import { useMovementStore } from "@/store/movementStore";
import { useEffect, useState } from "react";

const page = () => {
    const { user } = useAuthStore()
    const [isModalOpen, setIsModalOpen,] = useState(false);
    const { fetchMovementEntries, entries, addMovementEntry } = useMovementStore()
    const [isReturn, setIsReturn] = useState();
    const [type, selectType] = useState("");

    useEffect(() => {
        fetchMovementEntries(user?.id)
    }, [])

    const handleImportSuccess = (message: string) => {
        fetchMovementEntries(user?.id);
    };

    const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null);

    const casePropertyOptions = [
        'mv act',
        'arto seized',
        'BNS/IPC',
        'EXCISE',
        'SEIZED',
        'UNCLAMMED VEHICLE',
    ];



    return (
        <>

            <div className="glass-effect my-4 p-4 ">
                <div className="flex flex-wrap gap-4 items-center">
                    <h1 className="text-lg font-semibold text-white">Filter by Case Property:</h1>
                    {casePropertyOptions.map((property) => (
                        <div>

                            <div key={property} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={selectedCaseProperty?.toLowerCase() === property.toLowerCase()}
                                    onCheckedChange={(checked) =>
                                        setSelectedCaseProperty(checked ? property : null)
                                    }
                                />
                                <label className="text-blue-100 capitalize">{property}</label>
                            </div>
                            <div>




                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <Checkbox />
                    <label htmlFor="">is Return</label>

                </div>
            </div>
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