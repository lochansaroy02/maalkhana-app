"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useSeizedVehicleStore } from '@/store/siezed-vehical/seizeStore';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';


const Page = () => {
    const t = useTranslations('seizedVehicleForm');

    const { user } = useAuthStore();
    const { addVehicle, getData, updateVehicalEntry } = useSeizedVehicleStore();
    const [existingId, setExistingId] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResultId, setSelectedResultId] = useState<string>('');
    const [seizedBy, setSeizedBy] = useState<string>("");
    const [rtoName, setRTOName] = useState<string>("");
    const [underSection, setUnderSection] = useState('');
    const [caseProperty, setCaseProperty] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 💡 FIX 1: The `status` state is now part of the main formData, removing redundancy.
    const [formData, setFormData] = useState({
        srNo: '', firNo: '', gdNo: '', gdDate: '', vehicleType: '', colour: '', registrationNo: '', engineNo: '', description: '', policeStation: '', ownerName: '', status: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Auto-set 'underSection' when 'caseProperty' changes
    useEffect(() => {
        if (caseProperty === 'mvAct') { // Logic now uses keys
            setUnderSection('207');
        } else {
            setUnderSection('');
        }
    }, [caseProperty]);

    // i18n: Use keys for logic and map to translated labels for display
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

    const clearForm = () => {
        setFormData({
            srNo: '', firNo: '', gdNo: '', gdDate: '', vehicleType: '', colour: '', registrationNo: '', engineNo: '', description: '', policeStation: '', ownerName: '', status: '',
        });
        setCaseProperty('');
        setSeizedBy('');
        setRTOName('');
        setExistingId('');
        setUnderSection('');
        setSearchResults([]);
        setSelectedResultId('');
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const fullVehicleData = {
                ...formData,
                caseProperty,
                seizedBy,
                rtoName,
                underSection,
                userId: user?.id,
            };

            const success = existingId
                ? await updateVehicalEntry(existingId, fullVehicleData)
                : await addVehicle(fullVehicleData);

            if (success) {
                toast.success(existingId ? t('toasts.updateSuccess') : t('toasts.addSuccess'));
                clearForm();
            }
        } catch (err) {
            console.error('Error saving vehicle:', err);
            toast.error(t('toasts.saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const formFill = (data: any) => {
        if (!data) return;
        setExistingId(data.id || data._id);
        setFormData({
            srNo: data?.srNo || '', firNo: data?.firNo || '', gdNo: data?.gdNo || '', gdDate: data?.gdDate || '', vehicleType: data?.vehicleType || '', colour: data?.colour || '', registrationNo: data?.registrationNo || '', engineNo: data?.engineNo || '', description: data?.description || '', policeStation: data?.policeStation || '', ownerName: data?.ownerName || '', status: data?.status || '',
        });
        setCaseProperty(data?.caseProperty || '');
        setSeizedBy(data?.seizedBy || '');
        setRTOName(data?.rtoName || '');
        setUnderSection(data?.underSection || '');
    };

    const handleGet = async () => {
        setSearchResults([]);
        setSelectedResultId('');
        try {
            const { success, data } = await getData(user?.id, formData.firNo, formData.srNo);
            if (success && data?.length) {
                if (data.length > 1) {
                    setSearchResults(data);
                    toast.success(t('toasts.recordsFound', { count: data.length }));
                } else {
                    toast.success(t('toasts.fetchSuccess'));
                    formFill(data[0]);
                    setSelectedResultId(data[0].id || data[0]._id);
                }
            } else {
                toast.error(t('toasts.noData'));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
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
        { name: 'gdDate', label: t('labels.gdDate') },
        { name: 'underSection', label: t('labels.underSection') },
        { name: 'vehicleType', label: t('labels.vehicleType') },
        { name: 'colour', label: t('labels.colour') },
        { name: 'registrationNo', label: t('labels.registrationNo') },
        { name: 'engineNo', label: t('labels.engineNo') },
        { name: 'description', label: t('labels.description') },
        { name: 'status', label: t('labels.status') },
        { name: 'policeStation', label: t('labels.policeStation') },
        { name: 'ownerName', label: t('labels.ownerName') },
    ];

    return (
        <div className='glass-effect'>
            <div className='py-4 bg-maroon w-full rounded-t-xl border-b border-white/50 flex justify-center'>
                <h1 className='text-2xl uppercase text-[#fdf8e8] font-semibold'>{t('title')}</h1>
            </div>
            <div className='px-8 py-4 min-h-screen rounded-b-md'>
                <div className='flex items-center gap-4'>
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
                        <label className='text-blue-100'>{t('labels.multipleRecordsFound')}</label>
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
                                        {item.firNo ? t('placeholders.fir', { fir: item.firNo }) : ''} {item.srNo ? t('placeholders.sr', { sr: item.srNo }) : ''}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className='mt-2 grid lg:grid-cols-2 gap-2'>
                    {fields.map(field => {
                        if (field.name === 'firNo' && (caseProperty === 'unclaimed' || caseProperty === 'mvAct')) return null;

                        if (field.name === 'underSection') {
                            return (
                                <InputComponent
                                    key={field.name}
                                    label={field.label}
                                    value={underSection}
                                    setInput={e => setUnderSection(e.target.value)}
                                />
                            );
                        }

                        if (field.name === 'status') {
                            return (
                                <DropDown
                                    key={field.name}
                                    selectedValue={formData.status}
                                    options={statusOptions}
                                    label={t('labels.status')}
                                    handleSelect={(value) => handleInputChange('status', value)}
                                />
                            );
                        }

                        return (
                            <div key={field.name} className='flex items-end gap-2'>
                                <InputComponent
                                    label={field.label}
                                    value={formData[field.name as keyof typeof formData]}
                                    setInput={e => handleInputChange(field.name, e.target.value)}
                                />
                                {(field.name === 'srNo' && (caseProperty === "mvAct" || caseProperty === "unclaimed")) && (
                                    <Button className='bg-green-600 text-white' onClick={handleGet}>{t('buttons.search')}</Button>
                                )}
                                {field.name === 'firNo' && (
                                    <Button className='bg-purple-600 text-white' onClick={handleGet}>{t('buttons.getByFir')}</Button>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className='flex justify-center w-full mt-4'>
                    {/* 💡 FIX 2: Replaced confusing dual buttons with a single, intelligent button */}
                    <Button
                        onClick={handleSave}
                        className='bg-blue text-blue-100 cursor-pointer'
                        disabled={isLoading}
                    >
                        {isLoading ? t('buttons.saving') : (existingId ? t('buttons.modify') : t('buttons.save'))}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Page;