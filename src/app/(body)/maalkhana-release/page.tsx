"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { uploadToCloudinary } from '@/utils/uploadToCloudnary';
import axios from 'axios';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

const Page = () => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [type, setType] = useState<string>("");
    const [existingId, setExistingId] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');
    const [formData, setFormData] = useState({
        firNo: '',
        srNo: '',
        underSection: '',
        releaseItemName: "",
        receiverName: "",
        fathersName: "",
        address: "",
        mobile: "",
    });
    const [caseProperty, setCaseProperty] = useState('');
    const photoRef = useRef<HTMLInputElement>(null);
    const documentRef = useRef<HTMLInputElement>(null);

    // --- FORM LOGIC ---
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const fillForm = (data: any) => {
        if (!data) return;
        const recordId = data.id || data._id;
        setExistingId(recordId);
        setFormData({
            firNo: data.firNo || '',
            srNo: data.srNo || '',
            underSection: data.underSection || '',
            releaseItemName: data.description || data.caseProperty || '',
            receiverName: data.receiverName || "",
            fathersName: data.fathersName || "",
            address: data.address || "",
            mobile: data.mobile || "",
        });
        setCaseProperty(data.caseProperty || '');
    };

    const resetAll = () => {
        setFormData({ firNo: '', srNo: '', underSection: '', releaseItemName: "", receiverName: "", fathersName: "", address: "", mobile: "" });
        setCaseProperty('');
        setExistingId('');
        setType('');
        setSearchResults([]);
        setSelectedResultId('');
        if (photoRef.current) photoRef.current.value = '';
        if (documentRef.current) documentRef.current.value = '';
    };

    // --- API CALLS ---
    const handleGetByFir = async () => {
        if (!type) return toast.error("Please select a type first.");
        if (!formData.firNo && !formData.srNo) return toast.error("Please enter an FIR No. or Sr. No.");

        setIsFetching(true);
        setSearchResults([]);
        setExistingId('');
        setSelectedResultId('');

        try {
            // CHANGE 1: Correct the API endpoint URL
            const url = `/api/release/fir?type=${type}&firNo=${formData.firNo}&srNo=${formData.srNo}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            const data = result.data;

            if (data) {

                const dataArray = Array.isArray(data) ? data : [data];
                if (dataArray.length > 1) {
                    setSearchResults(dataArray);
                    toast.success(`${dataArray.length} records found. Please select one.`);
                } else if (dataArray.length === 1) {
                    const singleRecord = dataArray[0];
                    toast.success("Data Fetched Successfully!");
                    fillForm(singleRecord);
                    setSelectedResultId(singleRecord.id || singleRecord._id);
                } else {
                    toast.error("No record found.");
                }
            } else {
                toast.error("No record found.");
            }
        } catch (error) {
            console.error("Error fetching by FIR:", error);
            toast.error("Fetch failed. Please check the console for details.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async () => {
        if (!existingId) {
            toast.error("Please fetch a valid record before saving.");
            return;
        }
        setIsLoading(true);
        try {
            const photoFile = photoRef.current?.files?.[0];
            const documentFile = documentRef.current?.files?.[0];
            const photoUrl = photoFile ? await uploadToCloudinary(photoFile) : "";
            const documentUrl = documentFile ? await uploadToCloudinary(documentFile) : "";

            const updateData = {
                receiverName: formData.receiverName,
                fathersName: formData.fathersName,
                address: formData.address,
                mobile: formData.mobile,
                releaseItemName: formData.releaseItemName,
                photoUrl,
                documentUrl,
                status: "Released",
                isReturned: true,
                isRelease: true,
            };
            let data;

            if (type === "malkhana" && existingId) {
                const response = await axios.put(`/api/entry?id=${existingId}`, updateData)
                data = response.data

            } if (type === "seized vehicle" && existingId) {
                const response = await axios.put(`/api/siezed?id=${existingId}`, updateData);
                data = response.data

            }

            if (data.success) {
                toast.success("data updated")
                setFormData({
                    address: "",
                    fathersName: "",
                    firNo: '',
                    mobile: "",
                    receiverName: '',
                    releaseItemName: '',
                    srNo: '',
                    underSection: ""
                })
            }

        } catch (error) {
            console.error('Error saving release info:', error);
            toast.error("An error occurred during save.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultSelectionChange = (resultId: string) => {
        setSelectedResultId(resultId);
        const selectedData = searchResults.find(item => (item.id || item._id) === resultId);
        if (selectedData) {
            fillForm(selectedData);
        }
    };

    const fields = [
        { name: "releaseItemName", label: "Release Item Name" },
        { name: "receiverName", label: "Receiver Name" },
        { name: "fathersName", label: "Father's Name" },
        { name: "address", label: "Address" },
        { name: "mobile", label: "Mobile No." },
    ];
    const inputFields = [
        { label: "Upload Photo", id: "photo", ref: photoRef },
        { label: "Upload Document", id: "document", ref: documentRef },
    ];

    return (
        <div className='glass-effect '>
            <div className='py-4 border bg-maroon rounded-t-xl border-gray-400 flex justify-center'>
                <h1 className='text-2xl uppercase text-cream font-semibold'>Maalkhana Release</h1>
            </div>
            <div className='px-8 py-4 rounded-b-md'>
                <div className='flex justify-center my-4 items-center gap-4'>
                    <label className="text-blue-100 font-semibold">1. Select Type to Release From:</label>
                    {/* CHANGE 2: Correct the value for "seized vehicle" */}
                    <DropDown selectedValue={type} handleSelect={setType} options={["malkhana", "seized vehicle"]} />
                </div>
                <hr className="border-gray-600 my-4" />
                <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end'>
                    <InputComponent label='FIR No.' value={formData.firNo} setInput={(e) => handleInputChange('firNo', e.target.value)} />
                    <InputComponent label='OR Sr. No / Mal No.' value={formData.srNo} setInput={(e) => handleInputChange('srNo', e.target.value)} />
                    <div className="md:col-span-2 flex justify-center">
                        <Button onClick={handleGetByFir} className='bg-blue-600 w-1/2' disabled={isFetching || !type}>
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

                {existingId && (
                    <div>
                        <hr className="border-gray-600 my-6" />
                        <div>
                            <h2 className="text-xl text-center text-cream font-semibold mb-4">3. Enter Release Details</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <InputComponent label='Case Property' value={caseProperty} disabled />
                                <InputComponent label='Under Section' value={formData.underSection} disabled />
                                {fields.map((field) => (
                                    <div key={field.name}>
                                        <InputComponent label={field.label} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                    </div>
                                ))}
                                {inputFields.map((item, index) => (
                                    <div key={index} className='flex flex-col gap-2'>
                                        <label className='text-nowrap text-blue-100' htmlFor={item.id}>{item.label}</label>
                                        <input ref={item.ref} className='w-full text-blue-100 rounded-xl glass-effect px-2 py-1' id={item.id} type='file' />
                                    </div>
                                ))}
                            </div>
                            <div className='flex w-full px-12 justify-center items-center gap-4 mt-6'>
                                <Button onClick={handleSave} className='bg-green-600' disabled={isLoading}>
                                    {isLoading ? <LoaderIcon className='animate-spin' /> : '4. Save and Release'}
                                </Button>
                                <Button onClick={resetAll} className='bg-red-600'>Clear Form</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;