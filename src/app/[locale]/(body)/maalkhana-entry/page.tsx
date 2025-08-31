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
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

const Page = () => {
    const t = useTranslations('entry');
    const baseKey = 'malkhanaEntryForm';

    const { user } = useAuthStore();
    const { addMaalkhanaEntry, updateMalkhanaEntry, getByFIR } = useMaalkhanaStore();

    const [firData, setFirData] = useState<any[]>([]);
    const [photoUrl, SetPhotoUrl] = useState("");
    const [dropdownSelection, setDropdownSelection] = useState('');
    const [otherStatus, setOtherStatus] = useState('');
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
        firNo: '', srNo: '', gdNo: '', caseProperty: '', underSection: '', Year: '', policeStation: '', IOName: '', vadiName: '', HM: '', accused: '', place: '', boxNo: '', courtNo: '', courtName: '',
    });

    const populateForm = (data: any) => {
        if (!data) return;
        setExistingId(data.id || "");
        setFormData({
            firNo: data.firNo || '', srNo: data.srNo || '', underSection: data.underSection || '', caseProperty: data.caseProperty || '', gdNo: data.gdNo || '', Year: data.Year || '', policeStation: data.policeStation || '', IOName: data.IOName || '', vadiName: data.vadiName || '', HM: data.HM || '', accused: data.accused || '', place: data.place || '', boxNo: data.boxNo || '', courtNo: data.courtNo || '', courtName: data.courtName || '',
        });
        setStatus(data.status || '');
        setYellowItemPrice(data.yellowItemPrice || 0)
        setWine(data.wine || 0);
        setCash(data.cash || 0);
        setWineType(data.wineType || '');

        const entryTypeKey = data.entryTypeKey || '';
        setDropdownSelection(entryTypeKey);
        if (entryTypeKey === 'other') {
            setEntryType(data.entryType);
        } else {
            setEntryType(t(`${baseKey}.entryType.options.${entryTypeKey}`));
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
        setStatus(''); setWine(0); setCash(0); setWineType(''); setYellowItemPrice(0); setDropdownSelection(''); setEntryType(''); setDescription('');
        setDateFields({ gdDate: new Date() });
        SetPhotoUrl("");
        if (photoRef.current) photoRef.current.value = '';
    };

    const entryOptionKeys = ["malkhana", "fsl", "kurki", "cash", "wine", "unclaimed", "other", "yellowItem"];
    const entryOptions = entryOptionKeys.map(key => ({
        value: key,
        label: t(`${baseKey}.entryType.options.${key}`)
    }));

    const statusOptionKeys = ["destroy", "nilami", "pending", "other", "onCourt"];
    const statusOptions = statusOptionKeys.map(key => ({
        value: key,
        label: t(`${baseKey}.statusOptions.${key}`)
    }));

    const wineTypeOptions = [
        { value: 'desi', label: t(`${baseKey}.wineSection.options.desi`) },
        { value: 'angrezi', label: t(`${baseKey}.wineSection.options.angrezi`) }
    ];

    const fieldKeyMap: { [key: string]: string } = {
        firNo: 'firNo', srNo: 'srNo', caseProperty: 'caseProperty', gdNo: 'gdNo', gdDate: 'gdDate', Year: 'year', policeStation: 'policeStation', IOName: 'ioName', vadiName: 'vadiName', status: 'status', HM: 'hm', accused: 'accused', underSection: 'underSection', description: 'description', place: 'place', boxNo: 'boxNo', courtNo: 'courtNo', courtName: 'courtName'
    };

    const fields = Object.keys(fieldKeyMap).map(fieldName => ({
        name: fieldName,
        label: t(`${baseKey}.fields.${fieldKeyMap[fieldName]}`),
        type: (fieldName === 'gdDate') ? 'date' : (fieldName === 'status') ? 'dropdown' : (fieldName === 'description') ? 'textarea' : 'text',
        options: (fieldName === 'status') ? statusOptions : undefined
    }));

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (fieldName: string, date: Date | undefined) => {
        setDateFields(prev => ({ ...prev, [fieldName]: date }));
    };

    const handleEntryTypeSelect = (value: string) => {
        setDropdownSelection(value);
        if (value === 'other') {
            setEntryType('');
        } else {
            setEntryType(t(`${baseKey}.entryType.options.${value}`));
        }
    };

    const photoRef = useRef<HTMLInputElement>(null);

    const handleSrNoSelectionChange = (srNo: string) => {
        setSelectedSrNo(srNo);
        const selectedData = firData.find((item: any) => item.srNo === srNo);
        if (selectedData) populateForm(selectedData);
    };

    const handleSave = async () => {
        if (loading) return;

        const requiredFields: { key: string, value: any }[] = [
            { key: 'caseProperty', value: formData.caseProperty },
            { key: 'gdNo', value: formData.gdNo },
            { key: 'gdDate', value: dateFields.gdDate },
            { key: 'Year', value: formData.Year },
            { key: 'policeStation', value: formData.policeStation },
        ];

        if (dropdownSelection !== 'unclaimed') {
            requiredFields.push({ key: 'firNo', value: formData.firNo });
        }

        const emptyFields = requiredFields
            .filter(field => !field.value)
            .map(field => t(`${baseKey}.fields.${fieldKeyMap[field.key]}`));

        if (emptyFields.length > 0) {
            toast.error('Please fill all required fields');
            return;
        }

        if (dropdownSelection === 'other' && !entryType) {
            toast.error(t(`${baseKey}.toasts.specifyOtherError`));
            return;
        }

        setLoading(true);

        try {
            const finalStatus = status === 'other' ? otherStatus : status;

            const fullData = {
                ...formData,
                status: finalStatus,
                wine,
                cash,
                wineType,
                entryType,
                entryTypeKey: dropdownSelection,
                userId: user?.id,
                photoUrl,
                description,
                yellowItemPrice,
                gdDate: dateFields.gdDate?.toISOString() ?? '',
            };

            let success = false;
            if (existingId) {
                success = await updateMalkhanaEntry(existingId, fullData);
                toast.success(t(`${baseKey}.toasts.updateSuccess`));
            } else {
                success = await addMaalkhanaEntry(fullData);
                toast.success(t(`${baseKey}.toasts.addSuccess`));
            }

            if (success) {
                clearForm();
                setFormData({ firNo: '', srNo: '', gdNo: '', caseProperty: '', underSection: '', Year: '', policeStation: '', IOName: '', vadiName: '', HM: '', accused: '', place: '', boxNo: '', courtNo: '', courtName: '' });
                setFirData([]);
                setSelectedSrNo('');
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error(t(`${baseKey}.toasts.saveError`));
        } finally {
            setLoading(false);
        }
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
                clearForm();
            }
        } else {
            setFirData([]);
            toast.error(t(`${baseKey}.toasts.firNotFound`));
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const uploadedUrl = await uploadToCloudinary(file);
            SetPhotoUrl(uploadedUrl);
            toast.success(t(`${baseKey}.toasts.photoUploadSuccess`));
        } catch (err) {
            console.error(err);
            toast.error(t(`${baseKey}.toasts.photoUploadError`));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const fullData = {
            ...formData, status, wine, cash, wineType, entryType, photoUrl, description, gdDate: dateFields.gdDate?.toISOString() ?? '',
        };
        if (!fullData.firNo && !fullData.srNo) {
            toast.error(t(`${baseKey}.toasts.printError`));
            return;
        }
        sessionStorage.setItem('printableEntryData', JSON.stringify(fullData));
        window.open('/details', '_blank');
    };

    return (
        <div className='glass-effect'>
            <div className='bg-maroon py-4 border border-gray-400 rounded-t-xl flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>{t(`${baseKey}.title`)}</h1>
            </div>
            <div className='px-8 py-4 rounded-b-md'>
                <div className='py-2 flex items-end gap-6'>
                    <div className='flex items-end gap-6 w-3/4'>
                        <div className={dropdownSelection === 'other' ? 'w-1/2' : 'w-1/2'}>
                            <DropDown label={t(`${baseKey}.entryType.label`)} selectedValue={dropdownSelection} options={entryOptions} handleSelect={handleEntryTypeSelect} />
                        </div>
                        {dropdownSelection === 'other' && (
                            <div className='w-1/2'>
                                <InputComponent label={t(`${baseKey}.entryType.specifyOther`)} value={entryType} setInput={(e) => setEntryType(e.target.value)} />
                            </div>
                        )}
                        {dropdownSelection === 'yellowItem' && (
                            <div className='w-1/2'>
                                <InputComponent label={t(`${baseKey}.entryType.yellowItemPrice`)} value={yellowItemPrice} setInput={(e) => setYellowItemPrice(Number(e.target.value))} />
                            </div>
                        )}
                    </div>
                    <div className={`w-full ml-6 gap-6 ${dropdownSelection === 'wine' ? "flex" : "hidden"} items-center`}>
                        <DropDown label={t(`${baseKey}.wineSection.typeLabel`)} selectedValue={wineType} options={wineTypeOptions} handleSelect={setWineType} />
                    </div>
                    <div className={`w-full ml-6 gap-6 ${dropdownSelection === 'wine' ? "flex" : "hidden"} items-center`}>
                        <label className='text-blue-100'>{t(`${baseKey}.wineSection.quantityLabel`)}</label>
                        <Input type='number' value={wine} onChange={(e) => setWine(Number(e.target.value))} />
                    </div>
                    <div className={`w-3/4 ml-18 ${dropdownSelection === 'cash' ? "flex flex-col" : "hidden"}`}>
                        <label className='text-blue-100'>{t(`${baseKey}.cashSection.label`)}</label>
                        <Input className='text-blue-100' type='number' value={cash} onChange={(e) => setCash(Number(e.target.value))} />
                    </div>
                </div>

                <div className='grid lg:grid-cols-2 gap-2'>
                    {fields.map(field => {
                        if (field.name === 'firNo' && dropdownSelection === "unclaimed") return null;
                        if (field.name === 'srNo') {
                            if (firData.length > 1) {
                                return (
                                    <div key="srNo-radios" className="col-span-2 flex flex-col gap-1">
                                        <label className='text-blue-100'>{t(`${baseKey}.fields.selectSrNo`)}</label>
                                        <div className="glass-effect p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {firData.filter((item: any) => item && item.srNo).map((item: any) => (
                                                <div key={item.id || item.srNo} className="flex items-center gap-2">
                                                    <input type="radio" id={`srNo-${item.srNo}`} name="srNoSelection" className="form-radio h-4 w-4" checked={selectedSrNo === item.srNo} onChange={() => handleSrNoSelectionChange(item.srNo)} />
                                                    <label htmlFor={`srNo-${item.srNo}`} className="text-blue-100 cursor-pointer">{item.srNo}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            } else {
                                return <InputComponent key={field.name} label={field.label} value={formData.srNo} setInput={(e) => handleInputChange(field.name, e.target.value)} />;
                            }
                        }

                        if (field.type === 'dropdown') {
                            return <DropDown key={field.name} label={field.label} selectedValue={status} options={field.options || []} handleSelect={setStatus} />;
                        }
                        if (field.type === 'textarea') {
                            return (
                                <div key={field.name} className='flex flex-col col-span-1 gap-1'>
                                    <label className='text-blue-100' htmlFor={field.name}>{field.label}</label>
                                    <Textarea className='text-blue-100' id={field.name} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t(`${baseKey}.placeholders.enterDescription`)} />
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
                                        <InputComponent className='w-3/4' label={field.label} value={formData.firNo} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                        <Button type="button" className="h-10 lg:text-base bg-blue text-white" onClick={handleGetByFir}>{t(`${baseKey}.buttons.fetchData`)}</Button>
                                    </div>
                                ) : (
                                    <InputComponent label={field.label} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name, e.target.value)} />
                                )}
                            </div>
                        );
                    })}
                    {status === 'other' && (
                        <InputComponent label='Other Status' setInput={(e) => setOtherStatus(e.target.value)} value={otherStatus} />
                    )}
                </div>

                <div className='w-full'>
                    <div className='flex flex-row mt-4 gap-2'>
                        <div className='w-[40%]'>
                            <label className='text-nowrap text-blue-100' htmlFor="photo">{t(`${baseKey}.photoUpload.label`)}</label>
                            <input ref={photoRef} className='text-blue-100 rounded-xl glass-effect px-2 py-1' id="photo" type='file' onChange={handlePhotoChange} />
                        </div>
                        <div className='w-[60%] flex flex-col gap-4 relative'>
                            {photoUrl && <Button onClick={() => SetPhotoUrl("")} className='absolute right-0 bg-red-800 hover:bg-red-500 cursor-pointer'><Trash /></Button>}
                            {photoUrl && <img src={photoUrl} className='rounded-md w-full h-full border' alt="upload preview" />}
                        </div>
                    </div>
                </div>
                <div className='flex w-full px-12 justify-between mt-4'>
                    {[{ key: 'save', action: handleSave }, { key: 'print', action: handlePrint }].map((item) => (
                        <Button key={item.key} onClick={item.action} className='cursor-pointer'>
                            {loading && item.key === "save" ? <LoaderIcon className='animate-spin' /> : t(`${baseKey}.buttons.${item.key}`)}
                        </Button>
                    ))}
                </div>
            </div>
    </div >
    );
};

export default Page;