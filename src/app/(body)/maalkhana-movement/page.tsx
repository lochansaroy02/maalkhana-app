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
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

const Page: React.FC = () => {
    const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
    const { user } = useAuthStore();
    const { updateVehicalEntry, addVehicle } = useSeizedVehicleStore()
    const { addMovementEntry, updateMovementEntry, fetchByFIR, entry } = useMovementStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isReturned, setIsReturned] = useState(false);
    const [returnBackFrom, setReturnBackFrom] = useState("");
    const [caseProperty, setCaseProperty] = useState("");
    const [type, setType] = useState<string>("")

    const [formData, setFormData] = useState<Partial<MovementEntry>>({
        srNo: "", name: "", moveDate: "", policeStation: "", firNo: "", underSection: "", takenOutBy: "", moveTrackingNo: "", movePurpose: "", receivedBy: "", returnDate: "",
    });
    const [dateFields, setDateFields] = useState<{ moveDate: Date; returnDate: Date }>({
        moveDate: new Date(), returnDate: new Date(),
    });
    const photoRef = useRef<HTMLInputElement | null>(null);
    const documentRef = useRef<HTMLInputElement | null>(null);
    const handleInputChange = (field: keyof MovementEntry | string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value, }));
    };
    const handleDateChange = (fieldName: "moveDate" | "returnDate", date: Date | undefined) => {
        const actualDate = date ?? new Date();
        setDateFields((prev) => ({ ...prev, [fieldName]: actualDate, }));
        handleInputChange(fieldName, actualDate.toISOString());
    };
    const fields = [
        { name: "firNo", label: "FIR No." },
        { name: "srNo", label: "Sr. No / Mal No." },
        { name: "moveDate", label: "Move Date", type: "date" },
        { name: "underSection", label: "Under Section" },
        { name: "takenOutBy", label: "Taken Out By" },
        { name: "moveTrackingNo", label: "Move Tracking No" },
        { name: "movePurpose", label: "Move Purpose" },
        { name: "policeStation", label: "Police Station" },
        { name: "name", label: "Name" },
        { name: "receivedBy", label: "Received By" },
        { name: "returnDate", label: "Return Back Date", type: "date" },
        { name: "returnBackFrom", label: "Return Back From" }, // Simplified this line
    ];
    const caseOptions = ["Cash Property", "Kukri", "FSL", "Unclaimed", "Other Entry", "Cash Entry", "Wine", "MV Act", "ARTO", "BNS / IPC", "Excise Vehicle", "Unclaimed Vehicle", "Seizure Entry",];
    const returnBackOptions = ["Court", "FSL", "Other"];
    const inputFields = [{ label: "Upload Photo", id: "photo", ref: photoRef }, { label: "Upload Document", id: "document", ref: documentRef },];
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const photoFile = photoRef.current?.files?.[0];
            const documentFile = documentRef.current?.files?.[0];
            let photoUrl = "";
            let documentUrl = "";
            if (photoFile) photoUrl = await uploadToCloudinary(photoFile);
            if (documentFile) documentUrl = await uploadToCloudinary(documentFile);
            const userId = user?.id ?? undefined;
            const fullData: MovementEntry = {
                srNo: formData.srNo ?? "", name: formData.name ?? "", moveDate: dateFields.moveDate.toISOString(), returnDate: dateFields.returnDate.toISOString(), returnBackFrom, firNo: formData.firNo ?? "", underSection: formData.underSection ?? "", receivedBy: formData.receivedBy ?? "", takenOutBy: formData.takenOutBy ?? "", moveTrackingNo: formData.moveTrackingNo ?? "", movePurpose: formData.movePurpose ?? "", documentUrl, photoUrl, isReturned, caseProperty,
            };
            let success = false;
            if (type === "malkhana") {
                if (existingEntryId) {
                    success = await updateMovementEntry(existingEntryId, fullData);
                    toast.success("data updated")
                } else {
                    const dataWithUserId = { userId, ...fullData }
                    success = await addMovementEntry(dataWithUserId);
                    toast.success("Data Added")
                }
            }
            if (type === "siezed vehical") {
                if (existingEntryId) {
                    success = await updateVehicalEntry(existingEntryId, fullData);
                } else {
                    const dataWithUserId = { fullData }
                    success = await addVehicle(dataWithUserId);
                }
            }
            if (success) {
                toast.success(existingEntryId ? "Data Updated" : "Data Added");
                setFormData({ srNo: "", name: "", moveDate: "", underSection: "", takenOutBy: "", moveTrackingNo: "", movePurpose: "", receivedBy: "", returnDate: "", });
                setDateFields({ moveDate: new Date(), returnDate: new Date() });
                setReturnBackFrom("");
                setCaseProperty("");
                setIsReturned(false);
                setExistingEntryId(null);
                if (photoRef.current) photoRef.current.value = "";
                if (documentRef.current) documentRef.current.value = "";
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Save failed. See console for details.");
        } finally {
            setIsLoading(false);
        }
    };
    const getByFir = async () => {
        try {
            let success = false;
            if (formData.firNo) {
                success = await fetchByFIR(type, formData.firNo);
            }
            if (!success && formData.srNo) {
                success = await fetchByFIR(type, undefined, formData.srNo);
            }
            if (success && entry) {
                console.log(entry)
                const id = (entry as any)._id ?? (entry as any).id;
                setExistingEntryId(id);
                fillForm(entry)
            }
        } catch (error) {
            console.error("Error fetching by FIR:", error);
            toast.error("Fetch failed. See con  sole.");
        }
    };
    function fillForm(entryData: any) {
        const id = entryData._id ?? entryData.id;
        setExistingEntryId(id);
        setFormData({ srNo: entryData.srNo, name: entryData.name, moveDate: entryData.moveDate, firNo: entryData.firNo, underSection: entryData.underSection, takenOutBy: entryData.takenOutBy, moveTrackingNo: entryData.moveTrackingNo, movePurpose: entryData.movePurpose, receivedBy: entryData.receivedBy, returnDate: entryData.returnDate, caseProperty: entryData.caseProperty });
        setCaseProperty(entryData.caseProperty ?? "");
        setReturnBackFrom(entryData.returnBackFrom ?? "");
        setIsReturned(!!entryData.isReturned);
        setDateFields({
            moveDate: entryData.moveDate ? new Date(entryData.moveDate) : new Date(), returnDate: entryData.returnDate ? new Date(entryData.returnDate) : new Date(),
        });
    }

    return (
        <div>
            <div className="glass-effect">
                <div className="bg-maroon rounded-t-xl py-4 border-b border-white/50 flex justify-center">
                    <h1 className="text-2xl uppercase text-cream font-semibold">Malkhana Movement</h1>
                </div>
                <div className="w-full  items-center gap-4  flex justify-center ">
                    <label className="text-blue-100 text-nowrap" htmlFor="">Select type</label>
                    <DropDown selectedValue={type} handleSelect={setType} options={["malkhana", "siezed vehical"]} />
                </div>
                <div className="px-8 py-4 rounded-b-md">
                    <div className="grid grid-cols-2 gap-12">
                        <InputComponent label="Case Property" value={caseProperty} setInput={(e) => setCaseProperty(e.target.value)} />
                        <div className="flex items-center space-x-2">
                            <Checkbox checked={isReturned} onCheckedChange={(checked) => setIsReturned(!!checked)} />
                            <label className="text-blue-100">Returned</label>
                        </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-4">
                        {fields.map((field) => {
                            // ✅ CORRECTED LOGIC: Group fields to hide into arrays for cleaner logic.
                            const fieldsToHideWhenNotReturned = ['receivedBy', 'returnBackFrom', 'returnDate'];
                            const fieldsToHideWhenReturned = ['moveTrackingNo', 'takenOutBy'];

                            // Hide certain fields if the item is NOT returned
                            if (!isReturned && fieldsToHideWhenNotReturned.includes(field.name)) {
                                return null;
                            }

                            // Hide other fields if the item IS returned
                            if (isReturned && fieldsToHideWhenReturned.includes(field.name)) {
                                return null;
                            }

                            const shouldShowBesideSrNo = type === "siezed vehical" && (caseProperty === "Unclaimed" || caseProperty === "MV Act" || caseProperty === "Unclaimed Vehicle");

                            if (field.type === "date") {
                                return (
                                    <DatePicker
                                        key={field.name}
                                        label={field.label}
                                        date={dateFields[field.name as "moveDate" | "returnDate"]}
                                        setDate={(date) => handleDateChange(field.name as "moveDate" | "returnDate", date)}
                                    />
                                );
                            }

                            if (field.name === 'returnBackFrom') {
                                return <DropDown key={field.name} label="Return Back From" selectedValue={returnBackFrom} options={returnBackOptions} handleSelect={setReturnBackFrom} />
                            }

                            if (shouldShowBesideSrNo && field.name === "srNo") {
                                return (
                                    <div key={field.name} className="flex items-end justify-between">
                                        <InputComponent
                                            className="w-3/4"
                                            label={field.label}
                                            value={formData[field.name as keyof typeof formData] ?? ""}
                                            setInput={(e: any) => handleInputChange(field.name, e.target.value)}
                                        />
                                        <Button type="button" className="h-10 bg-blue text-white" onClick={getByFir}>Fetch Data</Button>
                                    </div>
                                );
                            }

                            if (!shouldShowBesideSrNo && field.name === "firNo") {
                                return (
                                    <div key={field.name} className="flex items-end justify-between">
                                        <InputComponent
                                            className="w-3/4"
                                            label={field.label}
                                            value={formData[field.name as keyof typeof formData] ?? ""}
                                            setInput={(e: any) => handleInputChange(field.name, e.target.value)}
                                        />
                                        <Button type="button" className="h-10 bg-blue text-white" onClick={getByFir}>Fetch Data</Button>
                                    </div>
                                );
                            }
                            return (
                                <InputComponent
                                    key={field.name}
                                    label={field.label}
                                    value={formData[field.name as keyof typeof formData] ?? ""}
                                    setInput={(e: any) => handleInputChange(field.name, e.target.value)}
                                />
                            );
                        })}

                        {inputFields.map((item, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <label className="text-blue-100">{item.label}</label>
                                <input ref={item.ref} className="text-blue-100 rounded-xl glass-effect px-2 py-1" id={item.id} type="file" />
                            </div>
                        ))}
                    </div>

                    <div className="flex w-full px-12 justify-between mt-4">
                        {["Save", "Print", "Modify", "Delete"].map((item, index) => (
                            <Button
                                key={index}
                                onClick={() => (item === "Save" ? handleSave() : console.log(`${item} clicked`))}
                                className="bg-blue border border-white/50 text-blue-50"
                            >
                                {isLoading && item === "Save" ? "Saving..." : item}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;