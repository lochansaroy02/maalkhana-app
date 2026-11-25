"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datePicker';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useSeizedVehicleStore } from '@/store/siezed-vehical/seizeStore';
import { uploadFile } from '@/utils/media';
import { Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { LoaderIcon, toast } from 'react-hot-toast';

const Page = () => {
    const t = useTranslations('seizedVehicleForm');
    const tu = useTranslations("ui.forms");
    const baseKey = 'seizedVehicleForm';
    const tCommon = useTranslations('entry.malkhanaEntryForm');
    const { user } = useAuthStore();
    const { addVehicle, updateVehicalEntry, getByFIR, getBySR } = useSeizedVehicleStore();

    // --- State Management ---
    const [existingId, setExistingId] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');
    const [photoUrl, SetPhotoUrl] = useState<string | undefined>("");
    const [seizedBy, setSeizedBy] = useState<string>("");
    const [rtoName, setRTOName] = useState<string>("");
    const [underSection, setUnderSection] = useState('');
    const [caseProperty, setCaseProperty] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otherStatus, setOtherStatus] = useState('');
    const [gdDate, setGdDate] = useState<Date | undefined>();

    const [formData, setFormData] = useState({
        srNo: '',
        firNo: '',
        gdNo: '',
        vehicleType: '',
        colour: '',
        registrationNo: '',
        engineNo: '',
        description: '',
        policeStation: '',
        ownerName: '',
        status: '',
    });

    const photoRef = useRef<HTMLInputElement>(null);

    // --- Logic Helpers ---
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (caseProperty === 'mvAct') {
            setUnderSection('207');
        } else if (caseProperty !== 'mvAct' && underSection === '207') {
            setUnderSection('');
        }
    }, [caseProperty]);

    const statusOptionKeys = ["destroy", "nilami", "pending", "other", "onCourt"];
    const statusOptions = statusOptionKeys.map(key => ({
        value: key,
        label: t(`options.status.${key}`)
    }));

    const caseOptionKeys = ["mvAct", "artoSeized", "bnsIpc", "excise", "seized", "unclaimed"];
    const caseOptions = caseOptionKeys.map(key => ({
        value: key,
        label: t(`options.case.${key}`)
    }));

    // --- Photo Upload Functionality ---
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        try {
            const uploadedUrl = await uploadFile(file, "seized-vehicle");
            SetPhotoUrl(uploadedUrl);
            toast.success(t('toasts.photoUploadSuccess') || "Photo Uploaded");
        } catch (err) {
            console.error(err);
            toast.error(t('toasts.photoUploadError') || "Upload Failed");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Clear & Reset ---
    const clearForm = () => {
        setFormData({
            srNo: '', firNo: '', gdNo: '', vehicleType: '', colour: '', registrationNo: '', engineNo: '', description: '', policeStation: '', ownerName: '', status: '',
        });
        setGdDate(undefined);
        setCaseProperty('');
        setSeizedBy('');
        setRTOName('');
        setExistingId('');
        setUnderSection('');
        setSearchResults([]);
        setSelectedResultId('');
        setOtherStatus('');
        SetPhotoUrl("");
        if (photoRef.current) photoRef.current.value = '';
    };

    // --- Print Functionality ---
    const handlePrint = () => {
        const fullData = {
            ...formData,
            status: formData.status === 'other' ? otherStatus : formData.status,
            gdDate: gdDate?.toISOString() || '',
            caseProperty,
            seizedBy,
            rtoName,
            underSection,
            photoUrl,
        };

        if (!fullData.registrationNo && !fullData.srNo) {
            toast.error(t('toasts.printError') || "No data to print");
            return;
        }

        sessionStorage.setItem('printableEntryData', JSON.stringify(fullData));
        window.open('/details', '_blank');
    };

    // --- Save & Update Logic ---
    const handleSave = async () => {
        if (isLoading) return;

        const requiredFields = [
            { key: 'caseProperty', value: caseProperty },
            { key: 'gdNo', value: formData.gdNo },
            { key: 'gdDate', value: gdDate },
            { key: 'vehicleType', value: formData.vehicleType },
            { key: 'policeStation', value: formData.policeStation },
            { key: 'registrationNo', value: formData.registrationNo },
        ];

        if (caseProperty !== 'unclaimed' && caseProperty !== 'mvAct') {
            requiredFields.push({ key: 'firNo', value: formData.firNo });
        }

        const hasEmptyFields = requiredFields.some(field => !field.value);

        if (hasEmptyFields) {
            toast.error(t('toasts.fillRequired') || "Please fill all required fields");
            return;
        }

        try {
            setIsLoading(true);
            const finalStatus = formData.status === 'other' ? otherStatus : formData.status;

            const fullVehicleData = {
                ...formData,
                status: finalStatus,
                gdDate: gdDate?.toISOString() || null,
                caseProperty,
                seizedBy,
                rtoName,
                underSection,
                userId: user?.id,
                photoUrl,
            };

       
            let response;
            if (existingId) {
                response = await updateVehicalEntry(existingId, fullVehicleData);
                if (response) toast.success(t('toasts.updateSuccess'));
            } else {
                response = await addVehicle(fullVehicleData);
                if (response) toast.success(t('toasts.addSuccess'));
            }

            if (response) clearForm();
        } catch (err) {
            console.error('Error saving vehicle:', err);
            toast.error(t('toasts.saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const formFill = (data: any) => {
        if (!data) return;
        setExistingId(data.id || data._id || "");
        setFormData({
            srNo: data?.srNo || '',
            firNo: data?.firNo || '',
            gdNo: data?.gdNo || '',
            vehicleType: data?.vehicleType || '',
            colour: data?.colour || '',
            registrationNo: data?.registrationNo || '',
            engineNo: data?.engineNo || '',
            description: data?.description || '',
            policeStation: data?.policeStation || '',
            ownerName: data?.ownerName || '',
            status: data?.status || '',
        });
        setGdDate(data?.gdDate ? new Date(data.gdDate) : undefined);
        setCaseProperty(data?.caseProperty || '');
        setSeizedBy(data?.seizedBy || '');
        setRTOName(data?.rtoName || '');
        setUnderSection(data?.underSection || '');
        SetPhotoUrl(data?.photoUrl || "");
    };

    const handleGetByFir = async () => {
        if (!formData.firNo) return toast.error(tu("enterFir"));
        setSearchResults([]);
        setSelectedResultId('');
        try {
            const response = await getByFIR(user?.id, formData.firNo);
            if (response.success) {
                const data = response.data;
                if (data.length > 1) {
                    setSearchResults(data);
                    toast.success(t('toasts.recordsFound', { count: data.length }));
                } else if (data.length === 1) {
                    formFill(data[0]);
                    setSelectedResultId(data[0].id || data[0]._id);
                }
            } else {
                toast.error(tu("noRecords"));
            }
        } catch (error) {
            toast.error(t('toasts.fetchFailed'));
        }
    };

    const handleGetBySR = async () => {
        if (!formData.srNo) return toast.error(tu("enterSr"));
        try {
            const response = await getBySR(user?.id, formData.srNo);
            if (response?.success && response.data) {
                formFill(response.data);
            } else {
                toast.error(tu("notFound"));
            }
        } catch (error) {
            toast.error(t('toasts.fetchFailed'));
        }
    };

    const handleResultSelectionChange = (resultId: string) => {
        setSelectedResultId(resultId);
        const selectedData = searchResults.find(item => (item.id || item._id) === resultId);
        if (selectedData) formFill(selectedData);
    };

    const fields = [
        { name: 'firNo', label: t('labels.firNo') },
        { name: 'srNo', label: t('labels.srNo') },
        { name: 'gdNo', label: t('labels.gdNo') },
        { name: 'gdDate', label: t('labels.gdDate'), type: 'date' },
        { name: 'underSection', label: t('labels.underSection') },
        { name: 'vehicleType', label: t('labels.vehicleType') },
        { name: 'colour', label: t('labels.colour') },
        { name: 'registrationNo', label: t('labels.registrationNo') },
        { name: 'engineNo', label: t('labels.engineNo') },
        { name: 'description', label: t('labels.description') },
        { name: 'status', label: t('labels.status'), type: 'dropdown' },
        { name: 'policeStation', label: t('labels.policeStation') },
        { name: 'ownerName', label: t('labels.ownerName') },
    ];

    return (
        <div className='glass-effect'>
            <div className='py-4 bg-maroon w-full rounded-t-xl border-b border-white/50 flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>{t('title')}</h1>
            </div>

            <div className='px-8 py-4 min-h-screen rounded-b-md'>
                <div className='flex w-1/2 items-center gap-4'>
                    <DropDown label={t('labels.caseProperty')} selectedValue={caseProperty} options={caseOptions} handleSelect={setCaseProperty} />
                    {(caseProperty === "mvAct" || caseProperty === "artoSeized") && (
                        <InputComponent
                            label={caseProperty === "mvAct" ? t('labels.seizedBy') : t('labels.rtoName')}
                            value={caseProperty === "mvAct" ? seizedBy : rtoName}
                            setInput={(e) => (caseProperty === "mvAct" ? setSeizedBy(e.target.value) : setRTOName(e.target.value))}
                        />
                    )}
                </div>

                {searchResults.length > 1 && (
                    <div className="my-4 flex flex-col gap-1">
                        <label className='text-blue-100 font-medium'>{t('labels.multipleRecordsFound')}</label>
                        <div className="glass-effect p-3 rounded-md flex flex-wrap gap-3">
                            {searchResults.map((item: any) => (
                                <div key={item.id || item._id} className="flex items-center bg-blue/20 px-4 py-2 rounded-xl gap-2">
                                    <input
                                        type="radio"
                                        id={`result-${item.id || item._id}`}
                                        name="resultSelection"
                                        className="form-radio h-4 w-4"
                                        checked={selectedResultId === (item.id || item._id)}
                                        onChange={() => handleResultSelectionChange(item.id || item._id)}
                                    />
                                    <label htmlFor={`result-${item.id || item._id}`} className="text-blue-100 cursor-pointer text-sm">
                                        {item.firNo ? `FIR: ${item.firNo}` : ''} {item.srNo ? `| SR: ${item.srNo}` : ''}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className='mt-2 grid lg:grid-cols-2 gap-2'>
                    {fields.map(field => {
                        if (field.name === 'firNo' && (caseProperty === 'unclaimed' || caseProperty === 'mvAct')) return null;

                        if (field.name === 'status') {
                            return (
                                <DropDown
                                    key={field.name}
                                    selectedValue={formData.status}
                                    options={statusOptions}
                                    label={field.label}
                                    handleSelect={(value) => handleInputChange('status', value)}
                                />
                            );
                        }

                        if (field.type === 'date') {
                            return <DatePicker key={field.name} label={field.label} date={gdDate} setDate={setGdDate} />;
                        }

                        if (field.name === 'srNo') {
                            return (
                                <div key={field.name} className='flex items-end gap-2'>
                                    <InputComponent
                                        className="flex-grow"
                                        label={field.label}
                                        value={formData.srNo}
                                        setInput={e => handleInputChange('srNo', e.target.value)}
                                    />
                                    <Button className='bg-green-600 text-white h-10' onClick={handleGetBySR}>
                                        {t('buttons.search') || "Search"}
                                    </Button>
                                </div>
                            );
                        }

                        if (field.name === 'firNo') {
                            return (
                                <div key={field.name} className='flex items-end gap-2'>
                                    <InputComponent
                                        className="flex-grow"
                                        label={field.label}
                                        value={formData.firNo}
                                        setInput={e => handleInputChange('firNo', e.target.value)}
                                    />
                                    <Button className='bg-purple-600 text-white h-10' onClick={handleGetByFir}>
                                        {t('buttons.getByFir')}
                                    </Button>
                                </div>
                            );
                        }

                        return (
                            <InputComponent
                                key={field.name}
                                label={field.label}
                                value={(formData as any)[field.name] || (field.name === 'underSection' ? underSection : '')}
                                setInput={e => field.name === 'underSection' ? setUnderSection(e.target.value) : handleInputChange(field.name, e.target.value)}
                            />
                        );
                    })}
                </div>

                {formData.status === 'other' && (
                    <div className='mt-4 w-1/2'>
                        <InputComponent
                            label={t('options.status.otherStatus')}
                            value={otherStatus}
                            setInput={(e) => setOtherStatus(e.target.value)}
                        />
                    </div>
                )}

                {/* --- Photo Section --- */}
                <div className='w-full mt-6'>
                    <div className='flex flex-row gap-4 items-start'>
                        <div className='w-1/2'>
                            <label className='text-blue-100 block mb-2' htmlFor="photo">{tu("vehiclePhoto")}</label>
                            <input
                                ref={photoRef}
                                className='text-blue-100 w-full rounded-xl glass-effect px-2 py-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue file:text-white hover:file:bg-blue/80'
                                id="photo"
                                type='file'
                                onChange={handlePhotoChange}
                            />
                        </div>
                        <div className='relative w-40 h-40 group'>
                            {photoUrl && (
                                <>
                                    <img src={photoUrl} className='w-full h-full object-cover rounded-md border border-white/20' alt={tu("vehiclePhoto")} />
                                    <Button
                                        onClick={() => { SetPhotoUrl(""); if (photoRef.current) photoRef.current.value = ''; }}
                                        className='absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 p-2 h-8 w-8 rounded-full shadow-lg'
                                    >
                                        <Trash size={14} />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Action Buttons --- */}
                <div className='flex w-full justify-center mt-10'>
                    <div className='flex w-2/3 justify-between gap-4'>
                        <Button
                            onClick={handleSave}
                            className='min-w-[120px] bg-blue text-white cursor-pointer'
                            disabled={isLoading}
                        >
                            {isLoading ? <LoaderIcon className='animate-spin' /> : (existingId ? t('buttons.modify') : t('buttons.save'))}
                        </Button>

                        <Button onClick={handlePrint} className='min-w-[120px] bg-slate-700 text-white cursor-pointer'>
                            {tCommon('buttons.print') || "Print"}
                        </Button>

                        <Button onClick={clearForm} className='min-w-[120px] bg-red-900/50 text-white cursor-pointer'>
                            {tCommon('buttons.clear') || "Clear"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;