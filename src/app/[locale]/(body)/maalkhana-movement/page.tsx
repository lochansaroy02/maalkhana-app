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
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const Page: React.FC = () => {
    // i18n: Initialize translation hook from next-intl
    const t = useTranslations('malkhanaMovementForm');

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
        setSelectedResultId(id);
        setFormData({
            srNo: entryData.srNo ?? "", name: entryData.name ?? "", firNo: entryData.firNo ?? "", underSection: entryData.underSection ?? "", takenOutBy: entryData.takenOutBy ?? "", moveTrackingNo: entryData.moveTrackingNo ?? "", movePurpose: entryData.movePurpose ?? "", receivedBy: entryData.receivedBy ?? "",
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
        setIsLoading(false); setIsFetching(false); setExistingEntryId(null); setType(''); setSearchFirNo(''); setSearchSrNo(''); setSearchResults([]); setSelectedResultId('');
        setFormData({ srNo: "", name: "", moveDate: "", policeStation: "", firNo: "", underSection: "", takenOutBy: "", moveTrackingNo: "", movePurpose: "", receivedBy: "", returnDate: "", });
        setDateFields({ moveDate: new Date(), returnDate: new Date() });
        setReturnBackFrom(""); setCaseProperty(""); setIsReturned(false);
        if (photoRef.current) photoRef.current.value = "";
        if (documentRef.current) documentRef.current.value = "";
    };


    useEffect(() => {
        if (entry && !Array.isArray(entry) && Object.keys(entry).length > 0) {
            fillForm(entry);
        }
    }, [entry]);

    const getByFir = async () => {
        if (!type) return toast.error(t('toasts.selectType'));
        if (!searchFirNo && !searchSrNo) return toast.error(t('toasts.enterFirOrSr'));

        setIsFetching(true);
        setSearchResults([]);
        setExistingEntryId(null);
        setSelectedResultId('');

        try {
            const data = await fetchByFIR(user?.id, type, searchFirNo, searchSrNo);

            if (data && data.length > 0) {
                if (data.length > 1) {
                    // Multiple records found, show radio buttons
                    setSearchResults(data);
                    toast.success(t('toasts.recordsFound', { count: data.length }));
                } else {
                    // Exactly one record found, fill the form directly
                    fillForm(data[0]);
                    toast.success(t('toasts.fetchSuccess'));
                }
            } else {
                // No records found
                toast.error(t('toasts.noRecord'));
            }
        } catch (error) {
            console.error("Error fetching by FIR:", error);
            toast.error(t('toasts.fetchFailed'));
        } finally {
            setIsFetching(false);
        }
    };

    const handleResultSelectionChange = (resultId: string) => {
        setSelectedResultId(resultId);
        const selectedData = searchResults.find(item => (item.id || item._id) === resultId);
        if (selectedData) fillForm(selectedData);
    };

    const handleSave = async () => {
        if (!existingEntryId) return toast.error(t('toasts.noEntrySelected'));
        setIsLoading(true);
        try {
            const photoUrl = photoRef.current?.files?.[0] ? await uploadToCloudinary(photoRef.current.files[0]) : undefined;
            const documentUrl = documentRef.current?.files?.[0] ? await uploadToCloudinary(documentRef.current.files[0]) : undefined;

            const fullData = {
                ...formData, moveDate: dateFields.moveDate.toISOString(), returnDate: dateFields.returnDate.toISOString(), returnBackFrom, documentUrl, photoUrl, isReturned, caseProperty, isMovement: true,
            };

            const success = (type === "malkhana")
                ? await updateMovementEntry(existingEntryId, fullData)
                : (type === "seizedVehicle")
                    ? await updateVehicalEntry(existingEntryId, fullData)
                    : false;

            if (success) {
                toast.success(t('toasts.updateSuccess'));
                resetAll();
            } else {
                toast.error(t('toasts.updateFailed'));
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error(t('toasts.saveFailed'));
        } finally {

            setIsLoading(false);

        }
    };

    const fields = [
        { name: "underSection", label: t('labels.underSection') },
        { name: "name", label: t('labels.name') },
        { name: "moveDate", label: t('labels.moveDate'), type: "date" },
        { name: "takenOutBy", label: t('labels.takenOutBy') },
        { name: "moveTrackingNo", label: t('labels.moveTrackingNo') },
        { name: "movePurpose", label: t('labels.movePurpose') },
        { name: "returnDate", label: t('labels.returnDate'), type: "date" },
        { name: "returnBackFrom", label: t('labels.returnBackFrom') },
        { name: "receivedBy", label: t('labels.receivedBy') },
    ];

    const typeOptions = Object.keys(t.raw('options.type')).map(key => ({
        value: key,
        label: t(`options.type.${key}`)
    }));

    const returnBackOptions = Object.keys(t.raw('options.returnFrom')).map(key => ({
        value: key,
        label: t(`options.returnFrom.${key}`)
    }));

    const inputFields = [
        { label: t('labels.uploadPhoto'), id: "photo", ref: photoRef },
        { label: t('labels.uploadDocument'), id: "document", ref: documentRef },
    ];

    return (
        <div>
            <div className="glass-effect">
                <div className="bg-maroon rounded-t-xl py-4 border-b border-white/50 flex justify-center">
                    <h1 className="text-2xl uppercase text-cream font-semibold">{t('title')}</h1>
                </div>
                <div className="px-8 py-4 rounded-b-md">
                    <div className='w-1/2  items-center gap-4 flex justify-center mb-4'>
                        <label className="text-blue-100 font-semibold text-nowrap">{t('labels.selectType')}</label>
                        <DropDown selectedValue={type} handleSelect={setType} options={typeOptions} />
                    </div>
                    <hr className="border-gray-600 my-4" />
                    <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end'>
                        <InputComponent label={t('labels.firNo')} value={searchFirNo} setInput={(e) => setSearchFirNo(e.target.value)} />
                        <InputComponent label={t('labels.orSrNo')} value={searchSrNo} setInput={(e) => setSearchSrNo(e.target.value)} />
                        <div className="md:col-span-2 flex justify-center">
                            <Button onClick={getByFir} className='bg-blue-600 w-1/2' disabled={isFetching || !type}>
                                {isFetching ? <LoaderIcon className='animate-spin' /> : t('buttons.fetchRecord')}
                            </Button>
                        </div>
                    </div>

                    {searchResults.length > 1 && (
                        <div className="my-4 col-span-2 flex flex-col gap-1">
                            <label className='text-blue-100'>{t('labels.multipleRecords')}</label>
                            <div className="glass-effect p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-3">
                                {searchResults.map((item: any) => (
                                    <div key={item.id || item._id} className="flex items-center gap-2">
                                        <input type="radio" id={`result-${item.id || item._id}`} name="resultSelection" className="form-radio h-4 w-4" checked={selectedResultId === (item.id || item._id)} onChange={() => handleResultSelectionChange(item.id || item._id)} />
                                        <label htmlFor={`result-${item.id || item._id}`} className="text-blue-100 cursor-pointer">{t('placeholders.srNo', { srNo: item.srNo })}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {existingEntryId && (
                        <>
                            <hr className="border-gray-600 my-6" />
                            <h2 className="text-xl text-center text-cream font-semibold mb-4">{t('labels.updateDetails')}</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <InputComponent label={t('labels.caseProperty')} value={caseProperty} disabled />
                                <div className="flex items-center space-x-2 pt-8">
                                    <Checkbox id="isReturnedCheck" checked={isReturned} onCheckedChange={(checked) => setIsReturned(!!checked)} />
                                    <label htmlFor="isReturnedCheck" className="text-blue-100">{t('labels.isReturned')}</label>
                                </div>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-4">
                                {fields.map((field) => {
                                    const fieldsToHideWhenNotReturned = ['receivedBy', 'returnBackFrom', 'returnDate'];
                                    const fieldsToHideWhenReturned = ['moveTrackingNo', 'takenOutBy', 'movePurpose', 'moveDate'];

                                    if (!isReturned && fieldsToHideWhenNotReturned.includes(field.name)) return null;
                                    if (isReturned && fieldsToHideWhenReturned.includes(field.name)) return null;

                                    if (['underSection',].includes(field.name)) {
                                        return <InputComponent key={field.name} label={field.label} value={formData[field.name as keyof typeof formData] ?? ""} disabled />;
                                    }
                                    if (field.type === "date") {
                                        return <DatePicker key={field.name} label={field.label} date={dateFields[field.name as "moveDate" | "returnDate"]} setDate={(date) => handleDateChange(field.name as "moveDate" | "returnDate", date)} />;
                                    }
                                    if (field.name === 'returnBackFrom') {
                                        return <DropDown key={field.name} label={t('labels.returnBackFrom')} selectedValue={returnBackFrom} options={returnBackOptions} handleSelect={setReturnBackFrom} />;
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
                                    {isLoading ? <LoaderIcon className="animate-spin" /> : t('buttons.saveMovement')}
                                </Button>
                                <Button onClick={resetAll} className="bg-red-600">{t('buttons.clearForm')}</Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Page;    