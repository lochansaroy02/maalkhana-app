import axios from 'axios';
import { create } from 'zustand';

interface TotalEntries {
    total: number;
    breakdown: {
        entry: number;
        movement: number;
        release: number;
        siezed: number;
        wine: number
        destroy: number
        nilami: number
    };
}

interface TotalEntriesStore {
    data: any | null;
    loading: boolean;
    error: string | null;
    fetchTotalEntries: (userId: string | undefined) => Promise<void>;
}

export const useTotalEntriesStore = create<TotalEntriesStore>((set) => ({
    data: null,
    loading: false,
    error: null,

    fetchTotalEntries: async (userId: string | undefined) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`/api/report?userId=${userId}`);
            const data = response.data;
            set({
                data: {
                    total: data.total,
                    breakdown: data.breakdown,
                },
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message || 'Something went wrong', loading: false });
        }
    },
}));
