// store/maalkhanaStore.ts
import axios from 'axios';
import toast from 'react-hot-toast';
import { create } from 'zustand';

type MaalkhanaEntry = {
    isReturned: boolean;
    isRelease: boolean;
    srNo: string;
    isNilami: boolean,
    isDestroy: boolean,
    gdNo: string;
    photoUrl: string,
    cash: number,
    wine: number;
    description: string,
    isMovement?: boolean,
    isRecevied?: boolean,
    wineType: string,
    caseProperty: string,
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
    userId: string | undefined
};

type MaalkhanaStore = {
    entry: MaalkhanaEntry;
    entries: MaalkhanaEntry[];
    currentEntry: null,
    setCurrentEntry: (data: any) => void,
    setField: (field: keyof MaalkhanaEntry, value: string) => void;
    resetForm: () => void;
    getNewEntry: () => Promise<void>;
    fetchMaalkhanaEntry: (userId: string | undefined, role: string) => Promise<void>;
    addMaalkhanaEntry: (data: any) => Promise<boolean>;
    updateMalkhanaEntry: (id: string, data: any) => Promise<boolean>;
    getByFIR: (firNo: string, userId: string | undefined) => Promise<any>
    fetchMovementData: (userId: string | undefined) => Promise<any>
};

const initialState: MaalkhanaEntry = {
    isRelease: false,
    isReturned: false,
    srNo: '',
    gdNo: '',
    isNilami: false,
    isDestroy: false,
    description: '',
    gdDate: '',
    photoUrl: '',
    isMovement: false,
    isRecevied: false,
    wine: 0,
    cash: 0,
    wineType: '',
    caseProperty: '',
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
    userId: ""
};

export const useMaalkhanaStore = create<MaalkhanaStore>((set, get) => ({
    entry: { ...initialState },
    entries: [],

    currentEntry: null,
    setCurrentEntry: (data: any) => {
        set({
            currentEntry: data
        })
    },

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

    fetchMaalkhanaEntry: async (userId: string | undefined, role: string) => {
        let apiUrl = role === 'asp' || role === 'district' ? `/api/asp/get-data` : `/api/entry?id=${userId}`
        try {
            const response = await axios.get(apiUrl);
            if (response.data.success) {
                set({ entries: response.data.data });
            } else {
                console.error("Fetch failed:", response.data.error);
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    },


    addMaalkhanaEntry: async (data: any | any[]) => {
        try {
            const response = await axios.post(`/api/entry`, data, {
                headers: { "Content-Type": "application/json" },
            });
            if (response.data.success) {
                if (Array.isArray(data)) {
                    toast.success(`🚀 Bulk insert successful: ${response.data.count} .`);
                } else {
                    toast.success("🚀 Single insert successful:", response.data.data);
                }
                return true
            } else {
                console.error("❌ POST /api/siezed error: Failed to create vehicle");
                return false
            }
        } catch (error: any) {
            console.error(" error:", error.message || error);
            return false
        }
    },
    updateMalkhanaEntry: async (id: string, newData: any) => {
        try {
            const response = await axios.put(`/api/entry?id=${encodeURIComponent(id)}`, newData);

            const data = response.data;
            console.log(data)
            if (data.success) {
                return true;
            }
            return false
        } catch (error) {
            console.error("Error updating vehicle entry:", error);
            return false;
        }

    },

    getByFIR: async (firNo: string, userId: string | undefined) => {
        try {
            const response = await axios.get(`/api/entry/fir?firNo=${firNo}&userId=${userId}`)
            const data = response.data;
            return data;
        } catch (error) {
            console.error({
                message: "failed to fetch Details "
            })
            return error;
        }
    },
    fetchMovementData: async (userId: string | undefined) => {
        try {
            const response = await axios.get(`/api/entry/movement?userId=${userId}`)
            const data = response.data;
            return data;
        } catch (error) {
            console.error({
                message: "failed to fetch Details "
            })
            return error;

        }
    }
}));
