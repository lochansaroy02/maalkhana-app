import axios from "axios";
import { create } from "zustand";

interface User {
    name: string;
    policeStation: string;
    rank: string;
    role: string;
    mobileNo: string;
    email: string;
    districtId: string;
}

const initialState: User = {
    name: "",
    policeStation: "",
    rank: "",
    role: "",
    mobileNo: "",
    email: "",
    districtId: ""
};

interface UserStore {
    userData: User;
    users: User[];
    isLoading: boolean;
    addUser: (user: User) => Promise<boolean>;
    getUsers: (districtId: string) => Promise<void>;
    deleteUsers: (userIds: string[]) => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
    userData: { ...initialState },
    users: [],
    isLoading: false,

    addUser: async (userData: User) => {
        set({ isLoading: true });
        try {
            const response = await axios.post("/api/user", userData);
            const createdUser: User = response.data.data;
            const success = response.data.success;
            if (success) {
                set((state) => ({
                    users: [...state.users, createdUser],
                    userData: createdUser,
                    isLoading: false,
                }));
                return success;
            } else {
                return false;
            }

        } catch (error) {
            console.error("Error while creating new user:", error);
            set({ isLoading: false });
        }
    },

    getUsers: async (districtId: string) => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`/api/user?districtId=${districtId}`);
            const users: User[] = response.data.data;

            set({ users, isLoading: false });
        } catch (error) {
            console.error("Error fetching users:", error);
            set({ isLoading: false });
        }
    },
    deleteUsers: async (userIds: string[]) => {
        try {
            await axios.delete("/api/user", {
                data: { ids: userIds }
            });
            set((state) => ({
                users: state.users.filter(user => !userIds.includes((user as any).id))
            }));
        } catch (error) {
            console.error("Error deleting users:", error);
        }
    }

}));
