"use client";
import InputComponent from '@/components/InputComponent';

import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datePicker';
import DropDown from '@/components/ui/DropDown';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useMaalkhanaStore } from '@/store/malkhana/maalkhanaEntryStore';
import { convertUnicodeToKurtidev, kurtidevKeys } from '@/utils/font';
import { uploadToImageKit } from '@/utils/imagekit';
import { Mic, Trash } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import 'regenerator-runtime/runtime';

// Define a type for formData to better manage number/string types
interface FormData {
    firNo: string;
    // Allow srNo to be a string (from input) or number (from store)
    srNo: string | number;
    gdNo: string | number;
    caseProperty: string;
    underSection: string;
    Year: number;
    policeStation: string;
    IOName: string;
    vadiName: string;
    HM: string;
    accused: string;
    place: string;
    boxNo: number;
    courtNo: string;
    courtName: string;
}

const Page = () => {
    // --- Speech Recognition Setup ---
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [textBeforeListening, setTextBeforeListening] = useState('');
    // --- End Speech Recognition Setup ---

    const t = useTranslations('entry');
    const baseKey = 'malkhanaEntryForm';

    const { user } = useAuthStore();
    const { addMaalkhanaEntry, updateMalkhanaEntry, getByFIR, currentEntry } = useMaalkhanaStore();

    const [firData, setFirData] = useState<any[]>([]);
    const [photoUrl, SetPhotoUrl] = useState<string | undefined>("");
    const [currentEntryType, setCurrentEntryType] = useState("");
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
    // Store originalSrNo as string for strict comparison with form input
    const [originalSrNo, setOriginalSrNo] = useState<string>("");
    const [yellowItemPrice, setYellowItemPrice] = useState<number>(0);

    // FIX 1: Initialize gdDate to 'undefined' so it doesn't default to the current date.
    const [dateFields, setDateFields] = useState<{ gdDate?: Date }>({
        gdDate: undefined,
    });

    const [selectedSrNo, setSelectedSrNo] = useState<string>('');

    const [formData, setFormData] = useState<FormData>({
        firNo: '',
        srNo: '', // Kept as string for input component compatibility
        gdNo: '', // Kept as string for input component compatibility
        caseProperty: '',
        underSection: '',
        Year: 2026,
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
        // Store originalSrNo as a string for comparison with string-based form input
        setOriginalSrNo(data.srNo ? String(data.srNo) : "");
        setFormData({
            firNo: data.firNo || '',
            // Keeping it as a string here for compatibility with the InputComponent, but storing the actual value.
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

        // Determine the correct dropdown key from the fetched entryType
        const fetchedEntryType = data.entryType || '';
        const entryTypeKey = entryOptionKeys.find(key => key === fetchedEntryType) || (fetchedEntryType ? 'other' : '');

        setCurrentEntryType(fetchedEntryType);
        setDropdownSelection(entryTypeKey);

        if (entryTypeKey === 'other') {
            // If it's 'other', set the custom text description as 'entryType'
            setEntryType(fetchedEntryType);
        } else {
            // Otherwise, clear the custom text field
            setEntryType('');
        }

        setDescription(data.description || '');
        // FIX 2: Only create a Date object if gdDate exists, otherwise set to 'undefined'
        setDateFields({
            gdDate: data.gdDate ? new Date(data.gdDate) : undefined
        });
        SetPhotoUrl(data.photoUrl || "");
    };


    useEffect(() => {
        if (currentEntry) {
            populateForm(currentEntry)
        }
    }, [currentEntry])

    const photoRef = useRef<HTMLInputElement>(null);

    // FIX 3: New function to clear most fields *except* firNo and ID/SRNo trackers temporarily.
    const clearSpecificFields = () => {
        setFormData(prev => ({
            ...prev,
            srNo: '', gdNo: '', caseProperty: '', underSection: '', Year: 2025, policeStation: '', IOName: '', vadiName: '', HM: '', accused: '', place: '', boxNo: 0, courtNo: '', courtName: ''
        }));
        setStatus(''); setWine(0); setCash(0); setWineType(''); setYellowItemPrice(0); setDropdownSelection(''); setEntryType(''); setDescription('');
        // FIX 3 (cont.): Clear gdDate to undefined
        setDateFields({ gdDate: undefined });
        SetPhotoUrl("");
        setFirData([]);
        setSelectedSrNo('');
        if (photoRef.current) photoRef.current.value = '';
        setExistingId(""); // Clear IDs in specific clear as well, to be safe before population
        setOriginalSrNo("");
    };

    // FIX 4: Original clearForm for a full reset.
    const clearForm = () => {
        clearSpecificFields();
        setFormData(prev => ({ ...prev, firNo: '' })); // Clear firNo only on full form clear
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        let finalValue = value;

        // 🎯 CORE LOGIC HERE: Check if the field requires KrutiDev conversion
        if (kurtidevKeys.includes(field)) {
            // 1. Convert the Unicode input string to the KrutiDev character sequence
            finalValue = convertUnicodeToKurtidev(value);
        }

        // This existing logic correctly converts numeric fields from string input to number/empty string
        if (['srNo', 'gdNo', 'Year', 'boxNo'].includes(field)) {
            // Using Number(finalValue) allows '0' to be valid, but handles empty string gracefully.
            setFormData(prev => ({ ...prev, [field]: finalValue === '' ? '' : Number(finalValue) }));
        } else {
            setFormData(prev => ({ ...prev, [field]: finalValue }));
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

        const currentFirNo = formData.firNo; // Preserve FIR No
        setSelectedSrNo('');

        // Use clearSpecificFields to clear everything *except* firNo logic
        clearSpecificFields();

        // Re-set FIR No after clearing the form (as clearSpecificFields resets formData too)
        setFormData(prev => ({ ...prev, firNo: currentFirNo }));

        try {
            const response = await getByFIR(currentFirNo, user?.id);
            if (response?.success && response.data && response.data.length > 0) {
                const dataArray = Array.isArray(response.data) ? response.data : [response.data];
                setFirData(dataArray);
                if (dataArray.length === 1) {
                    populateForm(dataArray[0]);
                    setSelectedSrNo(String(dataArray[0].srNo));
                } else {
                    toast.success(`multiple Entries Found`);
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

    console.log(`ID: ${existingId}, Original SR No: ${originalSrNo}, Current SR No: ${formData.srNo} `);


    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const uploadedUrl = await uploadToImageKit(file, "malkhana-entry");
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

        const requiredFields: { key: keyof FormData | 'gdDate', value: any }[] = [
            { key: 'caseProperty', value: formData.caseProperty },
            { key: 'gdNo', value: formData.gdNo },
            // FIX: gdDate is now optional. We only check if it is required if the entry is NOT "unclaimed"
            // We check for its validity in the final payload
            { key: 'Year', value: formData.Year },
            { key: 'policeStation', value: formData.policeStation },
        ];



        if (dropdownSelection !== 'unclaimed') {
            requiredFields.push({ key: 'firNo', value: formData.firNo });
        }

        // Add gdDate requirement if not unclaimed AND not defined
        if (dropdownSelection !== 'unclaimed' && !dateFields.gdDate) {
            requiredFields.push({ key: 'gdDate', value: dateFields.gdDate });
        }


        const fieldKeyMap: { [key: string]: string } = {
            firNo: 'firNo', srNo: 'srNo', caseProperty: 'caseProperty', gdNo: 'gdNo', gdDate: 'gdDate', Year: 'year', policeStation: 'policeStation', IOName: 'ioName', vadiName: 'vadiName', status: 'status', HM: 'hm', accused: 'accused', underSection: 'underSection', description: 'description', place: 'place', boxNo: 'boxNo', courtNo: 'courtNo', courtName: 'courtName'
        };

        const emptyFields = requiredFields
            .filter(field => !field.value && field.value !== 0)
            .map(field => t(`${baseKey}.fields.${fieldKeyMap[field.key as string]}` || field.key));

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

            // Explicitly ensure srNo is a Number for the backend payload
            const currentSrNo = formData.srNo ? Number(formData.srNo) : 0;

            const fullData = {
                ...formData,
                // Use the confirmed number value for the payload
                srNo: currentSrNo,
                status: finalStatus,
                wine: Number(wine),
                cash: Number(cash),
                wineType,
                // If 'other' is selected, use the text from the 'entryType' state.
                entryType: dropdownSelection === 'other' ? entryType : dropdownSelection,
                userId: user?.id,
                photoUrl,
                description,
                yellowItemPrice: Number(yellowItemPrice),
                gdNo: formData.gdNo ? Number(formData.gdNo) : 0, // Ensure gdNo is also a number
                // FIX 5: CRUCIAL - Only send gdDate if it is a valid Date object (not undefined)
                gdDate: dateFields.gdDate instanceof Date && !isNaN(dateFields.gdDate.getTime())
                    ? dateFields.gdDate.toISOString()
                    : null, // Send null if the date is not set, preventing it from defaulting to current date
                isRelease, isReturned
            };

            let response;

            // This logic is now correctly guarded by the existingId and originalSrNo state
            if (String(currentSrNo) === originalSrNo && existingId) {
                // UPDATE: existingId is present and SR No is unchanged
                response = await updateMalkhanaEntry(existingId, fullData);

                if (response) {
                    toast.success("Updated Entry");
                }
            } else if (String(currentSrNo) !== originalSrNo || !existingId) {
                // CREATE NEW: existingId is present but SR No changed (implying a new entry) 
                // OR CREATE NEW: No existingId (brand new entry)
                response = await addMaalkhanaEntry(fullData);
                if (response) {
                    toast.success(t(`${baseKey}.toasts.newEntryWithNewSrNo`));
                }
            } else {
                // CREATE NEW: No existingId (brand new entry) - Fallback for clarity
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
            toast.error(t(`Error while saving entry `));
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
                    <div className={`w-full ml-6 gap-6 
                        ${dropdownSelection === 'wine' ? "" : "hidden"} items-center`}>
                        <DropDown label={t(`${baseKey}.wineSection.typeLabel`)} selectedValue={wineType} options={wineTypeOptions} handleSelect={setWineType} />
                    </div>
                    <div className={`w-full ml-6 gap-6 ${dropdownSelection === 'wine' ? "flex" : "hidden"} items-center`}>
                        <label className='text-blue-100'>{`Total ${wineType} `}</label>
                        <Input type='number' value={wine} onChange={(e) => setWine(Number(e.target.value))} />
                    </div>
                    <div className={`w-3/4 ml-18 ${dropdownSelection === 'cash' ? "flex flex-col" : "hidden"}`}>
                        <label className='text-blue-100'>{t(`${baseKey}.cashSection.label`)}</label>
                        <Input className='text-blue-100' type='number' value={cash} onChange={(e) => setCash(Number(e.target.value))} />
                    </div>

                </div>
                <div className='my-2 '>
                    <h1 className='text-blue-100/60'>
                        Current Status : <span className='text-blue-100'>
                            {status}
                        </span>
                    </h1>
                    <h1 className='text-blue-100/60'>
                        Current Entry Type : <span className='text-blue-100'>
                            {currentEntryType}
                        </span>
                    </h1>
                </div>


                <div className='grid lg:grid-cols-2 gap-2'>

                    {fields.map(field => {
                        if (field.name === 'firNo' && dropdownSelection === "unclaimed") return null;

                        // --- CHANGED LOGIC START ---
                        if (field.name === 'srNo') {
                            return (
                                <div key="srNo-container" className={firData.length > 1 ? "col-span-2 flex justify-between items-center  gap-4" : ""}>
                                    {firData.length > 1 && (
                                        <div className="gap-1 w-1/2">
                                            <label className='text-blue-100'>{t(`${baseKey}.fields.selectSrNo`)}</label>
                                            <div className="glass-effect w-full  p-3 rounded-md  flex   md:grid-cols-4 gap-3">
                                                {firData.filter((item: any) => item && item.srNo).map((item: any) => (
                                                    <div key={item.id || item.srNo} className="flex items-center bg-blue/20 px-4 py-2  rounded-xl gap-2">
                                                        <input
                                                            type="radio"
                                                            id={`srNo-${item.srNo}`}
                                                            name="srNoSelection"
                                                            className="form-radio h-4 w-4"
                                                            checked={selectedSrNo === String(item.srNo)}
                                                            onChange={() => handleSrNoSelectionChange(String(item.srNo))}
                                                        />
                                                        <label htmlFor={`srNo-${item.srNo}`} className="text-blue-100 cursor-pointer">{item.srNo}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className=' w-1/2'>

                                        <InputComponent
                                            label={field.label}
                                            type={field.type}
                                            value={formData.srNo}
                                            setInput={(e) => handleInputChange('srNo', e.target.value)}
                                        />
                                    </div>
                                </div>
                            );
                        }
                        // --- CHANGED LOGIC END ---

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
                        const isKurtidevField = kurtidevKeys.includes(field.name);
                        return (
                            <div key={field.name}>
                                {

                                    field.name === 'firNo' ? (
                                        <div className='flex items-end justify-between'>
                                            <InputComponent
                                                className='w-3/4'
                                                label={field.label}
                                                value={formData.firNo}
                                                setInput={(e) => handleInputChange(field.name as keyof FormData, e.target.value)}
                                                inputClass={isKurtidevField ? 'font-kurtidev' : ''}
                                            />
                                            <Button type="button" className="h-10 lg:text-base bg-blue text-white" onClick={handleGetByFir}>{t(`${baseKey}.buttons.fetchData`)}</Button>
                                        </div>
                                    ) : (
                                        <InputComponent label={field.label} type={field.type} value={formData[field.name as keyof FormData]} setInput={(e) => handleInputChange(field.name as keyof FormData, e.target.value)} />
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
                        <div className=' flex size-1/4 flex-col gap-4 relative'>
                            {photoUrl && <Button onClick={() => {
                                SetPhotoUrl("")
                                if (photoRef.current) photoRef.current.value = '';

                            }} className='absolute right-0 bg-red-800 hover:bg-red-500 cursor-pointer'><Trash /></Button>}
                            {photoUrl && <img src={photoUrl} className='rounded-md 
                            border' alt="upload preview" />}
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