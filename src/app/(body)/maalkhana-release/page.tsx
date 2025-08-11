"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useReleaseStore } from '@/store/releaseStore';
import { uploadToCloudinary } from '@/utils/uploadToCloudnary';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

const Page = () => {
    // Use the corrected release store
    const { FetchByFIR, updateReleaseEntry } = useReleaseStore();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [type, setType] = useState<string>("");

    // This state will now hold the unique ID of the record we fetch
    const [recordId, setRecordId] = useState<string>("");

    const { user } = useAuthStore();

    const initialFormData = {
        srNo: '',
        moveDate: '',
        firNo: '',
        underSection: '',
        takenOutBy: '',
        moveTrackingNo: '',
        movePurpose: '',
        recevierName: "", // In your schema, this is 'receiverName', ensure consistency
        fathersName: "",
        address: "",
        mobile: "",
        releaseItemName: ""
    };

    const [formData, setFormData] = useState(initialFormData);
    const [caseProperty, setCaseProperty] = useState('');
    const photoRef = useRef<HTMLInputElement>(null);
    const documentRef = useRef<HTMLInputElement>(null);

    const caseOptions = [
        "Cash Property", "Kukri", "FSL", "Unclaimed", "Other Entry", "Cash Entry",
        "Wine", "MV Act", "ARTO", "BNS / IPC", "Excise Vehicle", "Unclaimed Vehicle", "Seizure Entry"
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const fields = [
        { name: 'firNo', label: 'FIR No.' },
        { name: 'srNo', label: 'Sr. No / Mal No.' },
        { name: 'moveDate', label: 'Move Date' },
        { name: 'underSection', label: 'Under Section' },
        { name: 'takenOutBy', label: 'Taken Out By' },
        { name: 'moveTrackingNo', label: 'Move Tracking No' },
        { name: 'movePurpose', label: 'Move Purpose' },
        { name: "recevierName", label: "Receiver Name" },
        { name: "fathersName", label: "Father's Name" },
        { name: "address", label: "Address" },
        { name: "mobile", label: "Mobile No." },
        { name: "releaseItemName", label: "Release Item Name" },
    ];

    const inputFields = [
        { label: "Upload Photo", id: "photo", ref: photoRef },
        { label: "Upload Document", id: "document", ref: documentRef },
    ];

    const resetAll = () => {
        setFormData(initialFormData);
        setCaseProperty('');
        setRecordId('');
        setType('');
        if (photoRef.current) photoRef.current.value = '';
        if (documentRef.current) documentRef.current.value = '';
    }

    const handleGetFIR = async () => {
        if (!type) {
            toast.error("Please select a type first.");
            return;
        }
        if (!formData.firNo && !formData.srNo) {
            toast.error("Please enter an FIR No. or Sr. No. to fetch.");
            return;
        }

        setIsFetching(true);
        try {
            const data = await FetchByFIR(type, formData.firNo || undefined, formData.srNo || undefined);

            if (data) {
                toast.success("Data Fetched Successfully!");
                // Store the unique ID of the fetched record
                setRecordId(data.id);

                // Populate the form with existing data
                setFormData({
                    ...initialFormData, // Start with a clean slate
                    firNo: data.firNo || '',
                    srNo: data.srNo || '',
                    underSection: data.underSection || '',
                    releaseItemName: data.description || data.caseProperty || '' // Pre-fill item name
                });
                setCaseProperty(data.caseProperty || '');
            } else {
                toast.error("No record found.");
                setRecordId(''); // Clear ID if not found
            }
        } catch (error) {
            console.error("Error fetching by FIR:", error);
            toast.error("Fetch failed. See console.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async () => {
        // We must have a recordId to perform an update
        if (!recordId) {
            toast.error("Please fetch a valid record before saving.");
            return;
        }

        setIsLoading(true);
        try {
            const photoFile = photoRef.current?.files?.[0];
            const documentFile = documentRef.current?.files?.[0];
            let photoUrl = "";
            let documentUrl = "";

            if (photoFile) photoUrl = await uploadToCloudinary(photoFile);
            if (documentFile) documentUrl = await uploadToCloudinary(documentFile);

            // Consolidate all data to be sent for the update
            const updateData = {
                ...formData,
                caseProperty,
                photoUrl,
                documentUrl,
                // Add any other fields that need to be updated
            };

            // We ONLY update now. No more 'add' logic here.
            const success = await updateReleaseEntry(recordId, type, updateData);

            if (success) {
                toast.success("Record Updated Successfully!");
                resetAll(); // Reset the entire form
            } else {
                toast.error("Failed to update the record.");
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
            toast.error("An error occurred during save.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className=' '>
                <div className='py-4 border bg-maroon rounded-t-xl border-gray-400 flex justify-center'>
                    <h1 className='text-2xl uppercase text-cream font-semibold'>Maalkhana Release </h1>
                </div>
                <div className='px-8 glass-effect  py-4 rounded-b-md'>
                    <div className='flex justify-center my-4 '>
                        <DropDown selectedValue={type} handleSelect={setType} options={["malkhana", "siezed vehical"]} />
                    </div>
                    <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='md:col-span-2'>
                            <DropDown
                                label='Case Property'
                                selectedValue={caseProperty}
                                options={caseOptions}
                                handleSelect={setCaseProperty}
                            />
                        </div>

                        {fields.map((field) => (
                            <div key={field.name}>
                                <InputComponent
                                    label={field.label}
                                    value={formData[field.name as keyof typeof formData]}
                                    setInput={(e) => handleInputChange(field.name, e.target.value)}
                                />
                            </div>
                        ))}

                        {inputFields.map((item, index) => (
                            <div key={index} className='flex items-center gap-4 mt-2'>
                                <label className='text-nowrap text-blue-100' htmlFor={item.id}>{item.label}</label>
                                <input
                                    ref={item.ref}
                                    className='w-full text-blue-100 rounded-xl glass-effect px-2 py-1'
                                    id={item.id}
                                    type='file'
                                />
                            </div>
                        ))}
                    </div>

                    <div className='flex w-full px-12 justify-center items-center gap-4 mt-6'>
                        <Button onClick={handleGetFIR} className='bg-blue-600' disabled={isFetching || !type}>
                            {isFetching ? <LoaderIcon className='animate-spin' /> : '1. Fetch Record'}
                        </Button>
                        <Button onClick={handleSave} className='bg-green-600' disabled={isLoading || !recordId}>
                            {isLoading ? <LoaderIcon className='animate-spin' /> : '2. Save Release Info'}
                        </Button>
                        <Button onClick={resetAll} className='bg-red-600'>
                            Clear Form
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
