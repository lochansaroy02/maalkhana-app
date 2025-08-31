
// store/siezedVehicleStore.ts
import axios from "axios";
import { create } from "zustand";


interface SeizedVehicle {
    id?: string;
    srNo: string | undefined;
    firNo?: string | undefined,
    gdNo: string;
    rtoName: string
    isMovement: boolean,
    isRecevied: boolean,
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
    vehical: any,
    vehicles: any[];
    loading: boolean;
    error: string | null;
    fetchVehicles: (userId: string | undefined) => Promise<void>;
    addVehicle: (vehicle: any) => Promise<boolean>;
    getByFIR: (userId: string | undefined, firNo: string) => Promise<any>
    updateVehicalEntry: (id: string, data: any) => Promise<boolean>
    getData: (userId: string | undefined, firNo: string, srNo: string) => Promise<any>
    getBySR: (userId: string | undefined, srNo: string) => Promise<any>
}

const initialState = {
    id: "",
    srNo: "",
    firNo: "",
    gdNo: "",
    rtoName: "",
    userId: "",
    isMovement: false,
    isRecevied: false,
    gdDate: "",
    underSection: "",
    vehicleType: "",
    colour: "",
    registrationNo: "",
    engineNo: "",
    description: "",
    status: "",
    policeStation: "",
    ownerName: "",
    seizedBy: "",
    caseProperty: "",
    createdAt: "",
    updatedAt: "",
}

export const useSeizedVehicleStore = create<SeizedVehicleStore>((set, get) => ({
    vehical: { ...initialState },
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


    updateVehicalEntry: async (id: string, newData: any) => {
        try {
            const response = await axios.put(`/api/siezed?id=${id}`, newData)
            const data = response.data

            if (data.success) {
                return true;
            }
            return false
        } catch (error) {
            console.error("Error updating vehicle entry:", error);
            return false;
        }
    },


    getData: async (userId: string | undefined, firNo?: string, srNo?: string) => {
        try {
            const response = await axios(`api/siezed/get-data?userId=${userId}&firNo=${firNo}&srNo=${srNo}`)
            const data = await response.data
            if (data.success) {
                console.log(data)
                return {
                    success: data.success,
                    data: data.data
                }
            }

        } catch (error) {
            console.error("Error fatching data:", error);
            // This needs to return a consistent object
            return {
                success: false,
                data: null
            };
        }
    },
    getBySR: async (userId: string | undefined, srNo: string) => {
        try {
            const response = await axios(`api/siezed/sr?userId=${userId}&srNo=${srNo}`)
            const data = response.data
            if (data.success) {
                console.log(data.data)
                return {
                    success: data.success,
                    data: data.data
                }
            }

        } catch (error) {
            console.error("Error fatching data:", error);

        }
    },
    getByFIR: async (userId: string | undefined, firNo: string) => {
        try {
            const response = await axios.get(`/api/siezed/fir?userId=${userId}&firNo=${firNo}`)
            const data = response.data;
            if (data.success) {
                return data
            }
            return null;


        } catch (error: any) {
            console.error(" error:", error.message || error);
        }

    },

}));
