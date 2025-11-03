"use client";
import InputComponent from "@/components/InputComponent";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useMaalkhanaStore } from "@/store/malkhana/maalkhanaEntryStore";
import { generateBarcodePDF } from "@/utils/generateBarcodePDF";
import { useState } from "react";

// Helper Component for Checkbox Row (Optional, but cleaner)
const CheckboxRow = ({ item, isSelected, onToggle }: {
    item: any, isSelected: any, onToggle: any
}) => (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-white hover:bg-gray-50">
        <label htmlFor={`item-${item.id}`} className=" flex flex-col justify-between cursor-pointer">

            <span className="font-medium text-gray-800">
                FIR No: <span className="font-bold">{item.firNo}</span>
            </span>
            <span className="text-sm text-gray-500">
                Sr No: <span className="font-bold">{item.srNo || 'N/A'}</span>
            </span>
        </label>
        <input
            type="checkbox"
            id={`item-${item.id}`}
            checked={isSelected}
            onChange={() => onToggle(item)}
            className="w-4 h-4 text-maroon bg-gray-100 border-gray-300 rounded focus:ring-maroon"
        />
    </div>
);


const page = () => {
    const [searchQuery, setSearchQuery] = useState("")

    // Main array for items added to the barcode generation list
    const [data, setData] = useState<any[]>([])
    const { user } = useAuthStore()
    const { getByFIR } = useMaalkhanaStore()

    // State to hold multiple search results for selection
    const [multipleResults, setMultipleResults] = useState<any[]>([])
    // State to track which items are checked by the user
    const [selectedItems, setSelectedItems] = useState<any[]>([])


    const handleToggleSelect = (itemToToggle: any) => {
        // Use a unique ID or a combination of properties for identification
        const itemId = itemToToggle.id || `${itemToToggle.firNo}-${itemToToggle.srNo}`;

        setSelectedItems(prevSelected => {
            // Check if the item is already selected
            const isSelected = prevSelected.some(item => (item.id || `${item.firNo}-${item.srNo}`) === itemId);

            if (isSelected) {
                // Remove item
                return prevSelected.filter(item => (item.id || `${item.firNo}-${item.srNo}`) !== itemId);
            } else {
                // Add item
                return [...prevSelected, itemToToggle];
            }
        });
    }

    const handleAddSelected = () => {
        if (selectedItems.length > 0) {
            // 1. Add selected items to the main data array
            // Check for duplicates before adding
            const newItems = selectedItems.filter(sItem =>
                !data.some(dItem => (dItem.id || `${dItem.firNo}-${dItem.srNo}`) === (sItem.id || `${sItem.firNo}-${sItem.srNo}`))
            );

            setData((prev: any[]) => [...prev, ...newItems]);

            // 2. Reset the selection process
            setMultipleResults([]);
            setSelectedItems([]);
        }
    }


    const handleGet = async () => {
        // Clear previous results/selection states when a new search starts
        setMultipleResults([]);
        setSelectedItems([]);

        try {
            const response = await getByFIR(searchQuery, user?.id)
            const responseData = response.data

            if (Array.isArray(responseData) && responseData.length > 0) {
                if (response.success) {
                    if (responseData.length === 1) {
                        // Case 1: Only one result, add directly to main data
                        // Check for duplicates first!
                        const sItem = responseData[0];
                        const itemId = sItem.id || `${sItem.firNo}-${sItem.srNo}`;

                        const isDuplicate = data.some(dItem => (dItem.id || `${dItem.firNo}-${dItem.srNo}`) === itemId);

                        if (!isDuplicate) {
                            setData((prev: any[]) => [...prev, ...responseData])
                        }
                        setSearchQuery("")

                    } else {
                        // Case 2: Multiple results, show selection screen
                        setMultipleResults(responseData);
                        setSearchQuery(searchQuery); // Keep FIR No for context if needed
                    }
                }
            } else {
                console.log("No data found or data structure is unexpected.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Console log for debugging
    // console.log("Main Data:", data);
    // console.log("Multiple Results:", multipleResults);
    // console.log("Selected Items:", selectedItems);




    const handleGenerateBarcodes = async () => {
        console.log(data);

        const year = {
            from: "",
            to: ""
        }
        await generateBarcodePDF(data, "m", year, user?.policeStation,);

    }
    return (
        <div className='h-screen w-full glass-effect flex flex-col items-center'>
            <div className='bg-maroon w-full py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Generate Barcodes</h1>
            </div>

            <div className='w-3/4 flex pt-8 flex-col items-center'>

                <div id='inputbox and button' className="flex gap-2 items-center">
                    <InputComponent
                        isLabel={false}
                        value={searchQuery}
                        label=" firNo"
                        setInput={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button onClick={handleGet} >Search and Add</Button>
                </div>

                {/* AREA FOR MULTIPLE SELECTION */}
                {multipleResults.length > 0 && (
                    <div id="selection-area" className="mt-6 p-4 border border-blue-100/20 rounded-lg w-full max-w-md bg-blue">
                        <h2 className="text-lg font-semibold  text-blue-100 mb-3">
                            Multiple Entries Found for
                            <span className="font-bold">{searchQuery}</span>
                        </h2>
                        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                            {multipleResults.map((item, index) => (
                                <CheckboxRow
                                    key={item.id || index}
                                    item={item}
                                    isSelected={selectedItems.some(sItem => (sItem.id || `${sItem.firNo}-${sItem.srNo}`) === (item.id || `${item.firNo}-${item.srNo}`))}
                                    onToggle={handleToggleSelect}
                                />
                            ))}
                        </div>
                        <Button
                            onClick={handleAddSelected}
                            disabled={selectedItems.length === 0}
                            className="w-full mt-3 bg-maroon text-white hover:bg-red-700"
                        >
                            Add Selected Items ({selectedItems.length})
                        </Button>
                    </div>
                )}

                {/* LIST OF ADDED ITEMS */}
                <h3 className="mt-8 text-xl font-semibold text-gray-700">
                    Items for Barcode Generation ({data.length})
                </h3>
                <div id='row area' className="mt-2 w-full max-w-md border border-gray-300 rounded-md glass-effect shadow-md">
                    {data.length > 0 ? (
                        data.map((item: any, index: number) => (
                            // Ensure key is unique
                            <div key={item.id || index} className="p-3 border-b border-gray-100 flex justify-between items-center last:border-b-0">
                                <span className="text-blue-100 font-medium">
                                    FIR: <span className="font-bold">{item.firNo}</span>
                                </span>
                                <span className="text-sm text-blue-200">
                                    Sr No: {item.srNo || 'N/A'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-blue-100 italic">
                            No items added yet. Search by FIR No to begin.
                        </p>
                    )}
                </div>


                <div id='button area' className="mt-6">
                    <Button
                        onClick={handleGenerateBarcodes}
                        disabled={data.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Generate Barcodes for {data.length} Items
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default page