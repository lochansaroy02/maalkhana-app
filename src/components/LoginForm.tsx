"use client";
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import DropDown from './ui/DropDown';
import { Input } from './ui/input';

const LoginForm = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    // Default role is "Police Station", user can change it via the dropdown
    const [role, setRole] = useState<string>("Police Station");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const { login } = useAuthStore();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            return toast.error("Email and password are required.");
        }
        setIsLoading(true);

        try {
            // Send the selected role along with email and password to the API
            const response = await axios.post("/api/login", {
                email, password, role
            });
            const data = response.data;

            if (data.success) {
                // The user object from the API now includes the role
                login(data.token, data.user);
                toast.success("Successfully Logged In");
                router.push("/dashboard");
            } else {
                toast.error(data.message || "Login Failed. Please check your credentials.");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.error || "An error occurred during login.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className='flex flex-col  gap-4'>
            {/* 1. Enabled the dropdown for role selection */}
            <div>
                <label className='text-blue-100 font-semibold' htmlFor="role-select">Login AS</label>
                <DropDown selectedValue={role} handleSelect={setRole} options={["Police Station", "District"]} />
            </div>

            <div className='flex flex-col gap-2'>
                <label className='text-blue-100' htmlFor="email">Email</label>
                <Input id="email" type="email" className='text-blue-100' value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className='flex flex-col gap-2'>
                <label className='text-blue-100' htmlFor="password">Password</label>
                <Input id="password" type="password" className='text-blue-100' value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className='flex justify-center mt-2'>
                <Button type="submit" className='bg-blue cursor-pointer w-full' disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
            </div>
        </form>
    );
};

export default LoginForm;
