import axios from 'axios';
import { create } from 'zustand';
import { useMaalkhanaStore } from './malkhana/maalkhanaEntryStore';
import { useSeizedVehicleStore } from './siezed-vehical/seizeStore';

// This store will now correctly orchestrate fetching and updating.

type ReleaseStore = {
    // Fetches the ORIGINAL item to be released and returns it
    FetchByFIR: (type: string, firNo?: string, srNo?: string) => Promise<any | null>;

    // Updates the ORIGINAL item with release data
    updateReleaseEntry: (id: string, type: string, updatedData: any) => Promise<boolean>;

    // Reset form function (can be added if needed)
    resetForm: () => void;
};


export const useReleaseStore = create<ReleaseStore>((set, get) => ({

    FetchByFIR: async (type: string, firNo?: string, srNo?: string) => {
        try {
            // We use our new, dedicated API route for fetching
            const response = await axios.get(`/api/movement/fir?type=${type}&firNo=${firNo}&srNo=${srNo}`, {
                params: { type, firNo, srNo }
            });

            if (response.data.success) {
                return response.data.data;
            }
            return null;

        } catch (error: any) {
            console.error("Error in FetchByFIR:", error.response?.data?.message || error.message);
            return null;
        }
    },

    updateReleaseEntry: async (id: string, type: string, updatedData: any) => {
        try {
            let success = false;
            if (type === 'malkhana') {
                // Use the update function from the maalkhanaStore
                const { updateMalkhanaEntry } = useMaalkhanaStore.getState();
                success = await updateMalkhanaEntry(id, updatedData);
            } else if (type === 'siezed vehical') {
                // Use the update function from the seizedVehicleStore
                const { updateVehicalEntry } = useSeizedVehicleStore.getState();
                success = await updateVehicalEntry(id, updatedData);
            }
            return success;
        } catch (err) {
            console.error("Error in updateReleaseEntry:", err);
            return false;
        }
    },

    // A simple reset function can be defined here if you want to clear state
    resetForm: () => {
        // This part is optional and depends on what state you want to keep in this store.
        // For now, it does nothing as the form state is handled in the component.
    }
}));
