import axios from 'axios';
import { create } from 'zustand';

type MovementEntry = {
    srNo: string;
    name: string;
    moveDate: string;
    firNo: string;
    underSection: string;
    takenOutBy: string;
    moveTrackingNo: string;
    movePurpose: string;
    caseProperty: string;
};

type MovementStore = {
    entry: MovementEntry;
    entries: MovementEntry[];
    setField: (field: keyof MovementEntry, value: string) => void;
    resetForm: () => void;
    getNewEntry: () => Promise<void>;
    fetchMovementEntries: () => Promise<void>;
    addMovementEntry: (data: MovementEntry) => Promise<void>;
};

const initialState: MovementEntry = {
    srNo: '',
    name: '',
    moveDate: '',
    firNo: '',
    underSection: '',
    takenOutBy: '',
    moveTrackingNo: '',
    movePurpose: '',
    caseProperty: '',
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

    fetchMovementEntries: async () => {
        try {
            const response = await axios.get('/api/movement');
            if (response.data.success) {
                set({ entries: response.data.data });
            } else {
                console.error("Fetch failed:", response.data.error);
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    },

    addMovementEntry: async (data: MovementEntry) => {
        try {
            const response = await axios.post("/api/movement", data, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                set(state => ({
                    entries: [...state.entries, response.data.data]
                }));
                console.log("Added Entry:", response.data.data);
            } else {
                console.error("POST /api/movement error: Failed to create entry", response.data.error);
            }
        } catch (error: any) {
            console.error("POST /api/movement error:", error.message || error);
        }
    },
}));
