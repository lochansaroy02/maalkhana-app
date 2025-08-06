"use client";
import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from '@/components/ui/datePicker';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useMovementStore } from '@/store/movementStore';
import { useRef, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';

const Page = () => {
    const { user } = useAuthStore();
    const { addMovementEntry } = useMovementStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isReturned, setIsReturned] = useState(false);
    const [returnBackFrom, setReturnBackFrom] = useState('');
    const [caseProperty, setCaseProperty] = useState('');

    const [formData, setFormData] = useState({
        srNo: '',
        name: '',
        moveDate: '',
        firNo: '',
        underSection: '',
        takenOutBy: '',
        moveTrackingNo: '',
        movePurpose: '',
        receviedBy: '',
        returnDate: '',
    });

    const [dateFields, setDateFields] = useState({
        moveDate: new Date(),
        returnDate: new Date()
    });

    const photoRef = useRef<HTMLInputElement>(null);
    const documentRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (fieldName: string, date: Date | undefined) => {
        setDateFields(prev => ({
            ...prev,
            [fieldName]: date,
        }));
        handleInputChange(fieldName, date?.toISOString() ?? '');
    };

    const fields = [
        { name: 'srNo', label: 'Sr. No / Mal No.' },
        { name: 'moveDate', label: 'Move Date', type: 'date' },
        { name: 'firNo', label: 'FIR No.' },
        { name: 'underSection', label: 'Under Section' },
        { name: 'takenOutBy', label: 'Taken Out By' },
        { name: 'moveTrackingNo', label: 'Move Tracking No' },
        { name: 'movePurpose', label: 'Move Purpose' },
        { name: 'name', label: 'Name' },
        { name: 'receviedBy', label: 'Recevied By' },
        { name: 'returnDate', label: 'Return Date', type: 'date' },
    ];

    const caseOptions = [
        "Cash Property", "Kukri", "FSL", "Unclaimed", "Other Entry", "Cash Entry",
        "Wine", "MV Act", "ARTO", "BNS / IPC", "Excise Vehicle", "Unclaimed Vehicle", "Seizure Entry"
    ];
    const returnBackOptions = ["Court", "FSL", "Other"];

    const inputFields = [
        { label: "Upload Photo", id: "photo", ref: photoRef },
        { label: "Upload Document", id: "document", ref: documentRef },
    ];

    const handleSave = async () => {
        const photoFile = photoRef.current?.files?.[0];
        const documentFile = documentRef.current?.files?.[0];

        try {
            setIsLoading(true);

            const userId = user?.id
            const fullData = {
                ...formData,
                returnBackFrom,
                caseProperty,
                userId,
                isReturned,
                moveDate: dateFields.moveDate?.toISOString() ?? '',
                returnDate: dateFields.returnDate?.toISOString() ?? ''
            };

            const success = await addMovementEntry(fullData);

            if (success) {
                toast.success("Data Added");
                setFormData({
                    srNo: '',
                    name: '',
                    moveDate: '',
                    firNo: '',
                    underSection: '207',
                    takenOutBy: '',
                    moveTrackingNo: '',
                    movePurpose: '',
                    receviedBy: '',
                    returnDate: '',
                });
                setDateFields({ moveDate: new Date(), returnDate: new Date() });
                setReturnBackFrom('');
                setCaseProperty('');
                setIsReturned(false);
                if (photoRef.current) photoRef.current.value = '';
                if (documentRef.current) documentRef.current.value = '';
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className='glass-effect'>
                <div className='bg-maroon rounded-t-xl py-4 border-b border-white/50 flex justify-center'>
                    <h1 className='text-2xl uppercase text-cream font-semibold'>Maalkhana Movement</h1>
                </div>

                <div className='px-8 py-4  rounded-b-md'>
                    <div className='grid grid-cols-2 gap-12'>
                        <DropDown
                            label='Case Property'
                            selectedValue={caseProperty}
                            options={caseOptions}
                            handleSelect={setCaseProperty}
                        />

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={isReturned}
                                onCheckedChange={(checked) => setIsReturned(!!checked)}
                            />
                            <label className='text-blue-100' htmlFor="isReturned">Returned</label>
                        </div>
                    </div>

                    <div className='mt-2 grid grid-cols-2 gap-4'>
                        {fields.map((field) => {
                            if (field.type === 'date') {
                                return (
                                    <DatePicker
                                        key={field.name}
                                        label={field.label}
                                        date={dateFields[field.name as keyof typeof dateFields]}
                                        setDate={(date) => handleDateChange(field.name, date)}
                                    />
                                );
                            }

                            return (
                                <InputComponent
                                    key={field.name}
                                    label={field.label}
                                    value={formData[field.name as keyof typeof formData]}
                                    setInput={(e) => handleInputChange(field.name, e.target.value)}
                                />
                            );
                        })}

                        <DropDown
                            label='Return Back From'
                            selectedValue={returnBackFrom}
                            options={returnBackOptions}
                            handleSelect={setReturnBackFrom}
                        />

                        {
                            inputFields.map((item, index) => (
                                <div key={index} className='flex  flex-col gap-2  justify-between'>
                                    <label className='text-nowrap text-blue-100' htmlFor={item.id}>{item.label}</label>
                                    <input
                                        ref={item.ref}
                                        className='text-blue-100 rounded-xl glass-effect px-2 py-1'
                                        id={item.id}
                                        type='file'
                                    />
                                </div>
                            ))}
                    </div>

                    <div className='flex w-full px-12 justify-between mt-4'>
                        {["Save", "Print", "Modify", "Delete"].map((item, index) => (
                            <Button
                                key={index}
                                onClick={() => item === "Save" ? handleSave() : console.log(`${item} clicked`)}
                                className='bg-blue border border-white/50 text-blue-50'
                            >
                                {isLoading && item === "Save" ? <LoaderIcon className='animate-spin' /> : item}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
