"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useSeizedVehicleStore } from '@/store/seizeStore';
import { useState } from 'react';

const Page = () => {


    const { district } = useAuthStore();
    const [vehicalData, setvehicalData] = useState<any>(null);
    const { addVehicle } = useSeizedVehicleStore();
    const [formData, setFormData] = useState({
        srNo: '',
        gdNo: '',
        gdDate: '',
        underSection: '207',
        vehicleType: '',
        colour: '',
        registrationNo: '',
        engineNo: '',
        description: '',
        status: '',
        policeStation: '',
        ownerName: '',
        seizedBy: ''
    });






    const [caseProperty, setCaseProperty] = useState('');
    const [status, setStatus] = useState<string>("");
    const statusOptions = ['Destroy', 'Nilami', 'Pending', 'Other', 'On Court'];
    const caseOptions = ['mv act', 'arto seized', 'BNS/IPC', 'EXCISE', 'SEIZED', 'UNCLAMMED VEHICLE'];



    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleSave = () => {
        const districtId = district?.id
        const fullVehicleData = {
            ...formData,
            caseProperty,
            districtId,
            status
        };

        setvehicalData(fullVehicleData);
        addVehicle(fullVehicleData)
    };

    const fields = [
        { name: 'srNo', label: 'Sr. No / Mal No.' },
        { name: 'gdNo', label: 'GD No' },
        { name: 'gdDate', label: 'GD Date' },
        { name: 'underSection', label: 'Under Section' },
        { name: 'vehicleType', label: 'Vehicle Type' },
        { name: 'colour', label: 'Colour' },
        { name: 'registrationNo', label: 'Registration No.' },
        { name: 'engineNo', label: 'Engine No.' },
        { name: 'description', label: 'Description' },
        { name: 'status', label: 'status' },
        { name: 'policeStation', label: 'Police Station' },
        { name: 'ownerName', label: 'Owner Name' },
        { name: 'seizedBy', label: 'Seized By (Officer Name)' },
    ];

    return (
        <div className='  glass-effect  '>
            <div className=' '>
                <div className=' py-4  bg-maroon  w-full rounded-t-xl border-b border-white/50  flex justify-center'>
                    <h1 className='text-2xl uppercase  text-[#fdf8e8] font-semibold'>Seized Vehicle Entry </h1>
                </div>
                <div className=' text px-8 py-4 h-screen rounded-b-md'>
                    <div className='flex items-center  justify-between  w-full'>
                        <div className=' w-3/4   '>
                            <DropDown label='Case Property' selectedValue={caseProperty} options={caseOptions} handleSelect={setCaseProperty} />
                        </div>
                    </div>
                    <div className=' mt-2 grid grid-cols-2 gap-2 '>
                        {fields.map(field => (
                            <div className=''>
                                {field.name === "status" ?
                                    <div className='flex  items-center gap-26 w-full'>
                                        <DropDown selectedValue={status} options={statusOptions} label='Status' handleSelect={setStatus} />
                                    </div>
                                    : < InputComponent
                                        className=''
                                        key={field.name}
                                        label={field.label}
                                        value={formData[field.name as keyof typeof formData]}
                                        setInput={e => handleInputChange(field.name, e.target.value)}
                                    />}
                            </div>
                        ))}
                    </div>

                    <div className='flex w-full  px-12    justify-between mt-4'>
                        {
                            ["Save", "Print", "Modify", "Delete"].map((item: string, index: number) => (
                                <Button
                                    onClick={() => {
                                        if (item === "Save") {
                                            handleSave()
                                        } else {
                                            console.log(`${item} clicked`);
                                        }
                                    }}
                                    className='bg-blue text-blue-100 cursor-pointer' key={index}>{item}</Button>
                            ))
                        }
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Page;