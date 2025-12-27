"use client";

import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datePicker';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useNilamiStore } from '@/store/nilamiStore'; // Updated to Nilami Store
import { uploadToCloudinary } from '@/utils/uploadToCloudnary';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

// Helper function to format Date object for the API
const formatDateForApi = (date: Date | undefined): string => {
    if (date) {
        return date.toISOString().split('T')[0]; // Sending YYYY-MM-DD for string fields
    }
    return "";
};

interface NilamiFormData {
    firNo: string;
    srNo: string;
    underSection: string;
    nilamiItemName: string;
    nilamiOrderedBy: string;
    nilamiValue: string;
    policeStation: string;
}

const NilamiPage = () => {
    // Assuming you use the same translation structure or a similar one for Nilami
    const t = useTranslations('maalkhanaNilamiForm');

    const { user } = useAuthStore();
    const { fetchByFIR } = useNilamiStore(); // From the new store
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [type, setType] = useState<string>("");
    const [existingId, setExistingId] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');

    const [formData, setFormData] = useState<NilamiFormData>({
        firNo: '',
        srNo: '',
        underSection: '',
        nilamiItemName: "",
        nilamiOrderedBy: "",
        nilamiValue: "",
        policeStation: ""
    });

    const [nilamiDate, setNilamiDate] = useState<Date | undefined>(undefined);
    const [caseProperty, setCaseProperty] = useState('');

    const photoRef = useRef<HTMLInputElement>(null);
    const documentRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: keyof NilamiFormData, value: string) => {
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
            nilamiItemName: data.nilamiItemName || '',
            nilamiOrderedBy: data.nilamiOrderedBy || '',
            nilamiValue: data.nilamiValue || "",
            policeStation: data.policeStation || "",
        });

        if (data.nilamiDate) {
            const date = new Date(data.nilamiDate);
            setNilamiDate(isNaN(date.getTime()) ? undefined : date);
        } else {
            setNilamiDate(undefined);
        }
    };

    const resetAll = () => {
        setFormData({ firNo: '', srNo: '', underSection: '', nilamiItemName: "", nilamiOrderedBy: "", nilamiValue: "", policeStation: "" });
        setNilamiDate(undefined);
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

            if (response && response.success) {
                const results = Array.isArray(response.data) ? response.data : [response.data];
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
            } else {
                toast.error(t('toasts.noRecord'));
            }
        } catch (error) {
            console.error("Error fetching for Nilami:", error);
            toast.error(t('toasts.fetchFailed'));
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async () => {
        if (!existingId) return toast.error(t('toasts.noRecordSelected'));
        if (!nilamiDate) return toast.error(t('toasts.enterNilamiDate'));

        setIsLoading(true);
        try {
            const photoUrl = photoRef.current?.files?.[0] ? await uploadToCloudinary(photoRef.current.files[0]) : "";
            const documentUrl = documentRef.current?.files?.[0] ? await uploadToCloudinary(documentRef.current.files[0]) : "";

            const updateData = {
                nilamiItemName: formData.nilamiItemName,
                nilamiOrderedBy: formData.nilamiOrderedBy,
                nilamiValue: formData.nilamiValue,
                nilamiDate: formatDateForApi(nilamiDate),
                photoUrl,
                documentUrl,
                status: "Auctioned",
                isNilami: true,
                policeStation: formData.policeStation,
            };

            let response;
            // Using existing entry/seized update endpoints but passing Nilami fields
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
            console.error('Error saving Nilami info:', error);
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

    // Specific Nilami fields based on your schema
    const fields = [
        { name: "nilamiItemName", label: t('labels.nilamiItemName') },
        { name: "nilamiOrderedBy", label: t('labels.nilamiOrderedBy') },
        { name: "nilamiValue", label: t('labels.nilamiValue') },
        { name: "policeStation", label: t('labels.policeStation') },
    ];

    const inputFiles = [
        { label: t('labels.uploadPhoto'), id: "photo", ref: photoRef },
        { label: t('labels.uploadDocument'), id: "document", ref: documentRef },
    ];

    return (
        <div className='glass-effect'>
            <div className='py-4 border bg-maroon rounded-t-xl border-gray-400 flex justify-center'>
                <h1 className='text-2xl uppercase text-cream font-semibold'>{t('title')}</h1>
            </div>
            <div className='px-8 py-4 rounded-b-md'>
                <div className='flex w-1/2 justify-center my-4 items-center gap-4'>
                    <label className="text-blue-100 font-semibold">{t('labels.selectType')}</label>
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
                            <h2 className="text-xl text-center text-cream font-semibold mb-4">{t('labels.enterNilamiDetails')}</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <InputComponent label={t('labels.caseProperty')} value={caseProperty} disabled />
                                <InputComponent label={t('labels.underSection')} value={formData.underSection} disabled />

                                {fields.map((field) => (
                                    <InputComponent
                                        key={field.name}
                                        label={field.label}
                                        value={formData[field.name as keyof NilamiFormData]}
                                        setInput={(e) => handleInputChange(field.name as keyof NilamiFormData, e.target.value)}
                                    />
                                ))}

                                <DatePicker
                                    label={t('labels.nilamiDate')}
                                    date={nilamiDate}
                                    setDate={setNilamiDate}
                                />

                                {inputFiles.map((item, index) => (
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
                                <Button onClick={handleSave} className='bg-green-600' disabled={isLoading || !nilamiDate}>
                                    {isLoading ? <LoaderIcon className='animate-spin' /> : t('buttons.saveAndAuction')}
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

export default NilamiPage;