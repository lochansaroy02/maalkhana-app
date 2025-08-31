"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datePicker';
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
    const [otherStatus, setOtherStatus] = useState('');

    const [gdDate, setGdDate] = useState<Date | undefined>();

    const [formData, setFormData] = useState({
        srNo: '', firNo: '', gdNo: '', vehicleType: '', colour: '', registrationNo: '', engineNo: '', description: '', policeStation: '', ownerName: '', status: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (date: Date | undefined) => {
        setGdDate(date);
    };

    useEffect(() => {
        if (caseProperty === 'mvAct') {
            setUnderSection('207');
        } else {
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
    };

    const handleSave = async () => {
        const fieldLabels = {
            firNo: t('labels.firNo'),
            gdNo: t('labels.gdNo'),
            gdDate: t('labels.gdDate'),
            vehicleType: t('labels.vehicleType'),
            colour: t('labels.colour'),
            registrationNo: t('labels.registrationNo'),
            policeStation: t('labels.policeStation'),
            caseProperty: t('labels.caseProperty'),
        };

        const requiredFields = [
            { key: 'caseProperty', value: caseProperty },
            { key: 'gdNo', value: formData.gdNo },
            { key: 'gdDate', value: gdDate },
            { key: 'vehicleType', value: formData.vehicleType },
            { key: 'colour', value: formData.colour },
            { key: 'policeStation', value: formData.policeStation },
            { key: 'registrationNo', value: formData.registrationNo },
        ];

        if (caseProperty !== 'unclaimed' && caseProperty !== 'mvAct') {
            requiredFields.push({ key: 'firNo', value: formData.firNo });
        }

        const emptyFields = requiredFields
            .filter(field => !field.value)
            .map(field => fieldLabels[field.key as keyof typeof fieldLabels]);

        if (emptyFields.length > 0) {
            toast.error("Please enter all required entries");
            return;
        }

        if (isLoading) return;

        try {
            setIsLoading(true);

            // --- UPDATED LOGIC ---
            const finalStatus = formData.status === 'other' ? otherStatus : formData.status;

            const fullVehicleData = {
                ...formData,
                status: finalStatus, // Use the finalStatus here
                gdDate: gdDate?.toISOString() || '',
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
            srNo: data?.srNo || '', firNo: data?.firNo || '', gdNo: data?.gdNo || '', vehicleType: data?.vehicleType || '', colour: data?.colour || '', registrationNo: data?.registrationNo || '', engineNo: data?.engineNo || '', description: data?.description || '', policeStation: data?.policeStation || '', ownerName: data?.ownerName || '', status: data?.status || '',
        });
        setGdDate(data?.gdDate ? new Date(data.gdDate) : undefined);
        setCaseProperty(data?.caseProperty || '');
        setSeizedBy(data?.seizedBy || '');
        setRTOName(data?.rtoName || '');
        setUnderSection(data?.underSection || '');
    };

    const handleGet = async () => {
        setSearchResults([]);
        setSelectedResultId('');
        try {
            const data = await getData(user?.id, formData.firNo, formData.srNo);
            if (data?.length) {
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
                        if (field.name === 'firNo' && (caseProperty === 'unclaimed' || caseProperty === 'mvAct')) {
                            return null;
                        }

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

                        if (field.name === 'gdDate') {
                            return <DatePicker key={field.name} label={field.label} date={gdDate} setDate={handleDateChange} />;
                        }

                        if (field.name === 'srNo' && (caseProperty === "mvAct" || caseProperty === "unclaimed")) {
                            return (
                                <div key={field.name} className='flex items-end gap-2'>
                                    <InputComponent
                                        className="flex-grow"
                                        label={field.label}
                                        value={formData[field.name as keyof typeof formData]}
                                        setInput={e => handleInputChange(field.name, e.target.value)}
                                    />
                                    <Button className='bg-green-600 text-white' onClick={handleGet}>{t('buttons.search')}</Button>
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
                                    <Button className='bg-purple-600 text-white' onClick={handleGet}>{t('buttons.getByFir')}</Button>
                                </div>
                            );
                        }

                        return (
                            <InputComponent
                                key={field.name}
                                label={field.label}
                                value={formData[field.name as keyof typeof formData]}
                                setInput={e => handleInputChange(field.name, e.target.value)}
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
                <div className='flex justify-center w-full mt-4'>
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