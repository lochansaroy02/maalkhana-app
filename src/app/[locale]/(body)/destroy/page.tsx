"use client";

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

// Assuming these components are available in your project
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useDestroyStore } from '@/store/destroyStore'; // The new store

// Placeholder for utility function (replace with your actual path)
// NOTE: I am keeping the original function name and import structure for consistency.
const uploadToCloudinary = async (file: File) => {
    // In a real application, this function would handle image upload.
    // Placeholder implementation:
    console.log("Uploading file:", file.name);
    return `mock-cloudinary-url/destroy-evidence-${Date.now()}`;
};



const Page = () => {
    const t = useTranslations('maalkhanaDestroyForm'); // Updated translation namespace

    // State for Firebase/Auth readiness
    const [isAuthReady, setIsAuthReady] = useState(false);

    const { fetchByFIR, updateDestroyEntry } = useDestroyStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [type, setType] = useState<string>("");
    const [existingId, setExistingId] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');

    const { user } = useAuthStore()

    // Updated formData to reflect destruction fields
    const [formData, setFormData] = useState({
        firNo: '',
        srNo: '',
        underSection: '',
        policeStation: '',
        destroyOrderedBy: '', // New field
        destroyPurpose: '',    // New field
    });
    const [caseProperty, setCaseProperty] = useState('');
    const photoRef = useRef<HTMLInputElement>(null);
    const documentRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: string, value: string) => {
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
            policeStation: data.policeStation || '',
            destroyOrderedBy: data.destroyOrderedBy || '',
            destroyPurpose: data.destroyPurpose || '',
        });
    };

    const resetAll = () => {
        setFormData({ firNo: '', srNo: '', underSection: '', policeStation: '', destroyOrderedBy: '', destroyPurpose: '' });
        setCaseProperty(''); setExistingId(''); setType(''); setSearchResults([]); setSelectedResultId('');
        if (photoRef.current) photoRef.current.value = '';
        if (documentRef.current) documentRef.current.value = '';
    };

    const handleGetByFir = async () => {
        console.log(formData.firNo);
        if (!type) return toast.error(t('toasts.selectType'));
        if (!formData.firNo && !formData.srNo) return toast.error(t('toasts.enterFirOrSr'));

        setIsFetching(true);
        setSearchResults([]);
        setExistingId('');
        setSelectedResultId('');

        try {
            // Note: useDestroyStore fetchByFIR now handles type, firNo, and srNo
            const response = await fetchByFIR(user?.id, type, formData.firNo, formData.srNo);

            if (response && response.success && Array.isArray(response.data)) {
                const results = response.data;

                if (results.length > 1) {
                    setSearchResults(results);
                    toast.success(t('toasts.recordsFound', { count: results.length }));
                } else if (results.length === 1) {
                    // Single record found, likely from an SR number. Auto-fill the form.
                    fillForm(results[0]);
                    setSelectedResultId(results[0].id || results[0].id);
                    toast.success(t('toasts.fetchSuccess'));
                } else {
                    // No records found.
                    toast.error(t('toasts.noRecord'));
                }
            } else if (response && response.success && response.data) {
                // Single object returned (maybe error in array check above)
                fillForm(response.data)
                // setSelectedResultId(response.data.id || response.data.id);
                toast.success(t('toasts.fetchSuccess'));
            } else {
                toast.error(t('toasts.noRecord'));
            }
        } catch (error) {
            console.error("Error fetching by FIR:", error);
            toast.error(t('toasts.fetchFailed'));
        } finally {
            setIsFetching(false);
        }
    };
    console.log(user?.id);
    const handleSave = async () => {
        if (!existingId) return toast.error(t('toasts.noRecordSelected'));
        if (!formData.destroyOrderedBy) return toast.error(t('toasts.enterOrderer'));
        if (!formData.destroyPurpose) return toast.error(t('toasts.enterPurpose'));

        setIsLoading(true);
        try {
            // Upload files first
            const photoFile = photoRef.current?.files?.[0];
            const documentFile = documentRef.current?.files?.[0];

            // Note: Upload logic is mocked, replace with actual uploadToCloudinary
            const photoUrl = photoFile ? await uploadToCloudinary(photoFile) : "";
            const documentUrl = documentFile ? await uploadToCloudinary(documentFile) : "";

            const updateData = {
                destroyOrderedBy: formData.destroyOrderedBy,
                destroyPurpose: formData.destroyPurpose,
                photoUrl,
                documentUrl,
            };

            // Call the dedicated destroy store function
            const success = await updateDestroyEntry(existingId, updateData);

            if (success) {
                toast.success(t('toasts.updateSuccess'));
                resetAll(); // Full reset on success
            } else {
                toast.error(t('toasts.saveError'));
            }
        } catch (error) {
            console.error('Error saving destruction info:', error);
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

    // Assuming these options are translated similarly to the release page
    const typeOptions = Object.keys(t.raw('options.type')).map(key => ({
        value: key,
        label: t(`options.type.${key}`)
    }));

    const fields = [
        { name: "destroyOrderedBy", label: t('labels.destroyOrderedBy') },
        { name: "destroyPurpose", label: t('labels.destroyPurpose') },
    ];

    const inputFields = [
        { label: t('labels.uploadPhoto'), id: "photo", ref: photoRef },
        { label: t('labels.uploadDocument'), id: "document", ref: documentRef },
    ];



    return (
        <div className='glass-effect '>
            <div className='py-4 border bg-maroon rounded-t-xl border-gray-400 flex justify-center'>
                <h1 className='text-2xl uppercase text-cream font-semibold'>{t('title')}</h1>
            </div>
            <div className='px-8 py-4 rounded-b-md'>
                <div className='flex w-1/2 justify-center my-4 items-center gap-4 mx-auto'>
                    <label className="text-blue-100 font-semibold">{t('labels.selectType')}</label>
                    <DropDown selectedValue={type} handleSelect={setType} options={typeOptions} />
                </div>
                <hr className="border-gray-600 my-4" />
                <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end'>
                    <InputComponent label={t('labels.firNo')} value={formData.firNo} setInput={(e) => handleInputChange('firNo', e.target.value)} />
                    <InputComponent label={t('labels.orSrNo')} value={formData.srNo} setInput={(e) => handleInputChange('srNo', e.target.value)} />
                    <div className="md:col-span-2 flex justify-center">
                        <Button onClick={handleGetByFir} className='bg-blue-600  w-1/2 hover:bg-maron/70' disabled={isFetching || !type || (!formData.firNo && !formData.srNo)}>
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
                                    <label
                                        htmlFor={`result-${item.id || item._id}`}
                                        className="text-blue-100 cursor-pointer"
                                    >
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
                            <h2 className="text-xl text-center text-white font-semibold mb-4">{t('labels.enterDetails')}</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <InputComponent label={t('labels.caseProperty')} value={caseProperty} disabled />
                                <InputComponent label={t('labels.underSection')} value={formData.underSection} disabled />
                                <InputComponent label={t('labels.policeStation')} value={formData.policeStation} disabled />

                                {fields.map((field) => (
                                    <div key={field.name} className='flex flex-col gap-2'>
                                        <InputComponent
                                            label={field.label}
                                            value={formData[field.name as 'destroyOrderedBy' | 'destroyPurpose']}
                                            setInput={(e) => handleInputChange(field.name, e.target.value)}
                                        />
                                    </div>
                                ))}

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
                                <Button onClick={handleSave} className='bg-red-600 hover:bg-red-700' disabled={isLoading}>
                                    {isLoading ? <LoaderIcon className='animate-spin' /> : t('buttons.saveAndDestroy')}
                                </Button>
                                <Button onClick={resetAll} className='bg-gray-500 hover:bg-gray-600'>{t('buttons.clearForm')}</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;
