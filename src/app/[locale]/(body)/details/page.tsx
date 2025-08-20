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

    const [firData, setFirData] = useState<any[]>([]);
    const [photoUrl, SetPhotoUrl] = useState("");

    // ✅ FIX: Re-introduced two-state system for the entry type dropdown
    // `dropdownSelection` tracks the UI choice, `entryType` holds the final data.
    const [dropdownSelection, setDropdownSelection] = useState('');
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
    const [selectedSrNo, setSelectedSrNo] = useState<string>('');
    const [formData, setFormData] = useState({
        firNo: '', srNo: '', gdNo: '', caseProperty: '', underSection: '', Year: '', policeStation: '', IOName: '', vadiName: '', HM: '', accused: '', place: '', boxNo: '', courtNo: '', courtName: '',
    });

    const photoRef = useRef<HTMLInputElement>(null);

    const populateForm = (data: any) => {
        if (!data) return;
        setExistingId(data.id || "");
        setFormData({
            firNo: data.firNo || '', srNo: data.srNo || '', underSection: data.underSection || '', caseProperty: data.caseProperty || '', gdNo: data.gdNo || '', Year: data.Year || '', policeStation: data.policeStation || '', IOName: data.IOName || '', vadiName: data.vadiName || '', HM: data.HM || '', accused: data.accused || '', place: data.place || '', boxNo: data.boxNo || '', courtNo: data.courtNo || '', courtName: data.courtName || '',
        });
        setStatus(data.status || '');
        setWine(data.wine || 0);
        setCash(data.cash || 0);
        setWineType(data.wineType || '');
        setDescription(data.description || '');
        setDateFields({ gdDate: data.gdDate ? new Date(data.gdDate) : new Date() });
        SetPhotoUrl(data.photoUrl || "");

        // Correctly populate the entry type states
        const standardEntries = ["malkhanaEntry", "fsl", "kukri", "cashEntry", "wineDaru", "unclaimedEntry"];
        if (data.entryType && !standardEntries.includes(data.entryType)) {
            setDropdownSelection('otherEntry');
            setEntryType(data.entryType);
        } else {
            setDropdownSelection(data.entryType || '');
            setEntryType(data.entryType || '');
        }
    };

    const clearForm = () => {
        setFormData({
            firNo: '', srNo: '', gdNo: '', caseProperty: '', underSection: '', Year: '', policeStation: '', IOName: '', vadiName: '', HM: '', accused: '', place: '', boxNo: '', courtNo: '', courtName: '',
        });
        setExistingId("");
        setStatus('');
        setWine(0);
        setCash(0);
        setWineType('');
        setDescription('');
        setDateFields({ gdDate: new Date() });
        SetPhotoUrl("");
        setDropdownSelection('');
        setEntryType('');
        setFirData([]);
        setSelectedSrNo('');
        if (photoRef.current) photoRef.current.value = '';
    };

    // ✅ FIX: Converted all dropdown options to the correct {value, label} format.
    const entryOptions = [
        { value: "malkhanaEntry", label: "Malkhana Entry" },
        { value: "fsl", label: "FSL" },
        { value: "kukri", label: "Kukri" },
        { value: "cashEntry", label: "Cash Entry" },
        { value: "wineDaru", label: "Wine/Daru" },
        { value: "unclaimedEntry", label: "Unclaimed Entry" },
        { value: "otherEntry", label: "Other Entry" },
    ];
    const statusOptions = [
        { value: "destroy", label: "Destroy" },
        { value: "nilami", label: "Nilami" },
        { value: "pending", label: "Pending" },
        { value: "other", label: "Other" },
        { value: "onCourt", label: "On Court" },
    ];
    const wineOptions = [
        { value: "desi", label: "Desi" },
        { value: "angrezi", label: "Angrezi" },
    ];

    const fields = [
        { name: 'firNo', label: 'FIR No' },
        { name: 'srNo', label: 'Sr. No / Mud No.' },
        { name: 'caseProperty', label: 'Case Property' },
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

    const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleDateChange = (fieldName: string, date: Date | undefined) => setDateFields(prev => ({ ...prev, [fieldName]: date }));

    // ✅ FIX: This handler now correctly manages the "Other Entry" logic.
    const handleEntryTypeSelect = (value: string) => {
        setDropdownSelection(value); // Update the UI state
        if (value === 'otherEntry') {
            setEntryType(''); // Clear the data state to allow user input
        } else {
            setEntryType(value); // Set the data state directly
        }
    };

    const handleSrNoSelectionChange = (srNo: string) => {
        setSelectedSrNo(srNo);
        const selectedData = firData.find((item: any) => item.srNo === srNo);
        if (selectedData) populateForm(selectedData);
    };

    const handleSave = async () => {
        if (dropdownSelection === 'otherEntry' && !entryType) {
            toast.error("Please specify the 'Other' entry type.");
            return;
        }
        setLoading(true);
        try {
            const fullData = { ...formData, status, wine, cash, wineType, entryType, userId: user?.id, photoUrl, description, gdDate: dateFields.gdDate?.toISOString() ?? '' };

            const success = existingId
                ? await updateMalkhanaEntry(existingId, fullData)
                : await addMaalkhanaEntry(fullData);

            if (success) {
                toast.success(existingId ? "Data Updated" : "Data Added");
                clearForm();
            }
        } catch (error) { console.error("Save error:", error); }
        finally { setLoading(false); }
    };

    const handleGetByFir = async () => {
        setSelectedSrNo('');
        const response = await getByFIR(formData.firNo, user?.id);
        if (response?.success) {
            const dataArray = Array.isArray(response.data) ? response.data : [response.data];
            setFirData(dataArray);
            if (dataArray.length === 1) {
                populateForm(dataArray[0]);
                setSelectedSrNo(dataArray[0].srNo);
            } else {
                // Keep FIR no. but clear rest of the form for multi-results
                clearForm();
                handleInputChange('firNo', formData.firNo);
            }
        } else {
            setFirData([]);
            toast.error("FIR not found");
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const uploadedUrl = await uploadToCloudinary(file);
            SetPhotoUrl(uploadedUrl);
            toast.success("Photo uploaded successfully");
        } catch (err) { toast.error("Failed to upload photo"); }
        finally { setLoading(false); }
    };

    const handlePrint = () => {
        const fullData = { ...formData, status, wine, cash, wineType, entryType, photoUrl, description, gdDate: dateFields.gdDate?.toISOString() ?? '' };
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
                    <div className='w-1/2'>
                        <DropDown label='Entry type' selectedValue={dropdownSelection} options={entryOptions} handleSelect={handleEntryTypeSelect} />
                    </div>
                    {/* ✅ FIX: Conditional input for "Other Entry" */}
                    {dropdownSelection === 'otherEntry' && (
                        <div className='w-1/2'>
                            <InputComponent
                                label="Specify Other Entry"
                                value={entryType}
                                setInput={(e) => setEntryType(e.target.value)}
                            />
                        </div>
                    )}
                    <div className={`w-full ml-6 gap-6 ${dropdownSelection === 'wineDaru' ? "flex" : "hidden"} items-center`}>
                        <DropDown label='Wine' selectedValue={wineType} options={wineOptions} handleSelect={setWineType} />
                    </div>
                    <div className={`w-full ml-6 gap-6 ${dropdownSelection === 'wineDaru' ? "flex" : "hidden"} items-center`}>
                        <label className='text-blue-100'>Wine</label>
                        <Input type='number' value={wine} onChange={(e) => setWine(Number(e.target.value))} />
                    </div>
                    <div className={`w-3/4 ml-18 ${dropdownSelection === 'cashEntry' ? "flex flex-col" : "hidden"}`}>
                        <label className='text-blue-100'>Cash</label>
                        <Input className='text-blue-100' type='number' value={cash} onChange={(e) => setCash(Number(e.target.value))} />
                    </div>
                </div>

                <div className='grid lg:grid-cols-2 gap-2'>
                    {fields.map(field => {
                        if (field.name === 'firNo' && dropdownSelection === "unclaimedEntry") return null;
                        if (field.name === 'srNo') {
                            if (firData.length > 1) {
                                return (<div key="srNo-radios" className="col-span-2 flex flex-col gap-1"> <label className='text-blue-100'>Select One Sr. No / Mud No.</label> <div className="glass-effect p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-3"> {firData.filter((item: any) => item && item.srNo).map((item: any) => (<div key={item.id || item.srNo} className="flex items-center gap-2"> <input type="radio" id={`srNo-${item.srNo}`} name="srNoSelection" className="form-radio h-4 w-4" checked={selectedSrNo === item.srNo} onChange={() => handleSrNoSelectionChange(item.srNo)} /> <label htmlFor={`srNo-${item.srNo}`} className="text-blue-100 cursor-pointer">{item.srNo}</label> </div>))} </div> </div>);
                            } else { return (<InputComponent key={field.name} label={field.label} value={formData.srNo} setInput={(e) => handleInputChange(field.name, e.target.value)} />); }
                        }
                        if (field.type === 'dropdown') return <DropDown key={field.name} label={field.label} selectedValue={status} options={field.options || []} handleSelect={setStatus} />;
                        if (field.type === 'textarea') return (<div key={field.name} className='flex flex-col col-span-1 gap-1'> <label className='text-blue-100' htmlFor={field.name}>{field.label}</label> <Textarea className='text-blue-100' id={field.name} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={`Enter ${field.label}`} /> </div>);
                        if (field.type === 'date') return <DatePicker key={field.name} label={field.label} date={dateFields[field.name as keyof typeof dateFields]} setDate={(date) => handleDateChange(field.name, date)} />;
                        return (<div key={field.name}> {field.name === 'firNo' ? (<div className='flex items-end justify-between'> <InputComponent className='w-3/4' label={field.label} value={formData.firNo} setInput={(e) => handleInputChange(field.name, e.target.value)} /> <Button type="button" className="h-10 bg-blue text-white" onClick={handleGetByFir}>Fetch Data</Button> </div>) : (<InputComponent label={field.label} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name, e.target.value)} />)} </div>);
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
                {/* ✅ FIX: Replaced confusing button mapping with clear, individual buttons */}
                <div className='flex w-full px-12 justify-center gap-6 mt-4'>
                    <Button onClick={handleSave} className='cursor-pointer bg-green-600' disabled={loading}>
                        {loading ? <LoaderIcon className='animate-spin' /> : (existingId ? 'Update' : 'Save')}
                    </Button>
                    <Button onClick={handlePrint} className='cursor-pointer bg-blue-600'>
                        Print
                    </Button>
                    {/* Add a disabled state or hide if no record is fetched */}
                    <Button
                        onClick={() => {/* Add delete logic here */ toast.error("Delete function not implemented.") }}
                        className='cursor-pointer bg-red-600'
                        disabled={!existingId}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div >
    );
};

export default Page;
