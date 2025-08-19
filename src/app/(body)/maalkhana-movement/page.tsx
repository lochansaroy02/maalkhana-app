"use client";

import InputComponent from "@/components/InputComponent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "@/components/ui/datePicker";
import DropDown from "@/components/ui/DropDown";
import { useAuthStore } from "@/store/authStore";
import type { MovementEntry } from "@/store/movementStore";
import { useMovementStore } from "@/store/movementStore";
import { useSeizedVehicleStore } from "@/store/siezed-vehical/seizeStore";
import { uploadToCloudinary } from "@/utils/uploadToCloudnary";
import { LoaderIcon } from "lucide-react";
// 1. IMPORT useEffect
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const Page: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const { user } = useAuthStore();
    const { updateMovementEntry, fetchByFIR, entry } = useMovementStore();
    const { updateVehicalEntry } = useSeizedVehicleStore();

    // Loading and Page State
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [existingEntryId, setExistingEntryId] = useState<string | null>(null);

    // State for Search and Search Results
    const [type, setType] = useState<string>("");
    const [searchFirNo, setSearchFirNo] = useState("");
    const [searchSrNo, setSearchSrNo] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');

    // State for Form Data
    const [isReturned, setIsReturned] = useState(false);
    const [returnBackFrom, setReturnBackFrom] = useState("");
    const [caseProperty, setCaseProperty] = useState("");
    const [formData, setFormData] = useState<Partial<MovementEntry>>({
        srNo: "", name: "", policeStation: "", firNo: "", underSection: "", takenOutBy: "", moveTrackingNo: "", movePurpose: "", receivedBy: "",
    });
    const [dateFields, setDateFields] = useState<{ moveDate: Date; returnDate: Date }>({
        moveDate: new Date(), returnDate: new Date(),
    });
    const photoRef = useRef<HTMLInputElement | null>(null);
    const documentRef = useRef<HTMLInputElement | null>(null);

    // --- FORM LOGIC ---
    const handleInputChange = (field: keyof MovementEntry | string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (fieldName: "moveDate" | "returnDate", date: Date | undefined) => {
        const actualDate = date ?? new Date();
        setDateFields((prev) => ({ ...prev, [fieldName]: actualDate, }));
        handleInputChange(fieldName, actualDate.toISOString());
    };

    const fillForm = (entryData: any) => {
        if (!entryData || Object.keys(entryData).length === 0) return;

        const id = entryData._id ?? entryData.id;
        setExistingEntryId(id);
        setSelectedResultId(id); // Ensure radio button selection is in sync

        setFormData({
            srNo: entryData.srNo ?? "",
            name: entryData.name ?? "",
            firNo: entryData.firNo ?? "",
            underSection: entryData.underSection ?? "",
            takenOutBy: entryData.takenOutBy ?? "",
            moveTrackingNo: entryData.moveTrackingNo ?? "",
            movePurpose: entryData.movePurpose ?? "",
            receivedBy: entryData.receivedBy ?? "",
            // Keep date fields separate
        });
        setCaseProperty(entryData.caseProperty ?? "");
        setReturnBackFrom(entryData.returnBackFrom ?? "");
        setIsReturned(entryData.isReturned ?? false);
        setDateFields({
            moveDate: entryData.moveDate ? new Date(entryData.moveDate) : new Date(),
            returnDate: entryData.returnDate ? new Date(entryData.returnDate) : new Date(),
        });
    };

    const resetAll = () => {
        setIsLoading(false);
        setIsFetching(false);
        setExistingEntryId(null);
        setType('');
        setSearchFirNo('');
        setSearchSrNo('');
        setSearchResults([]);
        setSelectedResultId('');
        setFormData({ srNo: "", name: "", moveDate: "", policeStation: "", firNo: "", underSection: "", takenOutBy: "", moveTrackingNo: "", movePurpose: "", receivedBy: "", returnDate: "", });
        setDateFields({ moveDate: new Date(), returnDate: new Date() });
        setReturnBackFrom("");
        setCaseProperty("");
        setIsReturned(false);
        if (photoRef.current) photoRef.current.value = "";
        if (documentRef.current) documentRef.current.value = "";
    };

    // --- API & DATA HANDLING ---

    // 2. ADD THIS useEffect TO SYNC FORM WITH STORE DATA
    useEffect(() => {
        // This effect runs whenever 'entry' from the store changes.
        // It populates the form if a single record is fetched.
        if (entry && !Array.isArray(entry) && Object.keys(entry).length > 0) {
            fillForm(entry);
        }
    }, [entry]); // Dependency array: this effect runs only when 'entry' changes

    const getByFir = async () => {
        if (!type) return toast.error("Please select a type first.");
        if (!searchFirNo && !searchSrNo) return toast.error("Please enter an FIR No. or Sr. No.");

        setIsFetching(true);
        setSearchResults([]);
        setExistingEntryId(null);
        setSelectedResultId('');

        try {
            // fetchByFIR updates the 'entry' in the store, which our new useEffect will catch
            const data = await fetchByFIR(type, searchFirNo, searchSrNo);

            if (data) {
                const dataArray = Array.isArray(data) ? data : [data];
                if (dataArray.length > 1) {
                    setSearchResults(dataArray);
                    toast.success(`${dataArray.length} records found. Please select one.`);
                } else if (dataArray.length === 1) {
                    toast.success("Data Fetched Successfully!");
                    // The useEffect will handle the form filling automatically.
                    // No need to call fillForm() here anymore.
                } else {
                    toast.error("No record found.");
                }
            } else {
                toast.error("No record found.");
            }
        } catch (error) {
            console.error("Error fetching by FIR:", error);
            toast.error("Fetch failed. See console.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleResultSelectionChange = (resultId: string) => {
        setSelectedResultId(resultId);
        const selectedData = searchResults.find(item => (item.id || item._id) === resultId);
        if (selectedData) {
            // Manually fill form for multi-choice selection
            fillForm(selectedData);
        }
    };

    const handleSave = async () => {
        if (!existingEntryId) {
            toast.error("No entry selected. Please fetch an entry first.");
            return;
        }
        setIsLoading(true);
        try {
            const photoFile = photoRef.current?.files?.[0];
            const documentFile = documentRef.current?.files?.[0];
            const photoUrl = photoFile ? await uploadToCloudinary(photoFile) : undefined;
            const documentUrl = documentFile ? await uploadToCloudinary(documentFile) : undefined;

            const fullData = {
                ...formData,
                moveDate: dateFields.moveDate.toISOString(),
                returnDate: dateFields.returnDate.toISOString(),
                returnBackFrom,
                documentUrl,
                photoUrl,
                isReturned,
                caseProperty,
                isMovement: true,
            };

            let success = false;
            if (type === "malkhana") {
                success = await updateMovementEntry(existingEntryId, fullData);
            } else if (type === "siezed vehical") {
                success = await updateVehicalEntry(existingEntryId, fullData);
            }

            if (success) {
                toast.success("Movement Data Updated Successfully!");
                resetAll();
            } else {
                toast.error("Failed to update movement data.");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Save failed. An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- FIELD DEFINITIONS & RENDER ---
    const fields = [
        { name: "firNo", label: "FIR No." },
        { name: "srNo", label: "Sr. No / Mal No." },
        { name: "underSection", label: "Under Section" },
        { name: "name", label: "Name" },
        { name: "moveDate", label: "Move Date", type: "date" },
        { name: "takenOutBy", label: "Taken Out By" },
        { name: "moveTrackingNo", label: "Move Tracking No" },
        { name: "movePurpose", label: "Move Purpose" },
        { name: "returnDate", label: "Return Back Date", type: "date" },
        { name: "returnBackFrom", label: "Return Back From" },
        { name: "receivedBy", label: "Received By" },
    ];
    const returnBackOptions = ["Court", "FSL", "Other"];
    const inputFields = [{ label: "Upload Photo", id: "photo", ref: photoRef }, { label: "Upload Document", id: "document", ref: documentRef },];

    return (
        // The JSX remains the same as your original code
        <div>
            <div className="glass-effect">
                <div className="bg-maroon rounded-t-xl py-4 border-b border-white/50 flex justify-center">
                    <h1 className="text-2xl uppercase text-cream font-semibold">Malkhana Movement</h1>
                </div>

                <div className="px-8 py-4 rounded-b-md">
                    <div className='w-full items-center gap-4 flex justify-center mb-4'>
                        <label className="text-blue-100 font-semibold text-nowrap">1. Select Type:</label>
                        <DropDown selectedValue={type} handleSelect={setType} options={["malkhana", "siezed vehical"]} />
                    </div>
                    <hr className="border-gray-600 my-4" />
                    <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end'>
                        <InputComponent label='FIR No.' value={searchFirNo} setInput={(e) => setSearchFirNo(e.target.value)} />
                        <InputComponent label='OR Sr. No / Mal No.' value={searchSrNo} setInput={(e) => setSearchSrNo(e.target.value)} />
                        <div className="md:col-span-2 flex justify-center">
                            <Button onClick={getByFir} className='bg-blue-600 w-1/2' disabled={isFetching || !type}>
                                {isFetching ? <LoaderIcon className='animate-spin' /> : '2. Fetch Record'}
                            </Button>
                        </div>
                    </div>

                    {searchResults.length > 1 && (
                        <div className="my-4 col-span-2 flex flex-col gap-1">
                            <label className='text-blue-100'>Multiple Records Found. Please Select One:</label>
                            <div className="glass-effect p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-3">
                                {searchResults.map((item: any) => (
                                    <div key={item.id || item._id} className="flex items-center gap-2">
                                        <input type="radio" id={`result-${item.id || item._id}`} name="resultSelection" className="form-radio h-4 w-4" checked={selectedResultId === (item.id || item._id)} onChange={() => handleResultSelectionChange(item.id || item._id)} />
                                        <label htmlFor={`result-${item.id || item._id}`} className="text-blue-100 cursor-pointer">{`SR: ${item.srNo}`}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {existingEntryId && (
                        <>
                            <hr className="border-gray-600 my-6" />
                            <h2 className="text-xl text-center text-cream font-semibold mb-4">3. Update Movement Details</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <InputComponent label="Case Property" value={caseProperty} disabled />
                                <div className="flex items-center space-x-2 pt-8">
                                    <Checkbox id="isReturnedCheck" checked={isReturned} onCheckedChange={(checked) => setIsReturned(!!checked)} />
                                    <label htmlFor="isReturnedCheck" className="text-blue-100">Is Item Returned?</label>
                                </div>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-4">
                                {fields.map((field) => {
                                    const fieldsToHideWhenNotReturned = ['receivedBy', 'returnBackFrom', 'returnDate'];
                                    const fieldsToHideWhenReturned = ['moveTrackingNo', 'takenOutBy', 'movePurpose', 'moveDate'];

                                    if (!isReturned && fieldsToHideWhenNotReturned.includes(field.name)) return null;
                                    if (isReturned && fieldsToHideWhenReturned.includes(field.name)) return null;

                                    if (['firNo', 'srNo', 'underSection', 'name'].includes(field.name)) {
                                        return <InputComponent key={field.name} label={field.label} value={formData[field.name as keyof typeof formData] ?? ""} disabled />;
                                    }
                                    if (field.type === "date") {
                                        return <DatePicker key={field.name} label={field.label} date={dateFields[field.name as "moveDate" | "returnDate"]} setDate={(date) => handleDateChange(field.name as "moveDate" | "returnDate", date)} />;
                                    }
                                    if (field.name === 'returnBackFrom') {
                                        return <DropDown key={field.name} label="Return Back From" selectedValue={returnBackFrom} options={returnBackOptions} handleSelect={setReturnBackFrom} />;
                                    }
                                    return <InputComponent key={field.name} label={field.label} value={formData[field.name as keyof typeof formData] ?? ""} setInput={(e: any) => handleInputChange(field.name, e.target.value)} />;
                                })}
                                {inputFields.map((item, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <label className="text-blue-100">{item.label}</label>
                                        <input ref={item.ref} className="text-blue-100 rounded-xl glass-effect px-2 py-1" id={item.id} type="file" />
                                    </div>
                                ))}
                            </div>

                            <div className="flex w-full justify-center items-center gap-4 mt-6">
                                <Button onClick={handleSave} className="bg-green-600" disabled={isLoading}>
                                    {isLoading ? <LoaderIcon className="animate-spin" /> : "4. Save Movement"}
                                </Button>
                                <Button onClick={resetAll} className="bg-red-600">Clear Form</Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Page;