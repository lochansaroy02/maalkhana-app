// store/maalkhanaStore.ts
import axios from 'axios';
import { create } from 'zustand';

type MaalkhanaEntry = {
    srNo: string;
    gdNo: string;
    wine: number;
    wineType: string,
    gdDate: string;
    underSection: string;
    Year: string;
    IOName: string;
    policeStation: string
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
    districtId: string | undefined
};

type MaalkhanaStore = {
    entry: MaalkhanaEntry;
    entries: MaalkhanaEntry[];
    setField: (field: keyof MaalkhanaEntry, value: string) => void;
    resetForm: () => void;
    getNewEntry: () => Promise<void>;
    fetchMaalkhanaEntry: (districtId: string | undefined) => Promise<void>;
    addMaalkhanaEntry: (data: MaalkhanaEntry, districtId: string | undefined) => Promise<void>;
};

const initialState: MaalkhanaEntry = {
    srNo: '',
    gdNo: '',
    gdDate: '',
    wine: 0,
    wineType: '',
    underSection: '',
    Year: '',
    policeStation: '',
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
    courtName: '',
    districtId: ""
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

    fetchMaalkhanaEntry: async (districtId: string | undefined) => {
        try {
            const response = await axios.get(`/api/entry/${districtId}`);
            if (response.data.success) {
                set({ entries: response.data.data });
            } else {
                console.error("Fetch failed:", response.data.error);
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    },


    addMaalkhanaEntry: async (data: any | any[], districtId: string | undefined) => {
        try {
            const response = await axios.post(`/api/entry/${districtId}`, data, {
                headers: { "Content-Type": "application/json" },
            });




            if (response.data.success) {
                if (Array.isArray(data)) {
                    console.log(`🚀 Bulk insert successful: ${response.data.count} .`);
                } else {
                    console.log("🚀 Single insert successful:", response.data.data);
                }
            } else {
                console.error("❌ POST /api/siezed error: Failed to create vehicle");
            }
        } catch (error: any) {
            console.error(" error:", error.message || error);
        }
    }

}));
