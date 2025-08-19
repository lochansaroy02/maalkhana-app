import axios from 'axios';
import { create } from 'zustand';
import { useMaalkhanaStore } from './malkhana/maalkhanaEntryStore';
import { useSeizedVehicleStore } from './siezed-vehical/seizeStore';

// This store will now correctly orchestrate fetching and updating.

type ReleaseStore = {
    fetchByFIR: (userId: string | undefined, type: string, firNo?: string, srNo?: string) => Promise<any | null>;

    updateReleaseEntry: (id: string, type: string, updatedData: any) => Promise<boolean>;

};


export const useReleaseStore = create<ReleaseStore>((set, get) => ({

    fetchByFIR: async (userId: string | undefined, type: string, firNo?: string, srNo?: string) => {
        try {

            const response = await axios.get(`/api/release/fir?userId=${userId}&type=${type}&firNo=${firNo}&srNo=${srNo}`);

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
