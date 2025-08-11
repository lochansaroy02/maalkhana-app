"use client";

import Report from '@/components/Report';
import { Checkbox } from '@/components/ui/checkbox';
import UploadModal from '@/components/UploadModal';
import { useAuthStore } from '@/store/authStore';
import { useSeizedVehicleStore } from '@/store/siezed-vehical/seizeStore';
import { useOpenStore } from '@/store/store';
import { useEffect, useState } from 'react';

const casePropertyOptions = [
    'mv act', 'arto seized', 'BNS/IPC', 'EXCISE', 'SEIZED', 'UNCLAMMED VEHICLE'
];

const Page = () => {
    const { reportType } = useOpenStore();
    const { user } = useAuthStore();
    const { vehicles, vehicleMovements, vehicleReleases, addVehicle, fetchVehicles } = useSeizedVehicleStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null);
    const [displayData, setDisplayData] = useState<any[]>([]);

    // REMOVED the data fetching useEffect from here.

    useEffect(() => {
        let sourceData = [];

        if (reportType === 'movement') {
            sourceData = vehicleMovements || [];
        } else if (reportType === 'release') {
            sourceData = vehicleReleases || [];
        } else {
            sourceData = vehicles;
        }

        if (selectedCaseProperty) {
            const filtered = sourceData.filter(
                (item: any) => item.caseProperty?.toLowerCase() === selectedCaseProperty.toLowerCase()
            );
            setDisplayData(filtered);
        } else {
            setDisplayData(sourceData);
        }
    }, [reportType, selectedCaseProperty, vehicles, vehicleMovements, vehicleReleases]);

    const handleImportSuccess = () => {
        if (user?.id) fetchVehicles(user.id);
    };

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
                data={displayData}
                heading="Seized Vehicles Report"
                detailsPathPrefix="/report/siezed-report"
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