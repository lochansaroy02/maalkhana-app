"use client";

import InputComponent from '@/components/InputComponent';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios'; // 1. Import axios
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useFieldLabel } from '@/utils/useFieldLabel';

// A simple component to display messages (success or error)
const AlertMessage = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
    if (!message) return null;
    const baseClasses = "p-4 rounded-md my-4 text-sm";
    const typeClasses = type === 'success'
        ? "bg-green-100 border border-green-400 text-green-700"
        : "bg-red-100 border border-red-400 text-red-700";
    return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
};


const UserProfilePage = () => {
    const t = useTranslations('ui.profile');
    const tc = useTranslations('ui.common');
    const fl = useFieldLabel();

    const params = useParams();
    const { userId: pageUserId } = params;
    const { user } = useAuthStore();


    // State for the form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for API call feedback
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    // Security check: Ensure the logged-in user is viewing their own page
    if (user?.id !== pageUserId) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">{t('accessDenied')}</h1>
                <p className="mt-2 text-gray-600">{t('notAuthorized')}</p>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validation
        if (newPassword !== confirmPassword) {
            setError(t('mismatch'));
            return;
        }

        if (newPassword.length < 6) {
            setError(t('tooShort'));
            return;
        }

        setIsLoading(true);

        try {
            // 2. Use axios.post to send the request
            const response = await axios.post('/api/user/change-password', {
                userId: user?.id,
                currentPassword,
                newPassword,
            });

            // With axios, the response data is directly on the `data` property
            setSuccess(t('updated'));

            // Clear form fields on success
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err: any) {
            // 3. Handle axios-specific error structure
            console.error("Password update error:", err);
            // The error message from the API is often in `err.response.data.error`
            const errorMessage = err.response?.data?.error || 'An unexpected error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="h-screen mx-auto glass-effect  ">

            <div className="flex justify-center py-4 border  border-white/50 rounded-t-xl bg-maroon">
                <h1 className="text-textColor text-2xl text-blue-100 font-bold">{t('title')}</h1>
            </div>

            <div className='flex flex-col md:flex-row gap-8  p-6 '>
                <div className='p-6 flex-1'>
                    <p className="text-gray-400 mb-6">{t('subtitle')}</p>
                    <div className="glass-effect text-blue-100 p-4 rounded-lg mb-8">
                        <p><strong>{fl('name')}:</strong> {user?.name}</p>
                        <p><strong>{fl('email')}:</strong> {user?.email}</p>
                        <p><strong>{fl('mobileNo')}:</strong> {user?.mobile || tc('na')}</p>
                        <p><strong>{fl('rank')}:</strong> {user?.rank || tc('na')}</p>
                        <p><strong>{fl('policeStation')}:</strong> {user?.policeStation || tc('na')}</p>
                    </div>


                </div>

                <div className='flex items-center p-6 flex-1 flex-col justify-center'>
                    <h2 className="text-xl text-blue-100 font-semibold border-b border-gray-600 pb-2 mb-6 w-full text-center">{t('changePassword')}</h2>
                    <form onSubmit={handleSubmit} className="w-full max-w-sm">
                        <AlertMessage message={error} type="error" />
                        <AlertMessage message={success} type="success" />

                        <div className="mb-4">
                            <InputComponent label={t('currentPassword')} type='password' value={currentPassword} setInput={(e) => { setCurrentPassword(e.target.value) }} />
                        </div>
                        <div className="mb-4">
                            <InputComponent label={t('newPassword')} type='password' value={newPassword} setInput={(e) => { setNewPassword(e.target.value) }} />
                        </div>
                        <div className="mb-6">
                            <InputComponent label={t('confirmPassword')} type='password' value={confirmPassword} setInput={(e) => { setConfirmPassword(e.target.value) }} />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? t('updating') : t('update')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;