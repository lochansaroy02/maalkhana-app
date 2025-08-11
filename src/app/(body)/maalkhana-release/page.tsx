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
    const { addReleaseEntry, resetForm, FetchByFIR, updateReleaseEntry } = useReleaseStore()
    const [isloading, setIsLoading] = useState<boolean>(false)
    const [type, setType] = useState<string>("")
    const [existingId, setExistingId] = useState<string>("")
    const { user } = useAuthStore()
    const [formData, setFormData] = useState({
        srNo: '',
        moveDate: '',
        firNo: '',
        underSection: '',
        takenOutBy: '',
        moveTrackingNo: '',
        movePurpose: '',
        recevierName: "",
        fathersName: "",
        address: "",
        mobile: "",
        releaseItemName: ""

    });

    const [caseProperty, setCaseProperty] = useState('');
    const photoRef = useRef<HTMLInputElement>(null);
    const documentRef = useRef<HTMLInputElement>(null);

    const statusOptions = ['Destroy', 'Nilami', 'Pending', 'Other', 'On Court'];
    const caseOptions = [
        "Cash Property", "Kukri", "FSL", "Unclaimed", "Other Entry", "Cash Entry",
        "Wine", "MV Act", "ARTO", "BNS / IPC", "Excise Vehicle", "Unclaimed Vehicle", "Seizure Entry"
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const fields = [
        { name: 'firNo', label: 'FIR No.' },
        { name: 'srNo', label: 'Sr. No / Mal No.' },
        { name: 'moveDate', label: 'Move Date' },
        { name: 'underSection', label: 'Under Section' },
        { name: 'takenOutBy', label: 'Taken Out By' },
        { name: 'moveTrackingNo', label: 'Move Tracking No' },
        { name: 'movePurpose', label: 'Move Purpose' },
        { name: "recevierName", label: "Recevier Name" },
        { name: "fathersName", label: "Father's Name" },
        { name: "address", label: "Address" },
        { name: "mobile", label: "Mobile No." },
        { name: "releaseItemName", label: "Release Item Name" },
    ];

    const inputFields = [
        { label: "Upload Photo", id: "photo", ref: photoRef },
        { label: "Upload Document", id: "document", ref: documentRef },
    ];

    const handleSave = async () => {

        const photoFile = photoRef.current?.files?.[0];
        const documentFile = documentRef.current?.files?.[0];

        let photoUrl = "";
        let documentUrl = "";

        try {
            setIsLoading(true);
            if (photoFile) {
                photoUrl = await uploadToCloudinary(photoFile);
            }
            if (documentFile) {
                documentUrl = await uploadToCloudinary(documentFile);
            }
            const districtId = user?.id


            const fullData = {
                ...formData,
                caseProperty,
                photoUrl,
                documentUrl,
                districtId
            };
            let success;
            if (existingId) {
                success = await updateReleaseEntry(existingId, fullData)
                if (success) {
                    toast.success("Data Updated")
                }
            } else {
                success = await addReleaseEntry(type, fullData)
                if (success) {
                    toast.success("Data Added")

                }
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
        } finally {
            setIsLoading(false)
            setFormData({
                srNo: '',
                moveDate: '',
                firNo: '',
                underSection: '',
                takenOutBy: '',
                moveTrackingNo: '',
                movePurpose: '',
                recevierName: "",
                fathersName: "",
                address: "",
                mobile: "",
                releaseItemName: ""
            });
            setCaseProperty('');
            if (photoRef.current) photoRef.current.value = '';
            if (documentRef.current) documentRef.current.value = '';
        }
    };


    const handleGetFIR = async () => {
        try {
            let response = null;
            if (formData.firNo) {
                response = await FetchByFIR(type, formData.firNo, undefined);
            }



            if (formData.srNo) {
                response = await FetchByFIR(type, undefined, formData.srNo)
            }
        } catch (error) {
            console.error("Error fetching by FIR:", error);
            toast.error("Fetch failed. See con  sole.");
        }
    }




    return (
        <div>
            <div className=' '>
                <div className='py-4 border bg-maroon rounded-t-xl border-gray-400 flex justify-center'>
                    <h1 className='text-2xl uppercase text-cream font-semibold'>Maalkhana Release </h1>
                </div>
                <div className='px-8 glass-effect  py-4 rounded-b-md'>
                    <div className='flex   justify-center my-4 '>
                        <DropDown selectedValue={type} handleSelect={setType} options={["malkhana", "siezed vehical"]} />
                    </div>
                    <div className='mt-2 grid grid-cols-2 gap-2'>
                        <div className='flex items-center justify-between w-full'>
                            <div className='w-full'>
                                <DropDown
                                    label='Case Property'
                                    selectedValue={caseProperty}
                                    options={caseOptions}
                                    handleSelect={setCaseProperty}
                                />
                            </div>
                        </div>
                        {fields.map((field) => {
                            return field.name !== 'firNo' ? (
                                <div key={field.name}>
                                    <InputComponent
                                        label={field.label}
                                        value={formData[field.name as keyof typeof formData]}
                                        setInput={(e) => handleInputChange(field.name, e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div key={field.name} className='flex  items-center gap-2 mr-2   justify-between'>
                                    <InputComponent
                                        className='w-full'
                                        label={field.label}
                                        value={formData[field.name as keyof typeof formData]}
                                        setInput={(e) => handleInputChange(field.name, e.target.value)}
                                    />
                                    <Button onClick={handleGetFIR} className='mt-6 '>Fetch</Button>
                                </div>
                            );
                        })}

                        {inputFields.map((item, index) => (
                            <div key={index} className='flex items-center gap-8'>
                                <label className='text-nowrap text-blue-100' htmlFor={item.id}>{item.label}</label>
                                <input
                                    ref={item.ref}
                                    className=' text-blue-100 rounded-xl glass-effect px-2 py-1'
                                    id={item.id}
                                    type='file'
                                />
                            </div>
                        ))}
                    </div>

                    <div className='flex w-full px-12 justify-between mt-4'>
                        {["Save", "Print", "Modify", "Delete"].map((item, index) => (
                            <Button
                                key={index}
                                onClick={() => {
                                    if (item === "Save") {
                                        handleSave();
                                    } else {
                                        console.log(`${item} clicked`);
                                    }
                                }}
                                className='bg-white-300 border border-blue-200 bg-blue '
                            >
                                {isloading && item == 'Save' ? <LoaderIcon className='animate-spin' /> : item}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
