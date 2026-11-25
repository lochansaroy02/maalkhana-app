"use client";
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import DropDown from './ui/DropDown';
import { Input } from './ui/input';
// Optional: Using Lucide icons for an elegant eye icon. 
// If you don't have lucide-react installed, you can replace them with text like "Show"/"Hide".
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    // Default role is "Police Station", user can change it via the dropdown
    const [role, setRole] = useState<string>("Police Station");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const { login } = useAuthStore();
    const t = useTranslations('ui.login');

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            return toast.error(t("required"));
        }
        setIsLoading(true);

        try {
            // Send the selected role along with email and password to the API
            const response = await axios.post("/api/login", {
                email, password, role
            });
            const data = response.data;
            console.log(data);
            if (data.success) {
                login(data.token, data.user);
                toast.success(t("success"));
                router.push("/dashboard");
            } else {
                toast.error(data.message || t("failed"));
            }
        } catch (error: any) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.error || t("error");
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ FIX: Create the options array in the correct {value, label} format
    // This makes it compatible with your updated DropDown component.
    const roleOptions = [
        { value: "Police Station", label: t("policeStation") },
        { value: "District", label: t("district") },
        { value: "asp", label: t("asp") }
    ];

    return (
        <form onSubmit={handleLogin} className='flex flex-col gap-4'>
            <div>
                <label className='text-blue-100 font-semibold' htmlFor="role-select">{t("selectRole")}</label>
                {/* Pass the correctly structured 'roleOptions' array */}
                <DropDown selectedValue={role} handleSelect={setRole} options={roleOptions} />
            </div>

            <div className='flex flex-col gap-2'>
                <label className='text-blue-100' htmlFor="email">{t("email")}</label>
                <Input id="email" type="email" className='text-blue-100' value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className='flex flex-col gap-2'>
                <label className='text-blue-100' htmlFor="password">{t("password")}</label>
                <div className="relative w-full flex items-center">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className='text-blue-100 pr-10 w-full'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-blue-100/70 hover:text-blue-100 focus:outline-none cursor-pointer"
                        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className='flex justify-center mt-2'>
                <Button type="submit" className='bg-blue cursor-pointer w-full' disabled={isLoading}>
                    {isLoading ? t("loggingIn") : t("login")}
                </Button>
            </div>
        </form>
    );
};

export default LoginForm;