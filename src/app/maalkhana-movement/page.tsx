"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useState } from 'react';

const Page = () => {
    const [formData, setFormData] = useState({
        srNo: '',
        gdNo: '',
        gdDate: '',
        underSection: '207',
        vehicleType: '',
        colour: '',
        registrationNo: '',
        engineNo: '',
        chassisNo: '',
        description: '',
        status: '',
        policeStation: '',
        ownerName: '',
        seizedBy: ''
    });

    const [caseProperty, setCaseProperty] = useState('');

    const statusOptions = ['Destroy', 'Nilami', 'Pending', 'Other', 'On Court'];
    const caseOptions = [
        "Cash Property",
        "Kukri",
        "FSL",
        "Unclaimed",
        "Other Entry",
        "Cash Entry",
        "Wine",
        "MV Act",
        "ARTO",
        "BNS / IPC",
        "Excise Vehicle",
        "Unclaimed Vehicle",
        "Seizure Entry"
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Array of input field definitions
    const fields = [
        { name: 'srNo', label: 'Sr. No / Mal No.' },
        { name: 'gdNo', label: 'GD No' },
        { name: 'gdDate', label: 'GD Date' },
        { name: 'underSection', label: 'Under Section' },
        { name: 'vehicleType', label: 'Vehicle Type' },
        { name: 'colour', label: 'Colour' },
        { name: 'registrationNo', label: 'Registration No.' },
        { name: 'engineNo', label: 'Engine No.' },
        { name: 'chassisNo', label: 'Chassis No.' },
        { name: 'description', label: 'Description' },
        { name: 'policeStation', label: 'Police Station' },
        { name: 'ownerName', label: 'Owner Name' },
        { name: 'seizedBy', label: 'Seized By (Officer Name)' },
    ];

    return (
        <div className='flex justify-center  w-screen items-center'>
            <div className='mt-12 w-1/2 border border-gray-300  rounded-xl '>
                <div className='bg-gray-200 py-4 border border-gray-400  rounded-t-xl flex justify-center'>

                    <h1 className='text-2xl uppercase  font-semibold'>Seized Vehicle Entry </h1>
                </div>
                <div className=' bg-gray-100  border border-gray-300 px-8 py-4 rounded-b-md'>
                    <div className='flex items-center  justify-between  w-full'>
                        <label className='text-nowrap'>Case Property</label>
                        <div className=' w-3/4   '>
                            <DropDown selectedValue={caseProperty} options={caseOptions} handleSelect={setCaseProperty} />
                        </div>
                    </div>
                    <div className=' mt-2 grid grid-cols-2 gap-2 '>
                        {fields.map(field => (
                            <div className=''>

                                <InputComponent
                                    className=''
                                    key={field.name}
                                    label={field.label}
                                    value={formData[field.name as keyof typeof formData]}
                                    setInput={e => handleInputChange(field.name, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className='flex w-full  px-12    justify-between mt-4'>
                        {
                            ["Save", "Print", "Modify", "Delete"].map((item: string, index: number) => (
                                <Button className='bg-white-300 border border-gray-200 text-gray-800' key={index}>{item}</Button>
                            ))
                        }
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Page;
