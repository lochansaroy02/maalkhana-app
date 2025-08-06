import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string;
    name: string;
    email: string;
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
            name: "auth-storage", // name in localStorage
        }
    )
);
