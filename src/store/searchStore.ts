import axios from "axios";
import { create } from "zustand";

interface searchStore {
    dbName: string;
    searchData: any[];
    setDbName: (data: string) => void;
    getSearchResult: (keyword: string, userId: string | undefined) => Promise<any>;
}

export const useSearchStore = create<searchStore>((set, get) => ({
    dbName: "",
    searchData: [],
    setDbName: (data: string) => {
        set({
            dbName: data
        })
    },
    getSearchResult: async (keyword: string, userId: string | undefined) => {
        const dbName = get().dbName
        try {

            const response = await axios.post(`/api/search?userId=${userId}`, {
                keyword, dbName
            })
            const data = response.data
            set({
                searchData: data.data
            })
            return true
        } catch (error) {
            console.error("something went wrong", error)
            return false
        }

    },
}));
