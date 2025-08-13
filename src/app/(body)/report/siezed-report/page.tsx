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
const fieldsToShow = ['id', 'firNo', 'srNo', 'caseProperty', 'courtName', 'courtNo', 'receiverName'];


const Page = () => {
    const { reportType } = useOpenStore();
    const { user } = useAuthStore();
    const { vehicles, addVehicle, fetchVehicles } = useSeizedVehicleStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null);
    const [displayData, setDisplayData] = useState<any[]>([]);

    // 1. Fetch all vehicle data when the component loads
    useEffect(() => {
        if (user?.id) {
            fetchVehicles(user.id);

        }
    }, [user?.id, fetchVehicles]);


    useEffect(() => {
        selectFields(displayData, fieldsToShow)
    }, [])
    // Helper function to create a new object with only specified fields
    const selectFields = (entries: any[], fields: string[]) => {
        return entries.map((entry) => {
            const newEntryObject: { [key: string]: any } = {};
            fields.forEach(field => {
                if (entry[field] !== undefined) {
                    newEntryObject[field] = entry[field];
                }
            });
            return newEntryObject;
        });
    };

    // Filters for movement entries
    const filterByMovement = (allEntries: any[]) => {
        const fieldsToShow = ["id", 'firNo', 'srNo', 'caseProperty', 'underSection', 'policeStation', 'moveDate', 'takenOutBy', 'movePurpose', 'moveTrackingNo'];
        const movementEntries = allEntries.filter(entry => entry.isMovement === true);
        return selectFields(movementEntries, fieldsToShow);
    };

    // Filters for release entries
    const filterByRelease = (allEntries: any[]) => {
        const fieldsToShow = ['id', 'firNo', 'srNo', 'caseProperty', 'courtName', 'courtNo', 'receiverName'];
        const releaseEntries = allEntries.filter(entry => entry.isRelease === true);
        return selectFields(releaseEntries, fieldsToShow);
    };

    // Filters for destroyed entries
    const filterByDestroy = (allEntries: any[]) => {
        const fieldsToShow = ['id', 'firNo', 'srNo', 'status', 'caseProperty', 'description'];
        const destroyEntries = allEntries.filter(entry => entry.status?.toLowerCase() === 'destroy');
        return selectFields(destroyEntries, fieldsToShow);
    };

    // Filters for returned entries
    const filterByReturn = (allEntries: any[]) => {
        const fieldsToShow = ['id', 'firNo', 'srNo', 'returnDate', 'receivedBy', 'returnBackFrom', 'isReturned'];
        const returnEntries = allEntries.filter(entry => entry.isReturned === true);
        return selectFields(returnEntries, fieldsToShow);
    };


    // 2. Reworked filtering logic to handle all report types
    useEffect(() => {
        let filteredData = [...vehicles]; // Start with all available vehicle entries

        // Step 1: Filter based on the global report type from the dropdown
        if (reportType === "movement") {
            //@ts-ignore
            filteredData = filterByMovement(vehicles);
        } else if (reportType === "release") {
            //@ts-ignore
            filteredData = filterByRelease(vehicles);
        } else if (reportType === "destroy") {
            //@ts-ignore
            filteredData = filterByDestroy(vehicles);
        } else if (reportType === "return") {
            //@ts-ignore
            filteredData = filterByReturn(vehicles);
        }

        // Step 2: Further filter the result by the selected case property checkbox
        if (selectedCaseProperty) {
            filteredData = filteredData.filter(
                (item) => item.caseProperty?.toLowerCase() === selectedCaseProperty.toLowerCase()
            );
        }

        setDisplayData(filteredData);

    }, [reportType, selectedCaseProperty, vehicles]); // Re-run when a filter or the data changes

    const handleImportSuccess = () => {
        if (user?.id) {
            // Refresh data after a successful import
            fetchVehicles(user.id);
        }
    };

    const formatValue = (key: string, value: any) => {
        if (key === "createdAt" || key === "updatedAt" || key === 'gdDate' || key === 'moveDate' || key == 'returnDate') {
            return value ? new Date(value).toLocaleDateString('en-IN') : "-";
        }
        if (key === "isReturned") {
            return value ? "Yes" : "No";
        }
        return value || "-";
    };

    return (
        <>
            <div className="glass-effect my-4 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <h1 className="text-lg font-semibold text-white">Filter by Case Property:</h1>
                    {casePropertyOptions.map((property) => (
                        <div key={property} className="flex items-center space-x-2">
                            <Checkbox
                                id={`checkbox-${property}`}
                                checked={selectedCaseProperty?.toLowerCase() === property.toLowerCase()}
                                onCheckedChange={(checked) =>
                                    setSelectedCaseProperty(checked ? property : null)
                                }
                            />
                            <label htmlFor={`checkbox-${property}`} className="text-blue-100 capitalize cursor-pointer">
                                {property}
                            </label>
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
