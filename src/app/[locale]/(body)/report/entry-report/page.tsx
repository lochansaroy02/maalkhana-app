// pages/Page.tsx (The Report Page component)
"use client";

import Report from "@/components/Report";
import { Checkbox } from "@/components/ui/checkbox";
import UploadModal from "@/components/UploadModal";
import { useAuthStore } from "@/store/authStore";
import { useDistrictStore } from "@/store/districtStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { useSearchStore } from "@/store/searchStore";
import { useOpenStore } from "@/store/store";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Define a type for the data entries to improve type safety
interface MaalkhanaEntry {
    id?: string;
    firNo: string;
    srNo: string;
    caseProperty: string;
    underSection: string;
    policeStation: string;
    entryType?: string;
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
    boxNo?: string;
    releaseItemName?: string;
    fathersName?: string;
    address?: string;
    receiverName?: string;
    status?: string;
    description?: string;
    isReturned?: boolean;
    returnDate?: string;
    receivedBy?: string;
    returnBackFrom?: string;
}

const casePropertyOptions = [
    "malkhana Entry", "FSL", "Kurki", "Other Entry", "Cash Entry", "Wine/Daru", "Unclaimed Entry",
    "Yellow Item"
];

// Define a type for the report data and headers
type ReportData = {
    data: any[];
    headers: string[];
};

const Page = () => {
    const { reportType, setReportType } = useOpenStore();
    const { user } = useAuthStore();
    const { userId } = useDistrictStore();
    const { entries, fetchMaalkhanaEntry, addMaalkhanaEntry } = useMaalkhanaStore();
    const { year, searchData } = useSearchStore();
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


    // Fetch data on component mount and user/userId changes
    useEffect(() => {
        if (user?.role === "policeStation" && user?.id) {
            fetchMaalkhanaEntry(user.id);
        } else if (userId) {
            fetchMaalkhanaEntry(userId);
        }
    }, [user?.id, fetchMaalkhanaEntry, userId, user?.role]);

    // Helper function to create a new object with only specified fields
    const selectFields = (entries: MaalkhanaEntry[], fields: string[]) => {
        return entries.map((entry) => {
            const newEntryObject: { [key: string]: any } = {};
            fields.forEach(field => {
                if (entry[field as keyof MaalkhanaEntry] !== undefined) {
                    newEntryObject[field] = entry[field as keyof MaalkhanaEntry];
                }
            });
            return newEntryObject;
        });
    };


    // Define all report-related logic within a useMemo hook for performance
    const reportContent: ReportData = useMemo(() => {
        //@ts-ignore
        let filteredData: MaalkhanaEntry[] = [...entries];
        let headers: string[] = [];

        // Apply filters based on the report type and selected case property
        const applyFilters = () => {
            let dataToShow = [...entries];
            console.log(dataToShow);
            // Filter based on reportType
            switch (reportType) {
                case "movement":
                    dataToShow = entries.filter(entry => entry.isMovement);
                    headers = ["FIR No", "Sr No", "Case Property", "Under Section", "Police Station", "Move Date", "Taken Out By", "Move Purpose", "Move Tracking No"];
                    break;
                case "release":
                    dataToShow = entries.filter(entry => entry.isRelease);
                    console.log(dataToShow);
                    headers = ["FIR No", "Sr No", "Case Property", "Under Section", "Court Name", "Court No", "Box No", "Release Date", "Release Item Name", "Father's Name", "Address", "Receiver Name"];
                    break;
                case "destroy":
                    dataToShow = entries.filter(entry => entry.status?.toLowerCase() === 'destroy');
                    headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                    break;
                case "return":
                    dataToShow = entries.filter(entry => entry?.isReturned);
                    headers = ["FIR No", "Sr No", "Status", "Case Property", "Description"];
                    break;
                case "nilami":
                    dataToShow = entries.filter(entry => entry.status?.toLowerCase() === 'nilami');
                    headers = ["FIR No", "Sr No", "status", "Return Date", "Received By", "Return Back From", "Is Returned"];
                    break;
                default:
                    dataToShow = entries;

                    headers = ["FIR No", "Sr No", "Entry Type", "underSection", "Description", "Case Property", "GD No", "GD Date", "Year", "Police Station", "HM", "Vadi Name", "IOName", "box No", "court No", "court Name"];
                    break;
            }

            // Further filter by selected case property
            if (selectedCaseProperty) {
                dataToShow = dataToShow.filter(item => item.entryType?.toLowerCase() === selectedCaseProperty.toLowerCase());
            }

            // Apply year filter
            if (year?.from || year?.to) {
                const fromYear = year.from ? parseInt(year.from, 10) : null;
                const toYear = year.to ? parseInt(year.to, 10) : null;
                dataToShow = dataToShow.filter(item => {
                    const entryYear = item.Year ? parseInt(item.Year) : null;
                    if (!entryYear) return false;
                    if (fromYear && !toYear) {
                        return entryYear === fromYear;
                    }
                    if (fromYear && toYear) {
                        return entryYear >= fromYear && entryYear <= toYear;
                    }
                    if (!fromYear && toYear) {
                        return entryYear <= toYear;
                    }
                    return true;
                });
            }

            // Apply search filter if searchData is available
            if (searchData.length > 0) {
                // Assuming searchData is already filtered and formatted correctly
                return { data: searchData, headers: headers };
            }

            return { data: dataToShow, headers: headers };
        };

        return applyFilters();
    }, [reportType, selectedCaseProperty, entries, year, searchData]);

    const handleImportSuccess = () => {
        if (user?.id) {
            fetchMaalkhanaEntry(user.id);
        }
    };

    return (
        <>
            {/* Filter Section */}
            <div className="p-4 mx-2 glass-effect">
                <div className="flex flex-wrap gap-4 items-center">
                    <h1 className="text-lg font-semibold text-white">Filter by Entry Type:</h1>
                    {casePropertyOptions.map((property) => (
                        <div key={property} className="flex items-center space-x-2">
                            <Checkbox
                                id={`checkbox-${property}`}
                                checked={selectedCaseProperty?.toLowerCase() === property.toLowerCase()}
                                onCheckedChange={(checked) =>
                                    setSelectedCaseProperty(checked ? property : null)
                                }
                            />
                            <label htmlFor={`checkbox-${property}`} className="text-blue-100 capitalize cursor-pointer">{property}</label>
                        </div>
                    ))}
                </div>
            </div>

            <Report
                data={reportContent.data}
                //@ts-ignore
                headers={reportContent.headers}
                onImportClick={() => setIsModalOpen(true)}
                heading="Maalkhana Data"
                detailsPathPrefix="/report/entry-report"
            />

            {/* Upload Modal */}
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schemaType="entry"
                onSuccess={handleImportSuccess}
                addEntry={addMaalkhanaEntry as any}
            />
        </>
    );
};

export default Page;