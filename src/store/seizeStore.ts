
// store/siezedVehicleStore.ts
import axios from "axios";
import { create } from "zustand";


interface SeizedVehicle {
    id?: string;
    srNo: string;
    gdNo: string;
    rtoName: string
    userId: string | undefined,
    gdDate: string;
    underSection: string;
    vehicleType: string;
    colour: string;
    registrationNo: string;
    engineNo: string;
    description: string;
    status: string;
    policeStation: string;
    ownerName: string;
    seizedBy: string;
    caseProperty: string;
    createdAt?: string;
    updatedAt?: string;
}
interface SeizedVehicleStore {
    vehicles: SeizedVehicle[];
    loading: boolean;
    error: string | null;
    fetchVehicles: (userId: string | undefined) => Promise<void>;
    addVehicle: (vehicle: SeizedVehicle) => Promise<boolean>;
}
export const useSeizedVehicleStore = create<SeizedVehicleStore>((set, get) => ({
    vehicles: [],
    loading: false,
    error: null,

    fetchVehicles: async (userId: string | undefined) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`/api/siezed/?userId=${userId}`);
            if (response.data.success) {
                set({ vehicles: response.data.data, loading: false });
            } else {
                set({ error: "Failed to fetch seized vehicles", loading: false });
            }
        } catch (error: any) {
            console.error("GET /api/siezed error:", error);
            set({ error: error.message || "Server error", loading: false });
        }
    },

    addVehicle: async (vehicle: any | any[]) => {
        try {
            const response = await axios.post(`/api/siezed`, vehicle, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                if (Array.isArray(vehicle)) {
                    set((state) => ({
                        vehicles: [...state.vehicles, ...vehicle],
                    }));
                } else {
                    set((state) => ({
                        vehicles: [...state.vehicles, response.data.data],
                    }));
                }

                return true
            } else {
                console.error("❌ POST /api/siezed error: Failed to create vehicle");
                return false;
            }
        } catch (error: any) {
            console.error("❌ POST /api/siezed error:", error);
            set({ error: error.message || "Failed to create seized vehicle" });
            return false;
        }

    },

}));
