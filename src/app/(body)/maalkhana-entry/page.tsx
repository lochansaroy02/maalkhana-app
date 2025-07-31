"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useMaalkhanaStore } from '@/utils/maalkhanaEntryStore';
import { useSeizedVehicleStore } from '@/utils/store';
import { useState } from 'react';

const Page = () => {

    const { addMaalkhanaEntry } = useMaalkhanaStore();
    const [maalKhanaData, setMaalKhanaData] = useState<any>(null);
    const { addVehicle } = useSeizedVehicleStore();

    const [status, setStatus] = useState<string>("");
    const [place, setPlace] = useState('');
    const [boxNo, setBoxNo] = useState('');
    const [courtNo, setCourtNo] = useState('');
    const [courtName, setCourtName] = useState('');
    const [entryType, setEntryType] = useState('');

    const [formData, setFormData] = useState({
        srNo: '',
        gdNo: '',
        gdDate: '',
        underSection: '207',
        Year: '',
        IOName: '',
        vadiName: '',
        HM: '',
        accused: '',
        firNo: ''
    });

    const fields = [
        { name: 'srNo', label: 'Sr. No / Mal No.' },
        { name: 'gdNo', label: 'GD No' },
        { name: 'gdDate', label: 'GD Date' },
        { name: 'Year', label: 'Year' },
        { name: 'IOName', label: 'IO Name' },
        { name: 'vadiName', label: 'Vadi Name' },
        { name: 'status', label: 'Status' },
        { name: 'HM', label: 'HM' },
        { name: 'accused', label: 'Accused Name' },
        { name: 'firNo', label: 'FIR No' },
    ];

    const entryOptions = [
        "Malkhane Entry",
        "FSL",
        "Kukri",
        "Other Entry",
        "Cash Entry",
        "Wine / Daru(Quantity / Litre)",
        "Unclaimed Entry"
    ];

    const statusOptions = ["Destroy", "Nilami", "Pending", "Other", "On Court"];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        const fullData = {
            ...formData,
            status,
            entryType,
            place,
            boxNo,
            courtNo,
            courtName
        };
        setMaalKhanaData(fullData);
        addMaalkhanaEntry(fullData)
    };


    return (
        <div className='flex justify-center p-24  h-screen items-center'>
            <div className='mt-4 w-3/4   border drop-shadow-2xl border-gray-300 rounded-xl'>
                <div className='bg-[#0a3d74] py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                    <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Maalkhana Entry Form</h1>
                </div>

                <div className='bg-[#fef9e5] border border-gray-300 px-8 py-4 rounded-b-md'>
                    {/* Entry Type Dropdown */}
                    <div className='flex items-center justify-between w-full mb-4'>
                        <label className='text-nowrap text-[#102647]'>Entry Type</label>
                        <div className='w-3/4'>
                            <DropDown selectedValue={entryType} options={entryOptions} handleSelect={setEntryType} />
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className='grid grid-cols-2 gap-2'>
                        {fields.map(field => {
                            if (field.name === "status") {
                                return (
                                    <div key={field.name} className='flex items-center gap-2 justify-between w-full'>
                                        <label className='text-nowrap text-[#102647]'>Status</label>
                                        <div className='w-3/4'>
                                            <DropDown selectedValue={status} options={statusOptions} handleSelect={setStatus} />
                                        </div>
                                    </div>
                                );
                            }

                            if (field.name === "firNo" && entryType === "Unclaimed Entry") {
                                return null;
                            }

                            return (
                                <InputComponent
                                    key={field.name}
                                    label={field.label}
                                    value={formData[field.name as keyof typeof formData]}
                                    setInput={(e) => handleInputChange(field.name, e.target.value)}
                                />
                            );
                        })}
                    </div>

                    {/* Storage & Court Details */}
                    <div>
                        <div className='gap-2  grid grid-cols-2'>
                            <InputComponent label="Place" value={place} setInput={(e) => setPlace(e.target.value)} />
                            <InputComponent label="Box No" value={boxNo} setInput={(e) => setBoxNo(e.target.value)} />
                            <InputComponent label="Court No" value={courtNo} setInput={(e) => setCourtNo(e.target.value)} />
                            <InputComponent label="Court Name" value={courtName} setInput={(e) => setCourtName(e.target.value)} />
                        </div>
                    </div>

                    {/* Action Buttons */}
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
                                className='bg-white-300 border border-gray-200 text-gray-800'
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
