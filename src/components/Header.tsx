"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const Header = () => {
    const { isLoggedIn, logout } = useAuthStore();
    const router = useRouter();
    const [hasHydrated, setHasHydrated] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    useEffect(() => {
        if (hasHydrated && !isLoggedIn) {
            router.push("/");
        }
    }, [hasHydrated, isLoggedIn]);

    return (
        <div className="fixed w-[80%] glass-effect z-40 bg-amber-300 flex">
            <div className="flex items-center p-4 justify-between w-full">
                <div>
                    <h1 className="text-xl font-bold text-blue-300">Malkhana Application</h1>
                </div>
                <Button onClick={handleLogout} className="bg-blue cursor-pointer">
                    {isLoggedIn ? "Logout" : "Login"}
                </Button>
            </div>
        </div>
    );
};

export default Header;
