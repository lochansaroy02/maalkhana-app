"use client";

import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datePicker';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useReleaseStore } from '@/store/releaseStore';
import { uploadToImageKit } from '@/utils/imagekit';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

// Helper function to format Date object for the API
const formatDateForApi = (date: Date | undefined): string => {
    if (date) {
        return date.toISOString();
    }
    return "";
};

interface FormData {
    firNo: string;
    srNo: string;
    underSection: string;
    releaseItemName: string;
    receiverName: string;
    fathersName: string;
    address: string;
    mobile: string;
    policeStation: string;
    releaseOrderedBy: string;
}

const Page = () => {
    const t = useTranslations('maalkhanaReleaseForm');

    const { user } = useAuthStore();
    const { fetchByFIR } = useReleaseStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [type, setType] = useState<string>("");
    const [existingId, setExistingId] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');

    const [formData, setFormData] = useState<FormData>({
        firNo: '', srNo: '', underSection: '', releaseItemName: "", receiverName: "", fathersName: "", address: "", mobile: "", policeStation: "", releaseOrderedBy: ""
    });

    const [releaseDate, setReleaseDate] = useState<Date | undefined>(undefined);
    const [caseProperty, setCaseProperty] = useState('');
    const photoRef = useRef<HTMLInputElement>(null);
    const documentRef = useRef<HTMLInputElement>(null);
    console.log(type);
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const fillForm = (data: any) => {
        if (!data) return;
        const recordId = data.id || data._id;
        setExistingId(recordId);
        setCaseProperty(data.caseProperty || '');

        setFormData({
            firNo: data.firNo || '',
            srNo: data.srNo || '',
            underSection: data.underSection || '',
            releaseItemName: data.releaseItemName || '',
            receiverName: data.receiverName || "",
            fathersName: data.fathersName || "",
            address: data.address || "",
            mobile: data.mobile || "",
            policeStation: data.policeStation || "",
            releaseOrderedBy: data.releaseOrderedBy || "",
        });

        if (data.releaseDate) {
            const date = new Date(data.releaseDate);
            setReleaseDate(isNaN(date.getTime()) ? undefined : date);
        } else {
            setReleaseDate(undefined);
        }
    };

    const resetAll = () => {
        setFormData({ firNo: '', srNo: '', underSection: '', releaseItemName: "", receiverName: "", fathersName: "", address: "", mobile: "", policeStation: "", releaseOrderedBy: "" });
        setReleaseDate(undefined);
        setCaseProperty(''); setExistingId(''); setType(''); setSearchResults([]); setSelectedResultId('');
        if (photoRef.current) photoRef.current.value = '';
        if (documentRef.current) documentRef.current.value = '';
    };

    const handleGetByFir = async () => {
        if (!type) return toast.error(t('toasts.selectType'));
        if (!formData.firNo && !formData.srNo) return toast.error(t('toasts.enterFirOrSr'));

        setIsFetching(true);
        setSearchResults([]);
        setExistingId('');
        setSelectedResultId('');

        try {
            const response = await fetchByFIR(user?.id, type, formData.firNo, formData.srNo);
            if (response && response.success && Array.isArray(response.data)) {
                const results = response.data;
                if (results.length > 1) {
                    setSearchResults(results);
                    toast.success(t('toasts.recordsFound', { count: results.length }));
                } else if (results.length === 1) {
                    fillForm(results[0]);
                    setSelectedResultId(results[0].id || results[0]._id);
                    toast.success(t('toasts.fetchSuccess'));
                } else {
                    toast.error(t('toasts.noRecord'));
                }
            } else if (response?.data) {
                fillForm(response.data)
                toast.success(t('toasts.fetchSuccess'));
            } else {
                toast.error(t('toasts.noRecord'));
            }
        } catch (error) {
            toast.error(t('toasts.fetchFailed'));
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async () => {
        // --- VALIDATION LOGIC ---
        if (!existingId) return toast.error(t('toasts.noRecordSelected'));

        // Check text fields
        const requiredTextFields: (keyof FormData)[] = [
            'releaseItemName', 'receiverName', 'fathersName',
            'address', 'mobile', 'policeStation', 'releaseOrderedBy'
        ];

        for (const field of requiredTextFields) {
            if (!formData[field] || formData[field].trim() === "") {
                return toast.error(`${t(`labels.${field}`)} ${t('toasts.isRequired' as any) || 'is required'}`);
            }
        }

        // Check Date
        if (!releaseDate) {
            return toast.error(t('toasts.enterReleaseDate' as any) || "Release date is required");
        }

        // Check Files (Optional: remove if files are not strictly mandatory)
        if (!photoRef.current?.files?.[0]) {
            return toast.error(t('labels.uploadPhoto') + " " + (t('toasts.isRequired' as any) || 'is required'));
        }
        // --- END VALIDATION ---

        setIsLoading(true);
        try {
            let releasePhotoUrl: string | undefined = "";
            if (photoRef.current?.files?.[0]) {
                releasePhotoUrl = await uploadToImageKit(photoRef.current.files[0], "photo");
            }

            let releaseDocumentUrl: string | undefined = "";
            if (documentRef.current?.files?.[0]) {
                releaseDocumentUrl = await uploadToImageKit(documentRef.current.files[0], "doc");
            }

            const updateData = {
                ...formData,
                releasePhotoUrl,
                releaseDocumentUrl,
                status: "Released",
                isReturned: true,
                isRelease: true,
                releaseDate: formatDateForApi(releaseDate),
            };

            let response;
            if (type === "malkhana") {
                response = await axios.put(`/api/entry?id=${existingId}`, updateData);
            } else if (type === "seizedVehicle") {
                response = await axios.put(`/api/siezed?id=${existingId}`, updateData);
            }

            if (response?.data.success) {
                toast.success(t('toasts.updateSuccess'));
                resetAll();
            } else {
                toast.error(t('toasts.saveError'));
            }
        } catch (error) {
            console.error('Error saving release info:', error);
            toast.error(t('toasts.saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultSelectionChange = (resultId: string) => {
        setSelectedResultId(resultId);
        const selectedData = searchResults.find(item => (item.id || item._id) === resultId);
        if (selectedData) fillForm(selectedData);
    };

    const typeOptions = Object.keys(t.raw('options.type')).map(key => ({
        value: key,
        label: t(`options.type.${key}`)
    }));

    // Added asterisk (*) to labels for visual feedback
    const fields = [
        { name: "releaseItemName", label: `${t('labels.releaseItemName')} *` },
        { name: "receiverName", label: `${t('labels.receiverName')} *` },
        { name: "fathersName", label: `${t('labels.fathersName')} *` },
        { name: "address", label: `${t('labels.address')} *` },
        { name: "mobile", label: `${t('labels.mobileNo')} *` },
        { name: "releaseOrderedBy", label: `${t('labels.releaseOrderedBy')} *` },
        { name: "policeStation", label: `${t('labels.policeStation')} *` },
    ];

    const inputFields = [
        { label: `${t('labels.uploadPhoto')} *`, id: "photo", ref: photoRef },
        { label: t('labels.uploadDocument'), id: "document", ref: documentRef },
    ];

    return (
        <div className='glass-effect '>
            <div className='py-4 border bg-maroon rounded-t-xl border-gray-400 flex justify-center'>
                <h1 className='text-2xl uppercase text-cream font-semibold'>{t('title')}</h1>
            </div>
            <div className='px-8 py-4 rounded-b-md'>
                <div className='flex w-1/2 justify-center my-4 items-center gap-4'>
                    <label className="text-blue-100 font-semibold">{t('labels.selectType')} *</label>
                    <DropDown selectedValue={type} handleSelect={setType} options={typeOptions} />
                </div>
                <hr className="border-gray-600 my-4" />
                <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end'>
                    <InputComponent label={t('labels.firNo')} value={formData.firNo} setInput={(e) => handleInputChange('firNo', e.target.value)} />
                    <InputComponent label={t('labels.orSrNo')} value={formData.srNo} setInput={(e) => handleInputChange('srNo', e.target.value)} />
                    <div className="md:col-span-2 flex justify-center">
                        <Button onClick={handleGetByFir} className='bg-blue-600 w-1/2' disabled={isFetching || !type}>
                            {isFetching ? <LoaderIcon className='animate-spin' /> : t('buttons.fetchRecord')}
                        </Button>
                    </div>
                </div>

                {searchResults.length > 1 && (
                    <div className="my-4 col-span-2 flex flex-col gap-1">
                        <label className='text-blue-100'>{t('labels.multipleRecords')}</label>
                        <div className="glass-effect p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-3">
                            {searchResults.map((item: any) => (
                                <div key={item.id || item._id} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id={`result-${item.id || item._id}`}
                                        name="resultSelection"
                                        className="form-radio h-4 w-4"
                                        checked={selectedResultId === (item.id || item._id)}
                                        onChange={() => handleResultSelectionChange(item.id || item._id)}
                                    />
                                    <label htmlFor={`result-${item.id || item._id}`} className="text-blue-100 cursor-pointer">
                                        {t('placeholders.srNo', { srNo: item.srNo })}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {existingId && (
                    <div>
                        <hr className="border-gray-600 my-6" />
                        <div>
                            <h2 className="text-xl text-center text-cream font-semibold mb-4">{t('labels.enterDetails')}</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <InputComponent label={t('labels.caseProperty')} value={caseProperty} disabled />
                                <InputComponent label={t('labels.underSection')} value={formData.underSection} disabled />

                                {fields.map((field) => (
                                    <InputComponent
                                        key={field.name}
                                        label={field.label}
                                        value={formData[field.name.replace(' *', '') as keyof FormData]}
                                        setInput={(e) => handleInputChange(field.name.replace(' *', '') as keyof FormData, e.target.value)}
                                    />
                                ))}

                                <DatePicker
                                    label={`${t('labels.releaseDate')} *`}
                                    date={releaseDate}
                                    setDate={setReleaseDate}
                                />

                                {inputFields.map((item, index) => (
                                    <div key={index} className='flex flex-col gap-2'>
                                        <label className='text-nowrap text-blue-100' htmlFor={item.id}>{item.label}</label>
                                        <input
                                            ref={item.ref}
                                            className='w-full text-blue-100 rounded-xl glass-effect px-2 py-1'
                                            id={item.id}
                                            type='file'
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className='flex w-full px-12 justify-center items-center gap-4 mt-6'>
                                <Button onClick={handleSave} className='bg-green-600' disabled={isLoading}>
                                    {isLoading ? <LoaderIcon className='animate-spin' /> : t('buttons.saveAndRelease')}
                                </Button>
                                <Button onClick={resetAll} className='bg-red-600'>{t('buttons.clearForm')}</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;