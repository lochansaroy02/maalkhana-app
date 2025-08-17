"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useReleaseStore } from '@/store/releaseStore';
import { uploadToCloudinary } from '@/utils/uploadToCloudnary';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

const Page = () => {
    // 1. Use the correct store functions for fetching and updating
    const { FetchByFIR, updateReleaseEntry } = useReleaseStore();

    // --- STATE MANAGEMENT (similar to your movement form) ---
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [type, setType] = useState<string>(""); // To select 'malkhana' or 'seized_vehicle'
    const [existingId, setExistingId] = useState<string>(""); // Holds the ID of the fetched record

    // State for handling multiple search results
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');

    // State for form data - these fields are preserved from your original code
    const [formData, setFormData] = useState({
        firNo: '',
        srNo: '',
        underSection: '',
        releaseItemName: "",
        receiverName: "", // Corrected typo here
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

    // This function populates the form after a record is fetched or selected
    const fillForm = (data: any) => {
        if (!data) return;
        const recordId = data.id || data._id; // Handle both id formats
        setExistingId(recordId);
        setFormData({
            // Pre-fill identifiers
            firNo: data.firNo || '',
            srNo: data.srNo || '',
            underSection: data.underSection || '',
            // Pre-fill the item name from existing data, but allow user to edit it
            releaseItemName: data.description || data.caseProperty || '',
            // Reset release-specific fields for the user to fill
            receiverName: "", // Corrected typo here
            fathersName: "",
            address: "",
            mobile: "",
        });
        setCaseProperty(data.caseProperty || '');
    };

    const resetAll = () => {
        setFormData({ firNo: '', srNo: '', underSection: '', releaseItemName: "", receiverName: "", fathersName: "", address: "", mobile: "" }); // Corrected typo here
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
        setSearchResults([]); // Clear previous results
        setExistingId('');   // Clear existing ID to hide the form
        try {
            // Use the FetchByFIR from your releaseStore
            const data = await FetchByFIR(type, formData.firNo, formData.srNo);
            if (data) {
                const dataArray = Array.isArray(data) ? data : [data];
                if (dataArray.length > 1) {
                    setSearchResults(dataArray);
                    toast.success(`${dataArray.length} records found. Please select one.`);
                } else if (dataArray.length === 1) {
                    toast.success("Data Fetched Successfully!");
                    fillForm(dataArray[0]);
                    setSelectedResultId(dataArray[0].id || dataArray[0]._id);
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

    const handleSave = async () => {
        // This is now an UPDATE only function
        if (!existingId) {
            toast.error("Please fetch a valid record before saving.");
            return;
        }
        setIsLoading(true);
        try {
            const photoFile = photoRef.current?.files?.[0];
            const documentFile = documentRef.current?.files?.[0];
            let photoUrl = photoFile ? await uploadToCloudinary(photoFile) : "";
            let documentUrl = documentFile ? await uploadToCloudinary(documentFile) : "";

            // Create the payload with only the fields relevant to a release
            const updateData = {
                receiverName: formData.receiverName, // Corrected typo here
                fathersName: formData.fathersName,
                address: formData.address,
                mobile: formData.mobile,
                releaseItemName: formData.releaseItemName,
                photoUrl,
                documentUrl,
                status: "Released", // Automatically mark the item as released
                isReturned: true,    // Set isReturned to true
                isRelease: true,   // Flag to identify this as a release entry
            };

            const success = await updateReleaseEntry(existingId, type, updateData);
            if (success) {
                toast.success("Record Updated and Released Successfully!");
                resetAll();
            } else {
                toast.error("Failed to update the record.");
            }
        } catch (error) {
            console.error('Error saving release info:', error);
            toast.error("An error occurred during save.");
        } finally {
            setIsLoading(false);
        }
    };

    // This function is for when a user clicks a radio button
    const handleResultSelectionChange = (resultId: string) => {
        setSelectedResultId(resultId);
        const selectedData = searchResults.find(item => (item.id || item._id) === resultId);
        if (selectedData) {
            fillForm(selectedData);
        }
    };

    // --- FIELD DEFINITIONS (Preserved from your original code) ---
    const fields = [
        { name: "releaseItemName", label: "Release Item Name" },
        { name: "receiverName", label: "Receiver Name" }, // Corrected typo here
        { name: "fathersName", label: "Father's Name" },
        { name: "address", label: "Address" },
        { name: "mobile", label: "Mobile No." },
    ];
    const inputFields = [
        { label: "Upload Photo", id: "photo", ref: photoRef },
        { label: "Upload Document", id: "document", ref: documentRef },
    ];
    const caseOptions = ["Cash Property", "Kurki", "FSL", "Unclaimed", "Other Entry", "Cash Entry", "Wine", "MV Act", "ARTO", "BNS / IPC", "Excise Vehicle", "Unclaimed Vehicle", "Seizure Entry"];

    return (
        <div className='glass-effect '>
            <div className='py-4 border bg-maroon rounded-t-xl border-gray-400 flex justify-center'>
                <h1 className='text-2xl uppercase text-cream font-semibold'>Maalkhana Release</h1>
            </div>
            <div className='px-8 py-4   rounded-b-md'>
                {/* Step 1: Fetching Section */}
                <div className='flex justify-center my-4 items-center gap-4'>
                    <label className="text-blue-100 font-semibold">1. Select Type to Release From:</label>
                    <DropDown selectedValue={type} handleSelect={setType} options={["malkhana", "seized_vehicle"]} />
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

                {/* Step 2: Radio button selection for multiple results */}
                {searchResults.length > 1 && (
                    <div className="my-4 col-span-2 flex flex-col gap-1">
                        <label className='text-blue-100'>Multiple Records Found. Please Select One:</label>
                        <div className="glass-effect p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-3">
                            {searchResults.map((item: any) => (
                                <div key={item.id || item._id} className="flex items-center gap-2">
                                    <input type="radio" id={`result-${item.id || item._id}`} name="resultSelection" className="form-radio h-4 w-4" checked={selectedResultId === (item.id || item._id)} onChange={() => handleResultSelectionChange(item.id || item._id)} />
                                    <label htmlFor={`result-${item.id || item._id}`} className="text-blue-100 cursor-pointer">{item.firNo ? `FIR: ${item.firNo}` : ''} {item.srNo ? `SR: ${item.srNo}` : ''}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {existingId && (
                    <div className=''>
                        <hr className="border-gray-600 my-6" />
                        <div>
                            <h2 className="text-xl text-center text-cream font-semibold mb-4">3. Enter Release Details</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                                <InputComponent label='Case Property' value={caseProperty} />
                                <InputComponent label='Under Section' value={formData.underSection} />
                                {fields.map((field) => (
                                    <div key={field.name}>
                                        <InputComponent label={field.label} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                    </div>
                                ))}
                                {inputFields.map((item, index) => (
                                    <div key={index} className='flex items-center gap-4 mt-2'>
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
