// store/movementStore.ts
import axios from "axios";
import { create } from "zustand";

export type MovementEntry = {
    id?: string;
    srNo: string
    name: string;
    moveDate: string;
    userId?: string | undefined;
    returnDate: string;
    returnBackFrom?: string;
    firNo: string;
    underSection: string;
    receivedBy?: string;
    takenOutBy?: string;
    moveTrackingNo?: string;
    movePurpose?: string;
    documentUrl?: string;
    photoUrl?: string;
    isReturned: boolean;
    caseProperty?: string;
    createdAt?: string;
    updatedAt?: string;
};

type MovementStore = {
    entry: MovementEntry | null;
    entries: MovementEntry[];
    setField: (field: keyof MovementEntry, value: any) => void;
    resetForm: () => void;
    getNewEntry: () => Promise<void>;
    fetchMovementEntries: (userId?: string) => Promise<void>;
    addMovementEntry: (data: MovementEntry | MovementEntry[]) => Promise<boolean>;
    updateMovementEntry: (id: string, updatedData: MovementEntry) => Promise<boolean>;
    fetchByFIR: (type: string, caseProperty?: string, firNo?: string, srNo?: string) => Promise<any>;
};

const initialState: MovementEntry = {
    srNo: "",
    name: "",
    moveDate: "",
    returnDate: "",
    documentUrl: "",
    photoUrl: "",
    userId: undefined,
    returnBackFrom: "",
    firNo: "",
    receivedBy: "",
    isReturned: false,
    underSection: "",
    takenOutBy: "",
    moveTrackingNo: "",
    movePurpose: "",
    caseProperty: "",
};

export const useMovementStore = create<MovementStore>((set, get) => ({
    entry: null,
    entries: [],

    setField: (field, value) =>
        set((state) => ({
            entry: {
                ...(state.entry ?? initialState),
                [field]: value,
            },
        })),

    resetForm: () => set({ entry: null }),

    getNewEntry: async () => {
        try {
            const { entry } = get();
            if (!entry) return;
            const response = await axios.post("/api/movement", entry);
            if (response.data?.success) {
                set((state) => ({ entries: [...state.entries, response.data.data] }));
                get().resetForm();
            } else {
                console.error("Failed to submit entry", response.data?.error);
            }
        } catch (err) {
            console.error("Error while creating new entry:", err);
        }
    },

    fetchMovementEntries: async (userId?: string) => {
        try {
            const response = await axios.get(`/api/movement${userId ? `?userId=${userId}` : ""}`);
            if (response.data?.success) {
                set({ entries: response.data.data });
            } else {
                console.error("Fetch failed:", response.data?.error);
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    },

    addMovementEntry: async (data: MovementEntry | MovementEntry[]) => {
        try {
            const response = await axios.post(`/api/movement`, data, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data?.success) {
                if (Array.isArray(data)) {
                    set((state) => ({ entries: [...state.entries, ...response.data.data] }));
                } else {
                    set((state) => ({ entries: [...state.entries, response.data.data] }));
                }
                return true;
            }
            return false;
        } catch (error: any) {
            console.error("POST /api/movement error:", error.message || error);
            return false;
        }
    },

    updateMovementEntry: async (id: string, updatedData: MovementEntry) => {
        try {
            const res = await axios.put(`/api/movement?id=${id}`, updatedData);
            if (res.data?.success) {
                // set((state) => ({
                //     entries: state.entries.map((e) => (e.firNo === firNo || (e as any).firNo === firNo ? { ...e, ...updatedData } : e)),
                // }));
                // // If the currently loaded entry is the same, update it
                // const current = get().entry;
                // if (current && ((current.firNo === firNo) || (current as any).firNo === firNo)) {
                //     set({ entry: { ...current, ...updatedData } });
                // }
                console.log(res.data.data)
            }
            return res.data?.success ?? false;
        } catch (err) {
            console.error("PUT /api/movement error:", err);
            return false;
        }
    },

    fetchByFIR: async (type: string, firNo?: string, srNo?: string) => {
        try {
            const response = await axios.get(`/api/movement/fir?type=${type}&firNo=${firNo}&srNo=${srNo}`);
            const data = response.data;
            if (data?.success) {
                set({
                    entry: data.data
                })
                return true;
            } else {

                return false;
            }
        } catch (error) {
            console.error("error in fetching data by FIR", error);
            set({ entry: null });
            return false;
        }
    },
}));
