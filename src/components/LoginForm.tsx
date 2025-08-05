"use client";
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const LoginForm = () => {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")


    const router = useRouter()

    const { login } = useAuthStore();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        const response = await axios.post("/api/login", {
            email, password
        },)
        const data = response.data;
        console.log(data)
        if (data.success) {
            login(data.token, data.district);
            router.push("/dashboard"); // or any other route
        } else {
            alert(data.error || "Login failed");
        }
    }

    return (
        <form onSubmit={handleLogin} className='flex flex-col  gap-4'>
            <div className='flex flex-col gap-2 '>
                <label className='text-blue-100' htmlFor="">Email</label>
                <Input className='text-blue-100' value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className='flex flex-col gap-2 '>
                <label className='text-blue-100' htmlFor="">Password</label>
                <Input className='text-blue-100' value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className='flex justify-center'>
                <Button className='bg-blue cursor-pointer ' onClick={handleLogin}>Login</Button>
            </div>
        </form>
    )
}

export default LoginForm