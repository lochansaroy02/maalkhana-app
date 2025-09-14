"use client";

import { useSeizedVehicleStore } from "@/store/siezed-vehical/seizeStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function page() {
    const { id } = useParams();
    const { getById } = useSeizedVehicleStore();
    const [data, setData] = useState<any>(null);

    const fieldOrder = [
        { key: "firNo", label: "FIR No" },
        { key: "Year", label: "Year" },
        { key: "srNo", label: "Sr No" },
        { key: "gdNo", label: "G.D. No" },
        { key: "gdDate", label: "G.D. Date" },
        { key: "policeStation", label: "Police Station" },
        { key: "IOName", label: "IO Name" },
        { key: "entryType", label: "Entry Type" },
        { key: "wine", label: "Wine" },
        { key: "cash", label: "Cash" },
        { key: "wineType", label: "Wine Type" },
        { key: "caseProperty", label: "Case Property" },
        { key: "status", label: "Status" },
        { key: "place", label: "Place" },
        { key: "courtNo", label: "Court No" },
        { key: "courtName", label: "Court Name" },
        { key: "boxNo", label: "Box No" },
        { key: "photoUrl", label: "Photo" }
    ];

    const getData = async () => {
        if (id) {
            const response = await getById(id);
            if (response.success) {
                setData(response.data)
            }
        }
    };


    useEffect(() => {
        getData()
    }, [id]);


    return (
        <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
            Siezed vehicles entry will be shown here
        </div>
    );
}