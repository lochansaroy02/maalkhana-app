
// store/siezedVehicleStore.ts
import axios from "axios";
import { create } from "zustand";


interface DistrictProps {
    name: string,
    email: string,
    password: string
}
interface DistrictStore {
    data: DistrictProps[];
    loading: boolean;
    error: string | null;
    fetchDistricts: () => Promise<void>;
    addDistrict: (data: DistrictProps) => Promise<void>;
}
export const useDistrictStore = create<DistrictStore>((set, get) => ({
    data: [],
    loading: false,
    error: null,

    fetchDistricts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get("/api/district");
            if (response.data.success) {
                set({ data: response.data.data, loading: false });
            } else {
                set({ error: "Failed to fetch seized vehicles", loading: false });
            }
        } catch (error: any) {
            console.error("GET /api/siezed error:", error);
            set({ error: error.message || "Server error", loading: false });
        }
    },

    addDistrict: async (vehicle: any | any[]) => {
        try {
            const response = await axios.post("/api/district", vehicle, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                set((state) => ({
                    data: [...state.data, response.data.data],
                }));
            } else {
                console.error("❌ : Failed to create Distict vehicle");
            }
        } catch (error: any) {
            console.error("❌ POST /api/siezed error:", error);
            set({ error: error.message || "Failed to create seized vehicle" });
        }
    },
}));
