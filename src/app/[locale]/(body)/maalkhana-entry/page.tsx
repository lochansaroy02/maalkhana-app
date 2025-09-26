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
import { Mic, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import 'regenerator-runtime/runtime';

const Page = () => {
    // --- Speech Recognition Setup ---
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [textBeforeListening, setTextBeforeListening] = useState('');
    // --- End Speech Recognition Setup ---

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
    const [isReturned, setIsReturned] = useState(false);
    const [isRelease, setIsRelease] = useState(false);
    const [existingId, setExistingId] = useState<string>("");
    const [originalSrNo, setOriginalSrNo] = useState<string>("");
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
        Year: 2025,
        policeStation: '',
        IOName: '',
        vadiName: '',
        HM: '',
        accused: '',
        place: '',
        boxNo: 0,
        courtNo: '',
        courtName: '',
    });

    useEffect(() => {
        if (listening) {
            const newDescription = textBeforeListening ? `${textBeforeListening} ${transcript}` : transcript;
            setDescription(newDescription);
        }
    }, [transcript, listening, textBeforeListening]);

    const toggleListening = () => {
        if (!browserSupportsSpeechRecognition) {
            toast.error("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            setTextBeforeListening(description);
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
        }
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

    const populateForm = (data: any) => {
        if (!data) return;
        setExistingId(data.id || "");
        setOriginalSrNo(data.srNo || "");
        setFormData({
            firNo: data.firNo || '',
            srNo: data.srNo ? String(data.srNo) : '',
            underSection: data.underSection || '',
            caseProperty: data.caseProperty || '',
            gdNo: data.gdNo ? String(data.gdNo) : '',
            Year: data.Year || 2025,
            policeStation: data.policeStation || '',
            IOName: data.IOName || '',
            vadiName: data.vadiName || '',
            HM: data.HM || '',
            accused: data.accused || '',
            place: data.place || '',
            boxNo: data.boxNo || 0,
            courtNo: data.courtNo || '',
            courtName: data.courtName || '',
        });
        setStatus(data.status || '');
        setYellowItemPrice(data.yellowItemPrice || 0);
        setWine(data.wine || 0);
        setCash(data.cash || 0);
        setWineType(data.wineType || '');

        const entryTypeKey = data.entryTypeKey || '';
        setDropdownSelection(entryTypeKey);
        if (entryTypeKey === 'other') {
            setEntryType(data.entryType);
        } else {
            setEntryType('');
        }

        setDescription(data.description || '');
        setDateFields({ gdDate: data.gdDate ? new Date(data.gdDate) : new Date() });
        SetPhotoUrl(data.photoUrl || "");
    };

    const photoRef = useRef<HTMLInputElement>(null);

    const clearForm = () => {
        setFormData({
            firNo: '', srNo: '', gdNo: '', caseProperty: '', underSection: '', Year: 2025, policeStation: '', IOName: '', vadiName: '', HM: '', accused: '', place: '', boxNo: 0, courtNo: '', courtName: ''
        });
        setExistingId("");
        setOriginalSrNo("");
        setStatus(''); setWine(0); setCash(0); setWineType(''); setYellowItemPrice(0); setDropdownSelection(''); setEntryType(''); setDescription('');
        setDateFields({ gdDate: new Date() });
        SetPhotoUrl("");
        setFirData([]);
        setSelectedSrNo('');
        if (photoRef.current) photoRef.current.value = '';
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        if (['srNo', 'gdNo', 'Year', 'boxNo'].includes(field)) {
            setFormData(prev => ({ ...prev, [field]: value === '' ? '' : Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleDateChange = (fieldName: string, date: Date | undefined) => {
        setDateFields(prev => ({ ...prev, [fieldName]: date }));
    };

    const handleEntryTypeSelect = (value: string) => {
        setDropdownSelection(value);
        if (value !== 'other') {
            setEntryType('');
        }
    };

    const handleSrNoSelectionChange = (srNo: string) => {
        setSelectedSrNo(srNo);
        const selectedData = firData.find((item: any) => String(item.srNo) === srNo);
        if (selectedData) populateForm(selectedData);
    };

    const handleGetByFir = async () => {
        if (!formData.firNo) {
            toast.error(t(`${baseKey}.toasts.enterFirNo`));
            return;
        }
        setSelectedSrNo('');
        clearForm(); // Note: This will clear firNo, so we re-set it.
        setFormData(prev => ({ ...prev, firNo: formData.firNo }));

        try {
            const response = await getByFIR(formData.firNo, user?.id);
            if (response?.success && response.data && response.data.length > 0) {
                const dataArray = Array.isArray(response.data) ? response.data : [response.data];
                setFirData(dataArray);
                if (dataArray.length === 1) {
                    populateForm(dataArray[0]);
                    setSelectedSrNo(String(dataArray[0].srNo));
                } else {
                    toast.success(t(`${baseKey}.toasts.multipleEntriesFound`));
                }
            } else {
                setFirData([]);
                toast.error(t(`${baseKey}.toasts.firNotFound`));
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error(t(`${baseKey}.toasts.fetchError`));
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
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
            ...formData,
            status, wine, cash, wineType, entryType: dropdownSelection === 'other' ? entryType : dropdownSelection, photoUrl, description, gdDate: dateFields.gdDate?.toISOString() ?? '',
        };
        if (!fullData.firNo && !fullData.srNo) {
            toast.error(t(`${baseKey}.toasts.printError`));
            return;
        }
        sessionStorage.setItem('printableEntryData', JSON.stringify(fullData));
        window.open('/details', '_blank');
    };

    const handleSave = async () => {
        if (loading) return;
        setLoading(true);

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
            .filter(field => !field.value && field.value !== 0)
            .map(field => t(`${baseKey}.fields.${fieldKeyMap[field.key]}` || field.key));

        if (emptyFields.length > 0) {
            toast.error(`${t('validation.fillRequiredFields')}: ${emptyFields.join(', ')}`);
            setLoading(false);
            return;
    }

        if (dropdownSelection === 'other' && !entryType) {
            toast.error(t(`${baseKey}.toasts.specifyOtherError`));
            setLoading(false);
            return;
        }

        try {
            const finalStatus = status === 'other' ? otherStatus : status;

            // --- FIX IS HERE ---
            const fullData = {
                ...formData,
                status: finalStatus,
                wine: Number(wine),
                cash: Number(cash),
                wineType,
                // If 'other' is selected, use the text from the 'entryType' state.
                // Otherwise, use the value from the dropdown selection directly (e.g., "malkhana", "fsl").
                entryType: dropdownSelection === 'other' ? entryType : dropdownSelection,
                userId: user?.id,
                photoUrl,
                description,
                yellowItemPrice: Number(yellowItemPrice),
                gdDate: dateFields.gdDate?.toISOString() ?? '',
                isRelease, isReturned
            };

            let response;

            if (existingId && String(formData.srNo) === originalSrNo) {
                response = await updateMalkhanaEntry(existingId, fullData);


                if (response) {
                    toast.success(t(`${baseKey}.toasts.updateSuccess`));
                }
            } else if (existingId && String(formData.srNo) !== originalSrNo) {
                // This logic implies creating a new entry if SrNo changes for an existing record
                response = await addMaalkhanaEntry(fullData);
                if (response) {
                    toast.success(t(`${baseKey}.toasts.newEntryWithNewSrNo`));
                }
            } else {
                response = await addMaalkhanaEntry(fullData);
                if (response) {
                    toast.success("entry added with new SR No ");
                }
            }

            if (response) {
                clearForm();
            } else {
                // Use a more specific error from the backend if available
                toast.error("cant added entry");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error(t(`${baseKey}.toasts.saveError`));
        } finally {
            setLoading(false);
        }
    };


    const fieldKeyMap: { [key: string]: string } = {
        firNo: 'firNo', srNo: 'srNo', caseProperty: 'caseProperty', gdNo: 'gdNo', gdDate: 'gdDate', Year: 'year', policeStation: 'policeStation', IOName: 'ioName', vadiName: 'vadiName', status: 'status', HM: 'hm', accused: 'accused', underSection: 'underSection', description: 'description', place: 'place', boxNo: 'boxNo', courtNo: 'courtNo', courtName: 'courtName'
    };

    const fields = Object.keys(fieldKeyMap).map(fieldName => ({
        name: fieldName,
        label: t(`${baseKey}.fields.${fieldKeyMap[fieldName]}`),
        type: (fieldName === 'gdDate') ? 'date' : (fieldName === 'status') ? 'dropdown' : (fieldName === 'description') ? 'textarea' : ['srNo', 'gdNo', 'Year', 'boxNo'].includes(fieldName) ? 'number' : 'text',
        options: (fieldName === 'status') ? statusOptions : undefined
    }));

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
                                <InputComponent label={t(`${baseKey}.entryType.yellowItemPrice`)} type='number' value={yellowItemPrice} setInput={(e) => setYellowItemPrice(Number(e.target.value))} />
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
                                                    <input type="radio" id={`srNo-${item.srNo}`} name="srNoSelection" className="form-radio h-4 w-4" checked={selectedSrNo === String(item.srNo)} onChange={() => handleSrNoSelectionChange(String(item.srNo))} />
                                                    <label htmlFor={`srNo-${item.srNo}`} className="text-blue-100 cursor-pointer">{item.srNo}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            } else {
                                return <InputComponent key={field.name} label={field.label} type={field.type} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name as keyof typeof formData, e.target.value)} />;
                            }
                        }

                        if (field.type === 'dropdown') {
                            return <DropDown key={field.name} label={field.label} selectedValue={status} options={field.options || []} handleSelect={setStatus} />;
                        }
                        if (field.type === 'textarea') {
                            return (
                                <div key={field.name} className='flex flex-col col-span-1 gap-1'>
                                    <label className='text-blue-100' htmlFor={field.name}>{field.label}</label>
                                    <div className='relative w-full'>
                                        <Textarea
                                            className='text-blue-100 pr-12'
                                            id={field.name}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={t(`${baseKey}.placeholders.enterDescription`)}
                                        />
                                        <Button
                                            type="button"
                                            onClick={toggleListening}
                                            className={`absolute top-1/2 right-2 -translate-y-1/2 p-2 h-auto rounded-full ${listening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                                        >
                                            <Mic size={16} />
                                        </Button>
                                    </div>
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
                                        <InputComponent className='w-3/4' label={field.label} value={formData.firNo} setInput={(e) => handleInputChange(field.name as keyof typeof formData, e.target.value)} />
                                        <Button type="button" className="h-10 lg:text-base bg-blue text-white" onClick={handleGetByFir}>{t(`${baseKey}.buttons.fetchData`)}</Button>
                                    </div>
                                ) : (
                                    <InputComponent label={field.label} type={field.type} value={formData[field.name as keyof typeof formData]} setInput={(e) => handleInputChange(field.name as keyof typeof formData, e.target.value)} />
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
                <div className='flex w-full justify-center'>
                    <div className='flex w-1/2 px-12 justify-between mt-4'>
                        <Button onClick={handleSave} className='cursor-pointer' disabled={loading}>
                            {loading ? <LoaderIcon className='animate-spin' /> :
                                (existingId ? t(`${baseKey}.buttons.update`) : t(`${baseKey}.buttons.save`))}
                        </Button>
                        <Button onClick={handlePrint} className='cursor-pointer'>
                            {t(`${baseKey}.buttons.print`)}
                        </Button>
                        <Button onClick={clearForm} className='cursor-pointer'>
                            {t(`${baseKey}.buttons.clear`)}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;