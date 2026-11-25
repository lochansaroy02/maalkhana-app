"use client";

import { useAuthStore } from "@/store/authStore";
import { useDistrictStore } from "@/store/districtStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { Building2, ChevronDown, DatabaseBackup, LogOut, Menu, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BackupModal from "./BackupModal";
import LanguageSwitch from "./LanguageSwitch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const iconBtn =
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-2.5 text-sm font-medium text-blue-100 " +
    "transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-60";

const Header = () => {
    const t = useTranslations("Header");
    const { getAllUsers, setUserId, userId } = useDistrictStore();
    const { isLoggedIn, logout, user } = useAuthStore();
    const { toggleOpen } = useSidebarStore();
    const router = useRouter();

    const [hasHydrated, setHasHydrated] = useState(false);
    const [stations, setStations] = useState<{ id: string; policeStation: string }[]>([]);
    const [backupOpen, setBackupOpen] = useState(false);

    useEffect(() => setHasHydrated(true), []);

    useEffect(() => {
        if (hasHydrated && !isLoggedIn) router.push("/");
    }, [hasHydrated, isLoggedIn, router]);

    // District admins can switch between their police stations.
    useEffect(() => {
        if (user?.role !== "district") return;
        (async () => {
            const data = await getAllUsers(user.id);
            setStations(Array.isArray(data) ? data : data?.data || []);
        })();
    }, [user, getAllUsers]);

    if (!hasHydrated) return null;

    const handleLogout = () => {
        logout();
        router.replace("/");
        router.refresh();
    };

    const roleLabel = user?.role ? t(`roles.${user.role}`) : "";
    const subtitle = [user?.policeStation, roleLabel].filter(Boolean).join(" · ");
    const initials = (user?.name || "?")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");

    return (
        <header className="glass-effect fixed z-40 flex w-full lg:w-[80%]">
            <div className="flex w-full items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
                {/* Left: menu + brand */}
                <div className="flex min-w-0 items-center gap-3">
                    <button className={`${iconBtn} lg:hidden`} onClick={toggleOpen} aria-label={t("menu")}>
                        <Menu size={18} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="truncate text-base font-bold leading-tight text-blue-100 lg:text-xl">{t("appName")}</h1>
                        {subtitle && <p className="truncate text-xs text-blue-100/60">{subtitle}</p>}
                    </div>
                </div>

                {/* Right: controls */}
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    {user?.role === "district" && (
                        <label className="relative hidden items-center md:flex" title={t("station")}>
                            <Building2 size={15} className="pointer-events-none absolute left-2.5 text-blue-100/70" />
                            <select
                                aria-label={t("station")}
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="h-9 max-w-[220px] appearance-none truncate rounded-lg border border-white/30 bg-white/10 pl-8 pr-8 text-sm text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 [&>option]:bg-blue"
                            >
                                <option value="">{t("selectStation")}</option>
                                {stations.map((s) => (
                                    <option key={s.id} value={s.id}>{s.policeStation}</option>
                                ))}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-2.5 text-blue-100/70" />
                        </label>
                    )}

                    <LanguageSwitch />

                    {isLoggedIn && user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={`${iconBtn} rounded-full pl-1 pr-2`} aria-label={t("account")}>
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-maroon text-xs font-bold text-cream ring-1 ring-white/30">
                                        {initials}
                                    </span>
                                    <ChevronDown size={14} className="text-blue-100/70" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60 border-white/20 bg-blue-dark text-blue-100">
                                <DropdownMenuLabel className="font-normal">
                                    <p className="truncate font-semibold text-blue-100">{user.name}</p>
                                    <p className="truncate text-xs text-blue-100/60">{user.email}</p>
                                    {roleLabel && (
                                        <span className="mt-1.5 inline-block rounded-md bg-maroon px-1.5 py-0.5 text-[11px] font-semibold text-cream">{roleLabel}</span>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/15" />
                                <DropdownMenuItem onSelect={() => router.push(`/${user.id}`)} className="cursor-pointer text-blue-100 focus:bg-white/10 focus:text-blue-100">
                                    <UserRound size={16} /> {t("profile")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setBackupOpen(true)} className="cursor-pointer text-blue-100 focus:bg-white/10 focus:text-blue-100">
                                    <DatabaseBackup size={16} /> {t("backup")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/15" />
                                <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-red-300 focus:bg-red-500/15 focus:text-red-200">
                                    <LogOut size={16} /> {t("logout")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
            {backupOpen && user && <BackupModal userId={user.id} role={user.role} onClose={() => setBackupOpen(false)} />}
        </header>
    );
};

export default Header;
