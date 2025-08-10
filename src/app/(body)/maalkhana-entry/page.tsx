"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datePicker';
import DropDown from '@/components/ui/DropDown';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useFirStore } from '@/store/firStore';
import { useMaalkhanaStore } from '@/store/maalkhanaEntryStore';
import { uploadToCloudinary } from '@/utils/uploadToCloudnary';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

const Page = () => {
    const { user } = useAuthStore();
    const { addMaalkhanaEntry } = useMaalkhanaStore();
    const [photoUrl, SetPhotoUrl] = useState("")
    const [entryType, setEntryType] = useState('');
    const [wine, setWine] = useState<number>(0);
    const [cash, setCash] = useState<number>(0);
    const [wineType, setWineType] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false)
    const [dateFields, setDateFields] = useState<{ gdDate?: Date }>({
        gdDate: new Date(),
    });

    // ✅ All string/number fields moved into one object
    const [formData, setFormData] = useState({
        firNo: '',
        srNo: '',
        gdNo: '',
        underSection: '',
        Year: '',
        policeStation: '',
        IOName: '',
        vadiName: '',
        HM: '',
        accused: '',
        place: '',             // ⬅️ Newly added here
        boxNo: '',             // ⬅️ Newly added here
        courtNo: '',           // ⬅️ Newly added here
        courtName: '',         // ⬅️ Newly added here
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
        { name: 'gdNo', label: 'GD No' },
        { name: 'gdDate', label: 'GD Date', type: 'date' },
        { name: 'Year', label: 'Year' },
        { name: 'policeStation', label: 'Police Station Name' },
        { name: 'IOName', label: 'IO Name' },
        { name: 'vadiName', label: 'Vadi Name' },
        { name: 'status', label: 'Status', type: 'dropdown', options: statusOptions },
        { name: 'HM', label: 'HM' },
        { name: 'accused', label: 'Accused Name' },
        { name: 'underSection', label: 'Under Section' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'place', label: 'Place' },               // ⬅️ Added here
        { name: 'boxNo', label: 'Box No' },              // ⬅️ Added here
        { name: 'courtNo', label: 'Court No' },          // ⬅️ Added here
        { name: 'courtName', label: 'Court Name' },      // ⬅️ Added here
        { name: 'imagebox', label: 'Photo' },      // ⬅️ Added here
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

            const success = await addMaalkhanaEntry(fullData)
            if (success) {
                toast.success("Data added")
                setFormData({
                    accused: '', boxNo: '', courtName: "",
                    courtNo: "", firNo: '', gdNo: '', HM: '', IOName: '', place: '', policeStation: '', srNo: '', underSection: '', vadiName: '', Year: ''
                })
                setDateFields({ gdDate: new Date })
                if (photoRef.current) photoRef.current.value = '';
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setLoading(false)
        }
    };


    const { fetchDataByFIR } = useFirStore();

    const getByFir = async () => {
        const data = await fetchDataByFIR("entry", formData.firNo);

        if (data) {
            setFormData({
                firNo: data.firNo || '',
                srNo: data.srNo || '',
                gdNo: data.gdNo || '',
                underSection: data.underSection || '',
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
            SetPhotoUrl(uploadedUrl); // This will trigger re-render and show preview
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

                        if (field.name === 'imagebox') {
                            return <div>
                                <label htmlFor="">{field.label}</label>
                                {photoUrl &&

                                    <img src={photoUrl} width={150} height={150} className='rounded-md border' alt="upload preview" />

                                }
                            </div>
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
                                                onClick={getByFir}>
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

                <div className='flex items-center mt-4 gap-8'>
                    <label className='text-nowrap text-blue-100' htmlFor="photo">Upload Photo</label>
                    <input
                        ref={photoRef}
                        className='text-blue-100 rounded-xl glass-effect px-2 py-1'
                        id="photo"
                        type='file'
                        onChange={handlePhotoChange}
                    />
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
