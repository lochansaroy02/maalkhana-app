import axios from 'axios';
import { create } from 'zustand';

type MovementEntry = {
    srNo: string;
    name: string;
    moveDate: string;
    userId: string | undefined,
    returnDate: string,
    returnBackFrom: string
    firNo: string;
    underSection: string;
    takenOutBy: string;
    moveTrackingNo: string;
    movePurpose: string;
    caseProperty: string;
    createdAt?: string;
    updatedAt?: string;

};

type MovementStore = {
    entry: MovementEntry;
    entries: MovementEntry[];
    setField: (field: keyof MovementEntry, value: string) => void;
    resetForm: () => void;
    getNewEntry: () => Promise<void>;
    fetchMovementEntries: (userId: string | undefined) => Promise<void>;
    addMovementEntry: (data: MovementEntry) => Promise<boolean>;
};

const initialState: MovementEntry = {
    srNo: '',
    name: '',
    moveDate: '',
    returnDate: '',
    userId: '',
    returnBackFrom: '',
    firNo: '',
    underSection: '',
    takenOutBy: '',
    moveTrackingNo: '',
    movePurpose: '',
    caseProperty: '',
    createdAt: '',
    updatedAt: ''
};

export const useMovementStore = create<MovementStore>((set, get) => ({
    entry: { ...initialState },
    entries: [],

    setField: (field, value) =>
        set(state => ({
            entry: { ...state.entry, [field]: value }
        })),

    resetForm: () => set({ entry: { ...initialState } }),

    getNewEntry: async () => {
        try {
            const { entry } = get();
            const response = await axios.post('/api/movement', entry);
            if (response.data.success) {
                set(state => ({
                    entries: [...state.entries, response.data.data]
                }));
                get().resetForm();
            } else {
                console.error("Failed to submit entry", response.data.error);
            }
        } catch (err) {
            console.error("Error while creating new entry:", err);
        }
    },

    fetchMovementEntries: async (userId: string | undefined) => {
        try {
            const response = await axios.get(`/api/movement?userId=${userId}`);
            if (response.data.success) {
                console.log(response.data.data)
                set({ entries: response.data.data });
            } else {
                console.error("Fetch failed:", response.data.error);
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    },
    addMovementEntry: async (data: any | any[]) => {
        try {
            const response = await axios.post(`/api/movement`, data, {
                headers: { "Content-Type": "application/json" },
            });


            if (response.data.success) {
                if (Array.isArray(data)) {
                    set((state) => ({
                        entries: [...state.entries, ...data]
                    }))
                } else {
                    console.log(response.data.data)
                    set((state) => ({
                        entries: [...state.entries, response.data.data]
                    }))
                }
                return true
            } else {
                return false
            }
        } catch (error: any) {
            console.error("POST /api/movement error:", error.message || error);
            return false;
        }
    },
}));
