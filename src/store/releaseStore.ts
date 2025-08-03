import axios from 'axios';
import { create } from 'zustand';

type ReleaseEntry = {
    srNo: string;
    name: string;
    moveDate: string;
    firNo: string;
    underSection: string;
    takenOutBy: string;
    moveTrackingNo: string;
    movePurpose: string;
    caseProperty: string;
    recevierName: string;
    fathersName: string;
    address: string;
    mobile: string;
    releaseItemName: string;

};

type ReleaseStore = {
    entry: ReleaseEntry;
    entries: ReleaseEntry[];
    setField: (field: keyof ReleaseEntry, value: string) => void;
    resetForm: () => void;
    getNewEntry: () => Promise<void>;
    fetchReleaseEntries: () => Promise<void>;
    addReleaseEntry: (data: ReleaseEntry) => Promise<void>;
};

const initialState: ReleaseEntry = {
    srNo: '',
    name: '',
    moveDate: '',
    firNo: '',
    underSection: '',
    takenOutBy: '',
    moveTrackingNo: '',
    movePurpose: '',
    caseProperty: '',
    recevierName: '',
    fathersName: '',
    address: '',
    mobile: '',
    releaseItemName: '',
};

export const useReleaseStore = create<ReleaseStore>((set, get) => ({
    entry: { ...initialState },
    entries: [],

    setField: (field: any, value: any) =>
        set(state => ({
            entry: { ...state.entry, [field]: value }
        })),

    resetForm: () => set({ entry: { ...initialState } }),

    getNewEntry: async () => {
        try {
            const { entry } = get();
            const response = await axios.post('/api/release', entry);
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

    fetchReleaseEntries: async () => {
        try {
            const response = await axios.get('/api/release');
            if (response.data.success) {
                set({ entries: response.data.data });
            } else {
                console.error("Fetch failed:", response.data.error);
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    },

    addReleaseEntry: async (data: ReleaseEntry) => {
        try {
            const response = await axios.post("/api/release", data, {
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
