"use client";

import { RefObject } from "react";

const DisplayScannedData = ({ selectedRecord, divRef }: { selectedRecord: any, divRef: RefObject<HTMLDivElement> }) => {

    const excludedKeys = [
        "id", "createdAt", "updatedAt", "userId", "districtId", "photoUrl", "document", "documentUrl", "isMovement", "isRelease",
        "wine", "wineType", "address", "fathersName", "isReturned", "mobile", "moveDate", "movePurpose", "moveTrackingNo", "name",
        "photo", "releaseItemName", "returnBackFrom", "returnDate", "takenOutBy", "receivedBy", "receiverName", "cash", "yellowItemPrice", "dbName"
    ];

    const formatKey = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    if (!selectedRecord) {
        return <div className="flex justify-center items-center h-full text-lg text-gray-500">No data available.</div>;
    }

    return (
        <div ref={divRef} className="p-4 bg-white font-sans">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Scanned Record Details</h1>
            <div className="flex flex-col space-y-4">
                {Object.keys(selectedRecord)
                    .filter(key => {
                        const value = selectedRecord[key];
                        return !excludedKeys.includes(key) && (value !== null && value !== "" && value !== 0);
                    })
                    .map(key => (
                        <div key={key} className="flex">
                            <div className="flex-1 text-left text-gray-600 font-medium">{formatKey(key)}</div>
                            <div className="flex-1 text-left text-gray-800">{String(selectedRecord[key])}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default DisplayScannedData;