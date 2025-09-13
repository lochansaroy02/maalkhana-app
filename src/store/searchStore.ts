import axios from "axios";
import { create } from "zustand";

interface YearFilter {
    from: string;
    to: string;
}

interface SearchStore {
    dbName: string;
    searchData: any[];
    year: YearFilter;
    setYear: (data: Partial<YearFilter>) => void;
    setDbName: (data: string) => void;
    getSearchResult: (keyword: string, userId: string | undefined) => Promise<boolean>;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
    dbName: "",
    year: {
        from: "",
        to: ""
    },
    setYear: (data: Partial<YearFilter>) =>
        set((state) => ({
            year: {
                ...state.year,
                ...data, // merge incoming values (can be only from, only to, or both)
            },
        })),
    searchData: [],
    setDbName: (data: string) => set({ dbName: data }),
    getSearchResult: async (keyword: string, userId: string | undefined) => {
        const dbName = get().dbName;
        try {
            const response = await axios.post(`/api/search?userId=${userId}`, {
                keyword,
                dbName,
            });

            const data = response.data;
            set({ searchData: data.data });
            return true;
        } catch (error) {
            console.error("something went wrong", error);
            return false;
        }
    },
}));
