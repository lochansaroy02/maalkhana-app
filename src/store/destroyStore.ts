import axios from 'axios';
import { create } from 'zustand';




type DestroyStore = {
    fetchByFIR: (userId: string | undefined, type: string, firNo?: string, srNo?: string) => Promise<any | null>;
    updateDestroyEntry: (id: string, updatedData: any) => Promise<boolean>;
};


export const useDestroyStore = create<DestroyStore>(() => ({

    fetchByFIR: async (userId: string | undefined, type: string, firNo?: string, srNo?: string) => {
        try {
            const response = await axios.get(`/api/destroy/fir?userId=${userId}&type=${type}&firNo=${firNo}&srNo=${srNo}`);
            const data = response.data
            if (data.success) {
                // Return data as is, expecting an array if multiple results or a single entry
                return {
                    data: data.data,
                    success: data.success
                }
            }
            return null;

        } catch (error: any) {
            console.error("Error in fetchByFIR (Destroy):", error.response?.data?.message || error.message);
            return null;
        }
    },


    updateDestroyEntry: async (id: string, updatedData: any) => {
        try {
            const response = await axios.put(`/api/destroy?id=${id}`, updatedData);

            if (response.data.success) {
                return true;
            }
            return false;
        } catch (err) {
            console.error("Error in updateDestroyEntry:", err);
            return false;
        }
    },
}));