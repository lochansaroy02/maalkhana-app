import axios from 'axios';
import { create } from 'zustand';

type ReleaseEntry = {
    srNo: string;

    moveDate: string;
    districtId: string | undefined,
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
    fetchReleaseEntries: (userId: string | undefined) => Promise<void>;
    addReleaseEntry: (type: string, data: ReleaseEntry) => Promise<boolean>;
    FetchByFIR: (type: string, firNo?: string, srNo?: string) => Promise<any>
    updateReleaseEntry: (id: string, updatedData: any) => Promise<any>
};

const initialState: ReleaseEntry = {
    srNo: '',

    moveDate: '',
    districtId: '',
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

    fetchReleaseEntries: async (userId: string | undefined) => {
        try {
            const response = await axios.get(`/api/release?id=${userId}`);
            if (response.data.success) {
                set({ entries: response.data.data });
            } else {
                console.error("Fetch failed:", response.data.error);
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    },

    addReleaseEntry: async (type: string, data: any | any[]) => {
        try {
            const response = await axios.post(`/api/release?type=${type}`, data, {
                headers: { "Content-Type": "application/json" },
            });
            if (response.data.success) {
                if (Array.isArray(data)) {
                    console.log(`🚀 Bulk insert successful: ${response.data.count} vehicles added.`);
                } else {
                    console.log("🚀 Single insert successful:", response.data.data);
                }
                return true;
            } else {
                console.error("❌ POST /api/siezed error: Failed to create vehicle");
                return false;
            }

        } catch (error: any) {
            console.error("POST /api/movement error:", error.message || error);
            return false;
        }
    },
    FetchByFIR: async (type: string, firNo?: string, srNo?: string) => {
        try {

            const response = await axios.get(`/api/release/fir?type=${type}&firNo=${firNo}&srNo=${srNo}`);
            const data = response.data;
            console.log(data)
        } catch (error) {

        }
    },

    updateReleaseEntry: async (id: string, updatedData: ReleaseEntry) => {
        try {
            const res = await axios.put(`/api/release?id=${id}`, updatedData);
            if (res.data?.success) {
                console.log(res.data.data)
            }
            return res.data?.success ?? false;
        } catch (err) {
            console.error("PUT /api/movement error:", err);
            return false;
        }
    },
}));
