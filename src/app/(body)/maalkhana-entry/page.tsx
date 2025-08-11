"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datePicker';
import DropDown from '@/components/ui/DropDown';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useMaalkhanaStore } from '@/store/malkhana/maalkhanaEntryStore';
import { uploadToCloudinary } from '@/utils/uploadToCloudnary';
import { Trash } from 'lucide-react';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

const Page = () => {
    const { user } = useAuthStore();
    const { addMaalkhanaEntry, updateMalkhanaEntry, getByFIR } = useMaalkhanaStore();


    const [firData, setFirData] = useState(null)
    const [photoUrl, SetPhotoUrl] = useState("")
    const [entryType, setEntryType] = useState('');
    const [wine, setWine] = useState<number>(0);
    const [cash, setCash] = useState<number>(0);
    const [wineType, setWineType] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingId, setExistingId] = useState<string>("");
    const [dateFields, setDateFields] = useState<{ gdDate?: Date }>({
        gdDate: new Date(),
    });

    const [formData, setFormData] = useState({
        firNo: '',
        srNo: '',
        gdNo: '',
        caseProperty: '',
        underSection: '',
        Year: '',
        policeStation: '',
        IOName: '',
        vadiName: '',
        HM: '',
        accused: '',
        place: '',
        boxNo: '',
        courtNo: '',
        courtName: '',
    });

    const entryOptions = [
        "malkhana Entry",
        "FSL",
        "Kukri",
        "Other Entry",
        "Cash Entry",
        "Wine/Daru",
        "Unclaimed Entry",
    ];
    const statusOptions = ["Destroy", "Nilami", "Pending", "Other", "On Court"];

    const fields = [
        { name: 'firNo', label: 'FIR No' },
        { name: 'srNo', label: 'Sr. No / Mad No.' },
        { name: 'caseProperty', label: 'case Property' },

        { name: 'gdNo', label: 'GD No' },
        { name: 'gdDate', label: 'GD Date', type: 'date' },
        { name: 'Year', label: 'Year' },
        { name: 'policeStation', label: 'Police Station Name' },
        { name: 'IOName', label: 'IO Name' },
        { name: 'vadiName', label: 'Vadi Name' },
        { name: 'status', label: 'Status', type: 'dropdown', options: statusOptions },
        { name: 'HM', label: 'Malkhana Incharge' },
        { name: 'accused', label: 'Accused Name' },
        { name: 'underSection', label: 'Under Section' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'place', label: 'Place' },
        { name: 'boxNo', label: 'Box No' },
        { name: 'courtNo', label: 'Court No' },
        { name: 'courtName', label: 'Court Name' },
        { name: 'imagebox', label: 'Photo' },
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleDateChange = (fieldName: string, date: Date | undefined) => {
        setDateFields(prev => ({
            ...prev,
            [fieldName]: date,
        }));
        handleInputChange(fieldName, date?.toISOString() ?? "");
    };
    const photoRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setLoading(true);

        try {
            const userId = user?.id;
            const fullData = {
                ...formData,
                status,
                wine,
                cash,
                wineType,
                entryType,
                userId,
                photoUrl,
                description,
                gdDate: dateFields.gdDate?.toISOString() ?? '',


            };

            let success = false;
            if (existingId) {
                success = await updateMalkhanaEntry(existingId, fullData)
                toast.success("Data Updated")
            } else {
                success = await addMaalkhanaEntry(fullData)
                toast.success("Data Added")
            }

            if (success) {

                setFormData({
                    caseProperty: '',
                    accused: '', boxNo: '', courtName: "",
                    courtNo: "", firNo: '', gdNo: '', HM: '', IOName: '', place: '', policeStation: '', srNo: '', underSection: '', vadiName: '', Year: ''
                })
                setDateFields({ gdDate: new Date })
                if (photoRef.current) photoRef.current.value = '';
                SetPhotoUrl('')
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setLoading(false)
        }
    };






    const handleGetByFir = async () => {

        const response = await getByFIR(formData.firNo);
        const success = response?.success
        const data = response?.data;
        setFirData(data)
        if (success) {
            setExistingId(data.id)
            setFormData({
                firNo: data.firNo || '',
                underSection: data.underSection || '',
                caseProperty: data.caseProperty,
                srNo: data.srNo || '',
                gdNo: data.gdNo || '',
                Year: data.Year || '',
                policeStation: data.policeStation || '',
                IOName: data.IOName || '',
                vadiName: data.vadiName || '',
                HM: data.HM || '',
                accused: data.accused || '',
                place: data.place || '',
                boxNo: data.boxNo || '',
                courtNo: data.courtNo || '',
                courtName: data.courtName || '',
            });

            setStatus(data.status || '');
            setWine(data.wine || 0);
            setCash(data.cash || 0);
            setWineType(data.wineType || '');
            setEntryType(data.entryType || '');
            setDescription(data.description || '');
            setDateFields({ gdDate: data.gdDate ? new Date(data.gdDate) : new Date() });
        } else {
            toast.error("FIR not found");
        }
    };


    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            // Upload to Cloudinary
            const uploadedUrl = await uploadToCloudinary(file);
            SetPhotoUrl(uploadedUrl);
            toast.success("Photo uploaded successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload photo");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className='glass-effect'>
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Malkhana Entry Form</h1>
            </div>
            <div className='px-8  py-4 rounded-b-md'>
                <div className='py-2 flex items-center'>
                    <div className='flex w-3/4 items-center gap-6'>
                        <div className={`${entryType === 'Wine/Daru' || entryType === 'Cash Entry' ? "w-full" : "w-1/2"}`}>
                            <DropDown
                                label='Entry type'
                                selectedValue={entryType}
                                options={entryOptions}
                                handleSelect={setEntryType}
                            />
                        </div>
                    </div>

                    <div className={`w-full ml-6 gap-6 ${entryType === 'Wine/Daru' ? "flex" : "hidden"} items-center`}>
                        <DropDown label='Wine' selectedValue={wineType} options={["Desi", "Angrezi"]} handleSelect={setWineType} />
                    </div>

                    <div className={`w-full ml-6 gap-6 ${entryType === 'Wine/Daru' ? "flex" : "hidden"} items-center`}>
                        <label className='text-blue-100'>Wine</label>
                        <Input type='number' value={wine} onChange={(e) => setWine(Number(e.target.value))} />
                    </div>

                    <div className={`w-3/4  ml-18   ${entryType === 'Cash Entry' ? "flex flex-col" : "hidden"}`}>
                        <label className='text-blue-100'>Cash</label>
                        <Input className='text-blue-100' type='number' value={cash} onChange={(e) => setCash(Number(e.target.value))} />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-2 '>
                    {fields.map(field => {
                        if (field.name === 'firNo' && entryType === "Unclaimed Entry") return null;

                        if (field.type === 'dropdown') {
                            return (
                                <DropDown
                                    key={field.name}
                                    label={field.label}
                                    selectedValue={status}
                                    options={field.options || []}
                                    handleSelect={setStatus}
                                />
                            );
                        }
                        
                        if (field.type === 'textarea') {
                            return (
                                <div key={field.name} className='flex flex-col col-span-1 gap-1 '>
                                    <label className='text-blue-100' htmlFor={field.name}>{field.label}</label>
                                    <Textarea
                                        id={field.name}
                                        value={description}
                                        className=''
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={`Enter ${field.label}`}
                                    />
                                </div>
                            );
                        }

                        if (field.type === 'date') {
                            return (
                                <DatePicker
                                    key={field.name}
                                    label={field.label}
                                    date={dateFields[field.name as keyof typeof dateFields]}
                                    setDate={(date) => handleDateChange(field.name, date)}
                                />
                            );
                        }



                        return (
                            <div key={field.name} className=" ">

                                {
                                    field.name === 'firNo' ? (
                                        <div className='flex  items-end  justify-between  '>

                                            <InputComponent
                                                className='w-3/4 '
                                                label={field.label}
                                                value={formData[field.name as keyof typeof formData]}
                                                setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                            <Button
                                                type="button"
                                                className="h-10 bg-blue  text-white"
                                                onClick={handleGetByFir}>
                                                fetch Data
                                            </Button>
                                        </div>
                                    ) : <InputComponent
                                        label={field.label}
                                        value={formData[field.name as keyof typeof formData]}
                                        setInput={(e) => handleInputChange(field.name, e.target.value)}
                                    />}
                            </div>
                        );
                    }
                    )}
                </div>

                <div className='w-full'>
                    <div className='flex flex-row mt-4 gap-2 '>
                        <div className='w-[40%]'>
                            <label className='text-nowrap text-blue-100' htmlFor="photo">Upload Photo</label>
                            <input
                                ref={photoRef}
                                className='text-blue-100 rounded-xl glass-effect px-2 py-1'
                                id="photo"
                                type='file'
                                onChange={handlePhotoChange}
                            />
                        </div>

                        <div className='w-[60%] flex flex-col gap-4 relative '>
                            {photoUrl && <Button onClick={() => { SetPhotoUrl("") }} className='absolute right-0 bg-red-800 hover:bg-red-500  cursor-pointer ' > <Trash /></Button>}
                            <div className=''>
                                {photoUrl &&
                                    <img src={photoUrl} className='rounded-md w-full h-full  border' alt="upload preview" />

                                }
                            </div>
                        </div>
                    </div>


                </div>
                <div className='flex w-full px-12 justify-between mt-4'>
                    {["Save", "Print", "Modify", "Delete"].map((item, index) => (
                        <Button
                            key={index}
                            onClick={() => item === "Save" ? handleSave() : console.log(`${item} clicked`)}
                            className='cursor-pointer'
                        >
                            {loading && item === "Save" ? <LoaderIcon className='animate-spin' /> : item}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
