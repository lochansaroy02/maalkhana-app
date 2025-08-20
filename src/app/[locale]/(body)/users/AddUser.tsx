"use client";

import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import DropDown from '@/components/ui/DropDown';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type ModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
};

const AddUser = ({ setIsModalOpen }: ModalProps) => {
    const { addUser } = useUserStore();
    const { user, isLoggedIn } = useAuthStore();
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

    // ✅ FIX: Create the options array in the correct {value, label} format.
    // This makes it compatible with your updated DropDown component.
    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
    ];

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleClick = async () => {
        try {
            const { name, email, password, role } = formData;
            if (!name || !email || !password || !role) {
                // Also check for role
                toast.error('Please enter all required fields');
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
                toast.success("User Added");
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error("Failed to add user.");
            console.error(error);
        }
    };

    const fields = [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Password', key: 'password' },
        { label: 'Mobile No', key: 'mobileNo' },
        { label: 'Rank', key: 'rank' },
        { label: 'Police Station', key: 'policeStation' },
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
                <h1 className='text-blue-100 mt-4 text-xl'>Add User</h1>
                <div className='px-2 py-1 gap-2 flex mt-8 flex-col'>
                    <div className='grid grid-cols-2 gap-2'>
                        <DropDown
                            label='Set Role'
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
