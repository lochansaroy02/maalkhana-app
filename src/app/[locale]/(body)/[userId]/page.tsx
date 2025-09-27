"use client";

import InputComponent from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios'; // 1. Import axios
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

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
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="mt-2 text-gray-600">You are not authorized to view this page.</p>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validation
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
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
            setSuccess(response.data.message || 'Password updated successfully!');

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
        <div className="h-screen mx-auto mt-8 ">
            <div className="flex justify-center py-4 border  border-white/50 rounded-xl bg-maroon">
                <h1 className="text-textColor text-2xl text-blue-100 font-bold">User Profile</h1>
            </div>

            <div className='flex flex-col md:flex-row gap-8 glass-effect p-6 rounded-lg'>
                <div className='p-6 flex-1'>
                    <p className="text-gray-400 mb-6">Manage your account details here.</p>
                    <div className="glass-effect text-blue-100 p-4 rounded-lg mb-8">
                        <p><strong>Name:</strong> {user?.name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Mobile No.:</strong> {user?.mobile || 'N/A'}</p>
                        <p><strong>Rank:</strong> {user?.rank || 'N/A'}</p>
                        <p><strong>Police Station:</strong> {user?.policeStation || 'N/A'}</p>
                    </div>


                </div>

                <div className='flex items-center p-6 flex-1 flex-col justify-center'>
                    <h2 className="text-xl text-blue-100 font-semibold border-b border-gray-600 pb-2 mb-6 w-full text-center">Change Password</h2>
                    <form onSubmit={handleSubmit} className="w-full max-w-sm">
                        <AlertMessage message={error} type="error" />
                        <AlertMessage message={success} type="success" />

                        <div className="mb-4">
                            <InputComponent label='Current Password' type='password' value={currentPassword} setInput={(e) => { setCurrentPassword(e.target.value) }} />
                        </div>
                        <div className="mb-4">
                            <InputComponent label='New Password' type='password' value={newPassword} setInput={(e) => { setNewPassword(e.target.value) }} />
                        </div>
                        <div className="mb-6">
                            <InputComponent label='Confirm New Password' type='password' value={confirmPassword} setInput={(e) => { setConfirmPassword(e.target.value) }} />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;