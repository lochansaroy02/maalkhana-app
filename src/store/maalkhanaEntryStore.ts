// store/maalkhanaStore.ts
import axios from 'axios';
import { create } from 'zustand';

type MaalkhanaEntry = {
    srNo: string;
    gdNo: string;
    gdDate: string;
    underSection: string;
    Year: string;
    IOName: string;
    vadiName: string;
    HM: string;
    accused: string;
    firNo: string;
    status: string;
    entryType: string;
    place: string;
    boxNo: string;
    courtNo: string;
    courtName: string;
};

type MaalkhanaStore = {
    entry: MaalkhanaEntry;
    entries: MaalkhanaEntry[];
    setField: (field: keyof MaalkhanaEntry, value: string) => void;
    resetForm: () => void;
    getNewEntry: () => Promise<void>;
    fetchMaalkhanaEntry: () => Promise<void>;
    addMaalkhanaEntry: (data: MaalkhanaEntry) => Promise<void>;
};

const initialState: MaalkhanaEntry = {
    srNo: '',
    gdNo: '',
    gdDate: '',
    underSection: '',
    Year: '',
    IOName: '',
    vadiName: '',
    HM: '',
    accused: '',
    firNo: '',
    status: '',
    entryType: '',
    place: '',
    boxNo: '',
    courtNo: '',
    courtName: ''
};

export const useMaalkhanaStore = create<MaalkhanaStore>((set, get) => ({
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
            const response = await axios.post('/api/maalEntry', entry);
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

    fetchMaalkhanaEntry: async () => {
        try {
            const response = await axios.get('/api/maalEntry');
            if (response.data.success) {
                set({ entries: response.data.data });
            } else {
                console.error("Fetch failed:", response.data.error);
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    },
    addMaalkhanaEntry: async (data: MaalkhanaEntry) => {
        try {
            const response = await axios.post("/api/maalEntry", data, {
                headers: { "Content-Type": "application/json" },
            });


            if (response.data.success) {
                const newEntry = response.data.data;
                set(state => ({
                    entries: [...state.entries, newEntry],
                }));
                console.log(response.data.data)
            } else {
                console.error("POST /api/siezed error: Failed to create entry", response.data.error);
            }
        } catch (error: any) {
            console.error("POST /api/siezed error:", error.message || error);
        }
    }

}));
