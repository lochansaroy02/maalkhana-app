import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DistrictUser {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    token: string | null;
    district: DistrictUser | null;
    isLoggedIn: boolean;
    login: (token: string, district: DistrictUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            district: null,
            isLoggedIn: false,

            login: (token, district) => {
                set({ token, district, isLoggedIn: true });
            },

            logout: () => {
                set({ token: null, district: null, isLoggedIn: false });
            },
        }),
        {
            name: "auth-storage", // name in localStorage
        }
    )
);
