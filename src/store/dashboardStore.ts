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

// Only the most recent request may update the store. On a page reload the
// dashboard fires the admin request before the logged-in user is restored
// from storage; without this guard that slower, stale response could
// overwrite the police-station data (cards showed 0).
let latestRequest = 0;

export const useTotalEntriesStore = create<TotalEntriesStore>((set) => ({
    data: null,
    loading: false,
    error: null,

    fetchTotalEntries: async (userId: string | undefined) => {
        if (!userId) return;
        const requestId = ++latestRequest;
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`/api/report?userId=${userId}`);
            if (requestId !== latestRequest) return;
            set({
                data: response.data,
                loading: false,
            });
        } catch (err: any) {
            if (requestId !== latestRequest) return;
            set({
                error: err.response?.data?.message || err.message || 'Something went wrong',
                loading: false
            });
        }
    },

    fetchAdminEntries: async () => {
        const requestId = ++latestRequest;
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`/api/report/get-all`);
            if (requestId !== latestRequest) return;
            set({
                data: response.data,
                loading: false,
            });
        } catch (err: any) {
            if (requestId !== latestRequest) return;
            set({
                error: err.response?.data?.message || err.message || 'Something went wrong',
                loading: false
            });
        }
    },
}));