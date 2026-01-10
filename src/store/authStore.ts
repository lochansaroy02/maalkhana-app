import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
    districtId: string,
    id: string;
    name: string;
    email: string;
    mobile: string,
    rank: string,
    policeStation: string,
    role: "district" | "policeStation" | "asp";
}

interface AuthState {
    token: string | null;
    user: User | null;
    isLoggedIn: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isLoggedIn: false,
            login: (token, user) => {
                set({ token, user, isLoggedIn: true });
            },
            logout: () => {
                set({ token: null, user: null, isLoggedIn: false });
            },
        }),
        {
            name: "auth-storage", // A name for the storage instance

            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
