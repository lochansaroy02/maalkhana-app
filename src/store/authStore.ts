import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
    id: string;
    name: string;
    email: string;
    mobile: string,
    rank: string,
    policeStation: string,
    role: "district" | "policeStation";
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

            // --- THIS IS THE ONLY CHANGE ---
            // This line tells Zustand to use sessionStorage instead of localStorage.
            // sessionStorage is automatically cleared when the browser tab is closed.
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
