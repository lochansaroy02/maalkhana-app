"use client";

import Report from '@/components/Report';
import { Checkbox } from '@/components/ui/checkbox';
import UploadModal from '@/components/UploadModal';
import { useAuthStore } from '@/store/authStore';
import { useSeizedVehicleStore } from '@/store/seizeStore';
import { useEffect, useState } from 'react';

const casePropertyOptions = [
    'mv act',
    'arto seized',
    'BNS/IPC',
    'EXCISE',
    'SEIZED',
    'UNCLAMMED VEHICLE'
];

const Page = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null);
    const [data, setData] = useState<any[]>([]);
    const { user } = useAuthStore()
    const { vehicles, fetchVehicles, addVehicle } = useSeizedVehicleStore();

    useEffect(() => {
        fetchVehicles(user?.id);
    }, []);

    useEffect(() => {
        if (selectedCaseProperty) {
            const filtered = vehicles.filter(
                (item) => item.caseProperty?.toLowerCase() === selectedCaseProperty.toLowerCase()
            );
            setData(filtered);
        } else {
            setData(vehicles);
        }
    }, [selectedCaseProperty, vehicles]);

    const handleImportSuccess = () => {
        fetchVehicles(user?.id);
    };
    console.log(user?.id);
    return (
        <>
            <div className="glass-effect my-4 p-4 ">
                <div className="flex flex-wrap gap-4 items-center">
                    <h1 className="text-lg font-semibold text-white">Filter by Case Property:</h1>
                    {casePropertyOptions.map((property) => (
                        <div key={property} className="flex items-center space-x-2">
                            <Checkbox
                                checked={selectedCaseProperty?.toLowerCase() === property.toLowerCase()}
                                onCheckedChange={(checked) =>
                                    setSelectedCaseProperty(checked ? property : null)
                                }
                            />
                            <label className="text-blue-100 capitalize">{property}</label>
                        </div>
                    ))}
                </div>
            </div>

            <Report
                onImportClick={() => setIsModalOpen(true)}
                data={data}
                link="/seized-vehical"
                heading="Seized Vehicles Report"
            />

            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="seizedVehicle"
                onSuccess={handleImportSuccess}
                //@ts-ignore
                addEntry={addVehicle}
            />
        </>
    );
};

export default Page;
