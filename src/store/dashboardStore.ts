import axios from 'axios';
import { create } from 'zustand';

// 1. Define the specific breakdown for Malkhana and Vehicles
interface CategoryStats {
    total: number;
    release: number;
    movement: number;
    destroy: number;
    nilami: number;
    returned: number;
}

// 2. Define the main Breakdown structure matching your API
interface DashboardBreakdown {
    totalEntries: number;
    totalReturn: number;
    totalMovement: number;
    totalRelease: number;
    totalPoliceStation?: number; // Optional for admin view

    // Nested Category Objects
    malkhana: CategoryStats;
    seizedVehicle: CategoryStats;

    // Financials & Special Items
    totalCash: number;
    totalYellowItems: number;
    wine: {
        desi: number;
        english: number;
        total: number;
    };
}

interface DashboardData {
    success: boolean;
    breakdown: DashboardBreakdown;
}

interface TotalEntriesStore {
    data: any | null;
    loading: boolean;
    error: string | null;
    fetchTotalEntries: (userId: string | undefined) => Promise<void>;
    fetchAdminEntries: () => Promise<void>;
}

export const useTotalEntriesStore = create<TotalEntriesStore>((set) => ({
    data: null,
    loading: false,
    error: null,

    fetchTotalEntries: async (userId: string | undefined) => {
        if (!userId) return;
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`/api/report?userId=${userId}`);
            set({
                data: response.data,
                loading: false,
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || err.message || 'Something went wrong',
                loading: false
            });
        }
    },

    fetchAdminEntries: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`/api/report/get-all`);
            set({
                data: response.data,
                loading: false,
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || err.message || 'Something went wrong',
                loading: false
            });
        }
    },
}));