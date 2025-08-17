"use client";

import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { Menu } from "lucide-react";
import Link from "next/link"; // Import the Link component
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const Header = () => {
    // Assuming your store has a 'user' object with an 'id'
    const { isLoggedIn, logout, user } = useAuthStore();
    const router = useRouter();
    const [hasHydrated, setHasHydrated] = useState(false);

    const { isOpen, setIsOpen, toggleOpen } = useSidebarStore()
    const handleLogout = () => {
        logout();
        router.push("/");
    };

    // This effect ensures the component is mounted on the client before using the store
    useEffect(() => {
        setHasHydrated(true);
    }, []);

    // This effect handles redirection if the user is not logged in
    useEffect(() => {
        if (hasHydrated && !isLoggedIn) {
            router.push("/");
        }
    }, [hasHydrated, isLoggedIn, router]);

    // Don't render anything until hydration is complete to avoid flash of incorrect content
    if (!hasHydrated) {
        return null;
    }



    const handleClick = () => {
        toggleOpen()
    }

    return (
        <div className="fixed w-full  lg:w-[80%] glass-effect z-40 bg-amber-300 flex">
            <div className="flex items-center p-4 justify-between w-full">
                <button className="lg:hidden" onClick={handleClick}>
                    <Menu className="text-blue-100" />
                </button>

                <div>
                    <h1 className="lg:text-xl text-base font-bold text-blue-300">Digital Malkhana</h1>
                </div>
                <div className="flex gap-4 px-2 items-center">
                    <Button onClick={handleLogout} className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
                        {isLoggedIn ? "Logout" : "Login"}
                    </Button>

                    {/* Only show the profile link if the user is logged in */}
                    {isLoggedIn && user?.id && (
                        <Link href={`/${user.id}`} passHref>
                            <Button asChild className="rounded-full bg-blue hover:bg-blue/50 cursor-pointer ">
                                {/* The anchor tag is needed for some accessibility and styling cases */}
                                <a>{user.name.charAt(0).toUpperCase()}</a>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
