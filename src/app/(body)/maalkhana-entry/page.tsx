"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datePicker';
import DropDown from '@/components/ui/DropDown';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useMaalkhanaStore } from '@/store/maalkhanaEntryStore';
import { useState } from 'react';

const Page = () => {


    const { district } = useAuthStore()
    const { addMaalkhanaEntry } = useMaalkhanaStore();
    const [maalKhanaData, setMaalKhanaData] = useState<any>(null);

    const [wine, setWine] = useState<number>(0)
    const [cash, setCash] = useState<number>(0)
    const [wineType, setWineType] = useState<string>('')
    const [status, setStatus] = useState<string>("");
    const [place, setPlace] = useState('');
    const [boxNo, setBoxNo] = useState('');
    const [courtNo, setCourtNo] = useState('');
    const [courtName, setCourtName] = useState('');
    const [entryType, setEntryType] = useState('');

    const [dateFields, setDateFields] = useState<{
        gdDate?: Date;
    }>({
        gdDate: new Date(),
    });


    const [formData, setFormData] = useState({
        srNo: '',
        gdNo: '',
        gdDate: '',
        underSection: '207',
        Year: '',
        policeStation: '',
        IOName: '',
        vadiName: '',
        HM: '',
        accused: '',
        firNo: ''
    });

    const fields = [
        { name: 'firNo', label: 'FIR No' },
        { name: 'srNo', label: 'Sr. No / Mad No.' },
        { name: 'gdNo', label: 'GD No' },
        { name: 'gdDate', label: 'GD Date' },
        { name: 'Year', label: 'Year' },
        { name: 'policeStation', label: 'Police Station Name' },
        { name: 'IOName', label: 'IO Name' },
        { name: 'vadiName', label: 'Vadi Name' },
        { name: 'status', label: 'Status' },
        { name: 'HM', label: 'HM' },
        { name: 'accused', label: 'Accused Name' },
    ];

    const entryOptions = [
        "Malkhane Entry",
        "FSL",
        "Kukri",
        "Other Entry",
        "Cash Entry",
        "Wine/Daru",
        "Unclaimed Entry"
    ];

    const statusOptions = ["Destroy", "Nilami", "Pending", "Other", "On Court"];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === "wine" ? Number(value) : value
        }));
    };


    const handleSave = () => {
        const districtId = district?.id
        const fullData = {
            ...formData,
            status,
            wine,
            entryType,
            place,
            boxNo,
            courtNo,
            courtName,
            wineType,
            districtId
        };
        setMaalKhanaData(fullData);
        addMaalkhanaEntry(fullData, districtId)

    };

    const handleDateChange = (fieldName: string, date: Date | undefined) => {
        setDateFields(prev => ({
            ...prev,
            [fieldName]: date,
        }));
        handleInputChange(fieldName, date?.toISOString() ?? "");
    };
    return (

        <div className='glass-effect h-screen'>
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Maalkhana Entry Form</h1>
            </div>
            <div className='  px-8 py-4 rounded-b-md'>
                <div className=' py-2   flex items-center   '>
                    <div className='flex w-3/4  items-center gap-6  '>

                        <div className={`${entryType === 'Wine/Daru' || entryType === 'Cash Entry' ? "w-full" : "w-1/2"
                            }`}>
                            <DropDown label='Entry type' selectedValue={entryType} options={entryOptions} handleSelect={setEntryType} />
                        </div>
                    </div>
                    <div className={` w-full ml-6 gap-6 ${entryType === 'Wine/Daru' ? "flex" : "hidden"}   items-center`}>
                        <DropDown label='Wine' selectedValue={wineType} options={["Desi", "Angrezi"]} handleSelect={setWineType} />
                    </div>
                    <div className={` w-full ml-6 gap-6 ${entryType === 'Wine/Daru' ? "flex" : "hidden"}   items-center`}>
                        <label className='text-blue-100' htmlFor="">wine</label>
                        <Input className='' onChange={(e) => {
                            setWine(Number(e.target.value))
                        }} type='number' value={wine} />
                    </div>

                    <div className={`w-3/4 gap-12 ${entryType === 'Cash Entry' ? "flex" : "hidden"}   items-center`}>
                        <label className='text-blue-100' htmlFor="">Cash</label>
                        <Input className='ml-[70px]' onChange={(e) => {
                            setCash(Number(e.target.value))
                        }} type='number' value={cash} />
                    </div>

                </div>

                <div className='grid grid-cols-2 gap-2'>
                    {fields.map(field => {
                        if (field.name === "status") {
                            return (
                                <div key={field.name}>
                                    {field.name.includes("Date") ? <div>
                                        <DatePicker
                                            label={field.label}
                                            date={dateFields[field.name as keyof typeof dateFields]}
                                            setDate={(date) => handleDateChange(field.name, date)} />
                                    </div> :
                                        <InputComponent label={field.label} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                    }
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
                <div className='mt-2'>
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
                            className='bg-white-300 border border-gray-200 bg-blue-800'
                        >
                            {item}
                        </Button>
                    ))}
                </div>
            </div>
        </div>

    );
};

export default Page;
