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
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

const Page = () => {

    const { user } = useAuthStore();
    const { addMaalkhanaEntry, updateMalkhanaEntry, getByFIR } = useMaalkhanaStore();

    const [firData, setFirData] = useState<any[]>([]);
    const [photoUrl, SetPhotoUrl] = useState("");

    // --- MODIFIED STATE LOGIC ---
    // This state tracks the selection in the dropdown for UI purposes (e.g., showing the 'Other' input)
    const [dropdownSelection, setDropdownSelection] = useState('');
    // This state holds the actual, final value for the entry type.
    const [entryType, setEntryType] = useState('');

    const [wine, setWine] = useState<number>(0);
    const [cash, setCash] = useState<number>(0);
    const [wineType, setWineType] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingId, setExistingId] = useState<string>("");
    const [yellowItemPrice, setYellowItemPrice] = useState<number>(0);


    const [dateFields, setDateFields] = useState<{ gdDate?: Date }>({
        gdDate: new Date(),
    });

    const [selectedSrNo, setSelectedSrNo] = useState<string>('');

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

    const populateForm = (data: any) => {
        if (!data) return;
        setExistingId(data.id || "");
        setFormData({
            firNo: data.firNo || '',
            srNo: data.srNo || '',
            underSection: data.underSection || '',
            caseProperty: data.caseProperty || '',
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
        setYellowItemPrice(data.yellowItemPrice || 0)
        setWine(data.wine || 0);
        setCash(data.cash || 0);
        setWineType(data.wineType || '');

        const standardEntries = ["malkhana Entry", "FSL", "Kukri", "Cash Entry", "Wine/Daru", "Unclaimed Entry"];
        if (data.entryType && !standardEntries.includes(data.entryType)) {
            setDropdownSelection('Other Entry');
            setEntryType(data.entryType);
        } else {
            const entry = data.entryType || '';
            setDropdownSelection(entry);
            setEntryType(entry);
        }

        setDescription(data.description || '');
        setDateFields({ gdDate: data.gdDate ? new Date(data.gdDate) : new Date() });
        SetPhotoUrl(data.photoUrl || "");
    };

    const clearForm = () => {
        setFormData(prev => ({
            firNo: prev.firNo,
            srNo: '', gdNo: '', caseProperty: '', underSection: '', Year: '', policeStation: '', IOName: '', vadiName: '', HM: '', accused: '', place: '', boxNo: '', courtNo: '', courtName: '',
        }));
        setExistingId("");
        setStatus('');
        setWine(0);
        setCash(0);
        setWineType('');
        setYellowItemPrice(0),
            setDropdownSelection('');
        setEntryType('');
        setDescription('');
        setDateFields({ gdDate: new Date() });
        SetPhotoUrl("");
        if (photoRef.current) photoRef.current.value = '';
    };

    const entryOptions = [
        "malkhana Entry", "FSL", "Kurki", "Cash Entry", "Wine/Daru", "Unclaimed Entry", "Other Entry",
        "Yellow Item"
    ];
    const statusOptions = ["Destroy", "Nilami", "Pending", "Other", "On Court"];

    const fields = [
        { name: 'firNo', label: 'FIR No' },
        { name: 'srNo', label: 'Sr. No / Mud No.' },
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
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (fieldName: string, date: Date | undefined) => {
        setDateFields(prev => ({ ...prev, [fieldName]: date }));
        handleInputChange(fieldName, date?.toISOString() ?? "");
    };

    // --- MODIFIED HANDLER ---
    // This function now handles the logic for setting both the UI state and the final data state
    const handleEntryTypeSelect = (value: string) => {
        setDropdownSelection(value); // Update the dropdown selection state
        if (value === 'Other Entry') {
            setEntryType(''); // Clear the final value to allow user input
        } else {
            setEntryType(value); // Set the final value directly
        }
    };


    const photoRef = useRef<HTMLInputElement>(null);

    const handleSrNoSelectionChange = (srNo: string) => {
        setSelectedSrNo(srNo);
        const selectedData = firData.find((item: any) => item.srNo === srNo);
        if (selectedData) {
            populateForm(selectedData);
        }
    };

    const handleSave = async () => {



        setLoading(true);
        try {
            if (dropdownSelection === 'Other Entry' && !entryType) {
                toast.error("Please specify the 'Other' entry type.");
                setLoading(false);
                return;
            }

            const userId = user?.id;
            const fullData = {
                ...formData,
                status, wine, cash, wineType,
                entryType, // entryType state now holds the correct final value directly
                userId, photoUrl, description,
                yellowItemPrice,
                gdDate: dateFields.gdDate?.toISOString() ?? '',
            };

            let success = false;
            if (existingId) {
                success = await updateMalkhanaEntry(existingId, fullData);
                toast.success("Data Updated");
            } else {
                success = await addMaalkhanaEntry(fullData);
                toast.success("Data Added");
            }

            if (success) {
                clearForm();
                setFormData({ firNo: '', srNo: '', gdNo: '', caseProperty: '', underSection: '', Year: '', policeStation: '', IOName: '', vadiName: '', HM: '', accused: '', place: '', boxNo: '', courtNo: '', courtName: '' });
                setFirData([]);
                setSelectedSrNo('');
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setLoading(false);
        }

    };

    const handleGetByFir = async () => {
        setSelectedSrNo('');
        const response = await getByFIR(formData.firNo, user?.id);
        const success = response?.success;
        const data = response?.data;

        if (success) {
            const dataArray = Array.isArray(data) ? data : [data];
            setFirData(dataArray);

            if (dataArray.length === 1) {
                populateForm(dataArray[0]);
                setSelectedSrNo(dataArray[0].srNo);
            } else {
                clearForm();
            }
        } else {
            setFirData([]);
            toast.error("FIR not found");
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
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

    const router = useRouter();
    const handlePrint = () => {
        const fullData = {
            ...formData,
            status,
            wine,
            cash,
            wineType,
            entryType,
            photoUrl,
            description,
            gdDate: dateFields.gdDate?.toISOString() ?? '',
        };
        if (!fullData.firNo && !fullData.srNo) {
            toast.error("Please fill in the form or fetch data before printing.");
            return;
        }
        sessionStorage.setItem('printableEntryData', JSON.stringify(fullData));
        window.open('/details', '_blank');
    };

    return (
        <div className='glass-effect'>
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>Malkhana Entry Form</h1>
            </div>
            <div className='px-8 py-4 rounded-b-md'>
                <div className='py-2 flex items-end gap-6'>
                    <div className='flex items-end gap-6 w-3/4'>
                        <div className={dropdownSelection === 'Other Entry' ? 'w-1/2' : 'w-1/2'}>
                            <DropDown
                                label='Entry type'
                                selectedValue={dropdownSelection}
                                options={entryOptions}
                                handleSelect={handleEntryTypeSelect}
                            />
                        </div>
                        {dropdownSelection === 'Other Entry' && (
                            <div className='w-1/2'>
                                <InputComponent
                                    label="Specify Other Entry"
                                    value={entryType}
                                    // The input field now directly sets the final entryType value
                                    setInput={(e) => setEntryType(e.target.value)}
                                />
                            </div>
                        )}
                        {dropdownSelection === 'Yellow Item' && (
                            <div className='w-1/2'>
                                <InputComponent
                                    label="Enter Yellow Item Price"
                                    value={yellowItemPrice}
                                    // The input field now directly sets the final entryType value
                                    setInput={(e) => setYellowItemPrice(Number(e.target.value))}
                                />
                            </div>
                        )}
                    </div>

                    <div className={`w-full ml-6 gap-6 ${dropdownSelection === 'Wine/Daru' ? "flex" : "hidden"} items-center`}>
                        <DropDown label='Wine' selectedValue={wineType} options={["Desi", "Angrezi"]} handleSelect={setWineType} />
                    </div>
                    <div className={`w-full ml-6 gap-6 ${dropdownSelection === 'Wine/Daru' ? "flex" : "hidden"} items-center`}>
                        <label className='text-blue-100'>Wine</label>
                        <Input type='number' value={wine} onChange={(e) => setWine(Number(e.target.value))} />
                    </div>

                    <div className={`w-3/4 ml-18 ${dropdownSelection === 'Cash Entry' ? "flex flex-col" : "hidden"}`}>
                        <label className='text-blue-100'>Cash</label>
                        <Input className='text-blue-100' type='number' value={cash} onChange={(e) => setCash(Number(e.target.value))} />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                    {fields.map(field => {
                        if (field.name === 'firNo' && dropdownSelection === "Unclaimed Entry") return null;


                        { entryType === 'Yellow Item' && < InputComponent label='Enter Yellow Item Price' value={yellowItemPrice} setInput={(e) => { setYellowItemPrice((Number)(e.target.value)) }} /> }
                        if (field.name === 'srNo') {
                            if (firData.length > 1) {
                                return (
                                    <div key="srNo-radios" className="col-span-2 flex flex-col gap-1">
                                        <label className='text-blue-100'>Select One Sr. No / Mud No.</label>
                                        <div className="glass-effect p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {firData
                                                .filter((item: any) => item && item.srNo)
                                                .map((item: any) => (
                                                    <div key={item.id || item.srNo} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            id={`srNo-${item.srNo}`}
                                                            name="srNoSelection"
                                                            className="form-radio h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 cursor-pointer"
                                                            checked={selectedSrNo === item.srNo}
                                                            onChange={() => handleSrNoSelectionChange(item.srNo)}
                                                        />
                                                        <label htmlFor={`srNo-${item.srNo}`} className="text-blue-100 cursor-pointer">{item.srNo}</label>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <InputComponent key={field.name} label={field.label} value={formData.srNo} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                );
                            }
                        }

                        if (field.type === 'dropdown') {
                            return <DropDown key={field.name} label={field.label} selectedValue={status} options={field.options || []} handleSelect={setStatus} />;
                        }
                        if (field.type === 'textarea') {
                            return (
                                <div key={field.name} className='flex flex-col col-span-1 gap-1'>
                                    <label className='text-blue-100' htmlFor={field.name}>{field.label}</label>
                                    <Textarea className='text-blue-100' id={field.name} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={`Enter ${field.label}`} />
                                </div>
                            );
                        }
                        if (field.type === 'date') {
                            return <DatePicker key={field.name} label={field.label} date={dateFields[field.name as keyof typeof dateFields]} setDate={(date) => handleDateChange(field.name, date)} />;
                        }

                        return (
                            <div key={field.name}>
                                {field.name === 'firNo' ? (
                                    <div className='flex items-end justify-between'>
                                        <InputComponent className='w-3/4' label={field.label} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                        <Button type="button" className="h-10 bg-blue text-white" onClick={handleGetByFir}>Fetch Data</Button>
                                    </div>
                                ) : (
                                    <InputComponent label={field.label} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className='w-full'>
                    <div className='flex flex-row mt-4 gap-2'>
                        <div className='w-[40%]'>
                            <label className='text-nowrap text-blue-100' htmlFor="photo">Upload Photo</label>
                            <input ref={photoRef} className='text-blue-100 rounded-xl glass-effect px-2 py-1' id="photo" type='file' onChange={handlePhotoChange} />
                        </div>
                        <div className='w-[60%] flex flex-col gap-4 relative'>
                            {photoUrl && <Button onClick={() => SetPhotoUrl("")} className='absolute right-0 bg-red-800 hover:bg-red-500 cursor-pointer'><Trash /></Button>}
                            {photoUrl && <img src={photoUrl} className='rounded-md w-full h-full border' alt="upload preview" />}
                        </div>
                    </div>
                </div>
                <div className='flex w-full px-12 justify-between mt-4'>
                    {["Save", "Print", "Modify", "Delete"].map((item, index) => (
                        <Button key={index} onClick={() => {
                            if (item === "Save") handleSave();
                            if (item === "Print") handlePrint();
                        }} className='cursor-pointer'>
                            {loading && item === "Save" ? <LoaderIcon className='animate-spin' /> : item}
                        </Button>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default Page;