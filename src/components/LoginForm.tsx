"use client";
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import DropDown from './ui/DropDown';
import { Input } from './ui/input';



const LoginForm = () => {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [role, setRole] = useState<string>("")
    const router = useRouter()

    const { login, isLoggedIn, token } = useAuthStore();

    useEffect(() => {
        if (isLoggedIn && token) {
            router.push("/dashboard")
        } else {
            router.push("/")
        }
    }, [isLoggedIn])

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        const response = await axios.post("/api/login", {
            email, password
        },)
        const data = response.data;
        if (data.success) {
            login(data.token, data.user);
            toast.success("Succesfully LoggedIn")
            router.push("/dashboard");
        } else {
            toast.error("Login Failed")
        }
    }

    return (
        <form onSubmit={handleLogin} className='flex flex-col  gap-4'>
            <div>
                <label className='text-blue-100 font-semibold' htmlFor="">Login AS </label>
                <DropDown selectedValue={role} handleSelect={setRole} options={["Police Station", "District"]} />
            </div>

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