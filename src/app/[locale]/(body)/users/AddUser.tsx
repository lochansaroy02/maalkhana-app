"use client";

import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useFieldLabel } from '@/utils/useFieldLabel';
import toast from 'react-hot-toast';

type ModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
};

const AddUser = ({ setIsModalOpen }: ModalProps) => {
    const { addUser } = useUserStore();
    const { user, isLoggedIn } = useAuthStore();
    const t = useTranslations("ui.users");
    const fl = useFieldLabel();
    const [districtId, setDistrictId] = useState<string>("");
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        policeStation: '',
        rank: '',
        mobileNo: '',
        role: '',
    });

    useEffect(() => {
        if (isLoggedIn && user?.role === "district") {
            setDistrictId(user.id);
        }
    }, [user?.id, isLoggedIn]);


    const roleOptions = [
        { value: 'admin', label: t('admin') },
        { value: 'user', label: t('user') },
    ];

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleClick = async () => {
        try {
            const { name, email, password, role } = formData;
            if (!name || !email || !password || !role) {
                // Also check for role
                toast.error(t('required'));
                return;
            }

            const fullData = {
                ...formData,
                districtId
            };
            const success = await addUser(fullData);
            if (success) {
                setFormData({
                    email: "",
                    mobileNo: '',
                    name: "",
                    password: '',
                    policeStation: '',
                    rank: '',
                    role: ''
                });
                toast.success(t("added"));
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error(t("addFailed"));
            console.error(error);
        }
    };

    const fields = [
        { label: fl('name'), key: 'name' },
        { label: fl('email'), key: 'email' },
        { label: fl('password'), key: 'password' },
        { label: fl('mobileNo'), key: 'mobileNo' },
        { label: fl('rank'), key: 'rank' },
        { label: fl('policeStation'), key: 'policeStation' },
    ];

    return (
        <div className='bg-black/80 absolute backdrop-blur-3xl z-20 inset-0 flex pt-12 justify-center w-full h-full'>
            <div className='glass-effect w-3/4 h-3/4 relative flex flex-col items-center'>
                <Button
                    onClick={() => setIsModalOpen(false)}
                    className='absolute right-2 top-2 cursor-pointer rounded-full bg-red-900'
                >
                    <X />
                </Button>
                <h1 className='text-blue-100 mt-4 text-xl'>{t('addUser')}</h1>
                <div className='px-2 py-1 gap-2 flex mt-8 flex-col'>
                    <div className='grid grid-cols-2 gap-2'>
                        <DropDown
                            label={t('setRole')}
                            options={roleOptions}
                            selectedValue={formData.role}
                            handleSelect={(value) => handleChange('role', value)}
                        />
                        {fields.map(({ label, key }) => (
                            <InputComponent
                                key={key}
                                label={label}
                                value={formData[key as keyof typeof formData]}
                                setInput={(e) => handleChange(key, e.target.value)}
                            />
                        ))}
                    </div>
                    <div className='flex justify-center mt-4'>
                        <Button onClick={handleClick} className='bg-blue'>
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUser;
