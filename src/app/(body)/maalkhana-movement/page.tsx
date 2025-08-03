"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useMovementStore } from '@/store/movementStore';
import { useRef, useState } from 'react';

const Page = () => {

    const { addMovementEntry } = useMovementStore();
    const [formData, setFormData] = useState({
        srNo: '',
        name: '',
        moveDate: '',
        firNo: '',
        underSection: '207',
        takenOutBy: '',
        moveTrackingNo: '',
        movePurpose: '',
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
        { name: 'srNo', label: 'Sr. No / Mal No.' },
        { name: 'moveDate', label: 'Move Date' },
        { name: 'firNo', label: 'FIR No.' }, // fixed key from 'firNo.' to 'firNo'
        { name: 'underSection', label: 'Under Section' },
        { name: 'takenOutBy', label: 'Taken Out By' },
        { name: 'moveTrackingNo', label: 'Move Tracking No' },
        { name: 'movePurpose', label: 'Move Purpose' },
        { name: 'name', label: 'Name' },
    ];

    const inputFields = [
        { label: "Upload Photo", id: "photo", ref: photoRef },
        { label: "Upload Document", id: "document", ref: documentRef },
    ];

    const handleSave = () => {
        const photoFile = photoRef.current?.files?.[0];
        const documentFile = documentRef.current?.files?.[0];


        const fullData = {
            ...formData,
            caseProperty,
        }
        addMovementEntry(fullData)
    };

    return (
        <div>
            <div className='glass-effect'>
                <div className='bg-maroon rounded-t-xl py-4 border-b border-white/50 flex justify-center'>
                    <h1 className='text-2xl uppercase text-cream font-semibold'>Maalkhana Movement</h1>
                </div>
                <div className=' px-8 py-4  h-screen rounded-b-md'>
                    <div className='flex items-center justify-between w-full'>
                        <label className='text-nowrap text-blue-100'>Case Property</label>
                        <div className='w-3/4'>
                            <DropDown
                                selectedValue={caseProperty}
                                options={caseOptions}
                                handleSelect={setCaseProperty}
                            />
                        </div>
                    </div>

                    <div className='mt-2 grid grid-cols-2 gap-2'>
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
                            <div key={index} className='flex items-center justify-between'>
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
                                className='bg-blue border border-white/50  text-blue-50'
                            >
                                {item}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
