"use client";

import { useAuthStore } from "@/store/authStore";
import { useBackupStore } from "@/store/backupStore";
import { useDistrictStore } from "@/store/districtStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { DatabaseBackup, Loader2, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import DropDown from "./ui/DropDown";

const Header = () => {
    const { createBackup } = useBackupStore();
    const { getAllUsers, setUserId, userId } = useDistrictStore();
    const { isLoggedIn, logout, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [hasHydrated, setHasHydrated] = useState(false);
    const [userData, setUserData] = useState([]);
    const [userOptions, setUserOptions] = useState<any[]>([]);
    const [selectedUser, setselectedUser] = useState("");
    const [isBackingUp, setIsBackingUp] = useState(false);
    const { toggleOpen } = useSidebarStore();
    // 💡 New state for online status
    const [isOnline, setIsOnline] = useState(true);


    const handleLogout = () => {
        logout();
        router.replace("/");
        router.refresh(); // Refreshes the current route (server components too)
    };
    const getUserData = async () => {
        if (user?.role === "district") {
            const data = await getAllUsers(user?.id);
            // 👀 check shape
            setUserData(Array.isArray(data) ? data : data.data || []);
        }
    };

    useEffect(() => {
        if (user?.role === 'district') {
            getUserData()
        }
    }, [user])

    useEffect(() => {
        if (hasHydrated && !isLoggedIn) {
            router.push("/");
        }
    }, [hasHydrated, isLoggedIn, router]);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    // 💡 Effect to check and manage online status
    useEffect(() => {
        // Initial check
        setIsOnline(window.navigator.onLine);

        // Handlers for online/offline events
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup: remove event listeners when component unmounts
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    if (!hasHydrated) {
        return null;
    }

    const handleBackup = async () => {
        setIsBackingUp(true); // Start loader
        try {
            const { message, success } = await createBackup(user?.id);

            if (success) {
                toast.success(message || 'Backup sent to Email');
            } else {
                toast.error(message || 'Failed to create backup.');
            }
        } catch (backupError) {
            console.error("Backup failed:", backupError);
            toast.error('An unexpected error occurred during backup.');
        } finally {
            setIsBackingUp(false);
        }
    }

    const handleClick = () => {
        toggleOpen();
    };

    // remove first segment if it is a locale (en or hi)
    const getPathWithoutLocale = () => {
        const parts = pathname.split("/");
        if (["en", "hi"].includes(parts[1])) {
            return "/" + parts.slice(2).join("/");
        }
        return pathname;
    };

    const handleLocaleChange = (locale: string) => {
        const newPath = `/${locale}${getPathWithoutLocale()}`;
        router.push(newPath);
    };

    return (
        <div className="fixed w-full lg:w-[80%] glass-effect z-40  flex">
            <div className="flex items-center p-4 justify-between  w-full">
                <button className="lg:hidden" onClick={toggleOpen}>
                    <Menu className="text-blue-100" />
                </button>

                <div className="flex items-center gap-2"> {/* 💡 Added flex container for title and dot */}
                    <h1 className="lg:text-xl text-base font-bold text-blue-300">
                        Digital Malkhana
                    </h1>
                    {/* 💡 Online Status Dot */}
                    <div
                        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
                        title={isOnline ? 'Online' : 'Offline'}
                    />
                </div>

                <div className="flex w-1/2 gap-4 px-2  items-center">
                    {user?.role === 'district' && (
                        <DropDown
                            selectValueLabel="Select Police station"
                            options={userData.map((item: any) => ({
                                value: item.id,
                                label: item.policeStation,
                            }))}
                            selectedValue={userId}
                            handleSelect={setUserId}
                        />
                    )}
                    <div className="w-1/2">
                        <select
                            className="rounded-lg w-fit glass-effect text-blue-100  px-2 py-1"
                            onChange={(e) => handleLocaleChange(e.target.value)}
                            defaultValue={pathname.split("/")[1] || "en"}
                        >

                            <option className=" bg-blue " value="en">english</option>
                            <option className=" bg-blue " value="hi">हिंदी</option>
                        </select>
                    </div>
                    <Button
                        onClick={handleLogout}
                        className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    >
                        {isLoggedIn ? "Logout" : "Login"}
                        <LogOut />
                    </Button>

                    {isLoggedIn && user?.id && (
                        <Link href={`/${user.id}`} passHref>
                            <Button asChild className="rounded-full bg-blue hover:bg-blue/50 cursor-pointer">
                                <h1>{user.name.charAt(0).toUpperCase()}</h1>
                            </Button>
                        </Link>
                    )}

                    <div>
                        <Button onClick={handleBackup} disabled={isBackingUp}>
                            <DatabaseBackup />
                            {isBackingUp ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Backup...
                                </>
                            ) : (
                                'Backup'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Header;