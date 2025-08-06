
import { create } from 'zustand';


type firStore = {
    firData: any;
    fetchDataByFIR: (type: string, firNo: string) => Promise<any>;
};



export const useFirStore = create<firStore>((set, get) => ({
    firData: null,
    fetchDataByFIR: async (type: string, firNo: string) => {
        try {
            const res = await fetch(`/api/fir?type=${type}&firNo=${firNo}`);
            const result = await res.json();

            if (result.success && result.data.length > 0) {
                const data = result.data[0];

                set({ firData: data });
                return data; // ✅ return data instead of just `true`
            } else {
                set({ firData: null });
                return null;
            }
        } catch (error) {
            console.error("Error fetching FIR:", error);
            return null;
        }
    }


}));


