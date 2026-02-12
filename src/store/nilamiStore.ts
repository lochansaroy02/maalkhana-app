import axios from 'axios';
import { create } from 'zustand';
import { useMaalkhanaStore } from './malkhana/maalkhanaEntryStore';
import { useSeizedVehicleStore } from './siezed-vehical/seizeStore';

// NilamiStore orchestrates fetching and updating data for auctions
type NilamiStore = {
    fetchByFIR: (userId: string | undefined, type: string, firNo?: string, srNo?: string) => Promise<any | null>;
    updateNilamiEntry: (id: string, type: string, updatedData: any) => Promise<boolean>;
};

export const useNilamiStore = create<NilamiStore>((set, get) => ({

    /**
     * Fetches details for an item by FIR No or Sr No specifically for Nilami processing.
     * Route: /api/nilami/fir
     */
    fetchByFIR: async (userId: string | undefined, type: string, firNo?: string, srNo?: string) => {
        try {
            // Updated route to /api/nilami/fir as per your requirement
            const response = await axios.get(`/api/nilami/fir?userId=${userId}&type=${type}&firNo=${firNo || ''}&srNo=${srNo || ''}`);
            const data = response.data;

            if (data.success) {
                return {
                    data: data.data,
                    success: data.success
                };
            }
            return null;

        } catch (error: any) {
            console.error("Error in Nilami FetchByFIR:", error.response?.data?.message || error.message);
            return null;
        }
    },

    /**
     * Updates the specific entry as auctioned (Nilami).
     * Re-uses the existing store update logic for malkhana and seized vehicles.
     */
    updateNilamiEntry: async (id: string, type: string, updatedData: any) => {
        try {
            let success = false;



            // Ensure data includes the nilami status flag if not already present
            const nilamiPayload = {
                ...updatedData,
                isNilami: true,
                status: "Auctioned" // Optional: Update status to track item lifecycle
            };

            if (type === 'malkhana') {
                const { updateMalkhanaEntry } = useMaalkhanaStore.getState();
                success = await updateMalkhanaEntry(id, nilamiPayload);
            } else if (type === 'seizedVehicle' || type === 'siezed vehical') {
                const { updateVehicalEntry } = useSeizedVehicleStore.getState();
                success = await updateVehicalEntry(id, nilamiPayload);
            }
            return success;
        } catch (err) {
            console.error("Error in updateNilamiEntry:", err);
            return false;
        }
    },

    resetForm: () => {
        // Optional: clear any local state if added in the future
    }
}));