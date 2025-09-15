"use client";

import Report from '@/components/Report';
import { Checkbox } from '@/components/ui/checkbox';
import UploadModal from '@/components/UploadModal';
import { useAuthStore } from '@/store/authStore';
import { useDistrictStore } from '@/store/districtStore';
import { useSearchStore } from '@/store/searchStore';
import { useSeizedVehicleStore } from '@/store/siezed-vehical/seizeStore';
import { useOpenStore } from '@/store/store';
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from 'react';

// Define a type for the data entries to improve type safety
interface SeizedVehicleEntry {
    id?: string;
    firNo: string;
    srNo: string;
    caseProperty: string;
    underSection: string;
    policeStation: string;
    gdNo?: string;
    gdDate?: string;
    Year?: string;
    vadiName?: string;
    isMovement?: boolean;
    moveDate?: string;
    takenOutBy?: string;
    movePurpose?: string;
    moveTrackingNo?: string;
    isRelease?: boolean;
    courtName?: string;
    courtNo?: string;
    receiverName?: string;
    status?: string;
    description?: string;
    isReturned?: boolean;
    returnDate?: string;
    receivedBy?: string;
    returnBackFrom?: string;
    // Add other fields as necessary from your data structure
}

const casePropertyOptions = [
    'mv act', 'arto seized', 'BNS/IPC', 'EXCISE', 'SEIZED', 'UNCLAMMED VEHICLE'
];

// Define a type for the report data and headers
type ReportData = {
    data: any[];
    headers: string[];
};

const Page = () => {
    const { reportType, setReportType } = useOpenStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore()
    const { vehicles, addVehicle, fetchVehicles } = useSeizedVehicleStore();
    const { searchData } = useSearchStore()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaseProperty, setSelectedCaseProperty] = useState<string | null>(null);

    const searchParams = useSearchParams();

    // Set initial report type from URL on component mount
    useEffect(() => {
        const urlReportType = searchParams.get('reportType');
        if (urlReportType && urlReportType !== reportType) {
            setReportType(urlReportType);
        }
    }, [searchParams, reportType, setReportType]);


    // Fetch all vehicle data when the component loads
    useEffect(() => {
        if (user?.role === "policeStation" && user?.id) {
            fetchVehicles(user.id);
        } else if (userId) {
            fetchVehicles(userId);
        }
    }, [user?.id, fetchVehicles, userId, user?.role]);

    // Use useMemo to handle all filtering logic and return both data and headers
    const reportContent: ReportData = useMemo(() => {
        let headers: string[] = [];

        // Apply filters based on the report type
        const applyFilters = () => {
            let dataToShow: SeizedVehicleEntry[] = [...vehicles];

            switch (reportType) {
                case "movement":
                    dataToShow = vehicles.filter(vehicle => vehicle.isMovement === true);
                    headers = ["FIR No", "Sr No", "Case Property", "Under Section", "Police Station", "Move Date", "Taken Out By", "Move Purpose", "Move Tracking No"];
                    break;
                case "release":
                    dataToShow = vehicles.filter(vehicle => vehicle.isRelease === true);
                    headers = ["FIR No", "Sr No", "Case Property", "Court Name", "Court No", "Receiver Name"];
                    break;
                case "destroy":
                    dataToShow = vehicles.filter(vehicle => vehicle.status?.toLowerCase() === 'destroy');
                    headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                    break;
                case "destroy":
                    dataToShow = vehicles.filter(vehicle => vehicle.status?.toLowerCase() === 'nilami');
                    headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                    break;
                case "return":
                    dataToShow = vehicles.filter(vehicle => vehicle.isReturned === true);
                    headers = ["FIR No", "Sr No", "Return Date", "Received By", "Return Back From", "Is Returned"];
                    break;
                default: // 'all' or default view
                    dataToShow = vehicles;
                    headers = ["FIR No", "Sr No", "Case Property", "GD No", "GD Date", "Year", "Police Station", "I O Name", "vadiName"];
                    break;
            }

            // Further filter the result by the selected case property checkbox
            if (selectedCaseProperty) {
                dataToShow = dataToShow.filter(
                    (item) => item.caseProperty?.toLowerCase() === selectedCaseProperty.toLowerCase()
                );
            }

            // Apply search filter if searchData is available
            if (searchData.length > 0) {
                // Assuming searchData is already filtered and formatted correctly
                return { data: searchData, headers: headers };
            }

            return { data: dataToShow, headers: headers };
        };

        return applyFilters();
    }, [reportType, selectedCaseProperty, vehicles, searchData]); // Re-run when a filter or the data changes


    const handleImportSuccess = () => {
        if (user?.id) {
            // Refresh data after a successful import
            fetchVehicles(user.id);
        }
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
                data={reportContent.data}
                // Pass headers dynamically from the useMemo hook
                headers={reportContent.headers}
                heading="Seized Vehicles Report"
                detailsPathPrefix="/report/siezed-report"
            />
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="seizedVehicle"
                onSuccess={handleImportSuccess}
                addEntry={addVehicle as any}
            />
        </>
    );
};

export default Page;