"use client";

import { useAuthStore } from "@/store/authStore";
import { useDistrictStore } from "@/store/districtStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import DropDown from "./ui/DropDown";

const Header = () => {



    
    const { getAllUsers } = useDistrictStore()
    const { isLoggedIn, logout, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [hasHydrated, setHasHydrated] = useState(false);
    const [userData, setUserData] = useState([]);
    const [userOptions, setUserOptions] = useState<any[]>([])
    const [selectedUser, setselectedUser] = useState("")

    const { toggleOpen } = useSidebarStore();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getUserData = async () => {
        if (user?.role === "district") {
            const data = await getAllUsers(user?.id);
            console.log("Fetched users:", data); // 👀 check shape
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


    if (!hasHydrated) {
        return null;
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

                <div className="">
                    <h1 className="lg:text-xl text-base font-bold text-blue-300">
                        Digital Malkhana
                    </h1>
                </div>

                <div className="flex w-1/2 gap-4 px-2 items-center">
                    {user?.role === 'district' && (
                        <DropDown
                            selectValueLabel="Select Police station"
                            options={userData.map((item: any) => ({
                                value: item.id,
                                label: item.policeStation,
                            }))}
                            selectedValue={selectedUser}
                            handleSelect={setselectedUser}
                        />
                    )}
                    <div className="w-1/2">
                        <select
                            className="rounded-lg w-full glass-effect text-blue-100  px-2 py-1"
                            onChange={(e) => handleLocaleChange(e.target.value)}
                            defaultValue={pathname.split("/")[1] || "en"}
                        >

                            <option className=" bg-blue " value="en">English</option>
                            <option className=" bg-blue " value="hi">हिंदी</option>
                        </select>
                    </div>
                    <Button
                        onClick={handleLogout}
                        className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    >
                        {isLoggedIn ? "Logout" : "Login"}
                    </Button>

                    {isLoggedIn && user?.id && (
                        <Link href={`/${user.id}`} passHref>
                            <Button asChild className="rounded-full bg-blue hover:bg-blue/50 cursor-pointer">
                                <a>{user.name.charAt(0).toUpperCase()}</a>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Header;






