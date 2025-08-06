import axios from "axios";
import { create } from "zustand";

interface DeleteStore {
    selected: string[];
    setSelected: (selected: string[]) => void;
    handleDelete: (url: string, fetchData?: () => void) => Promise<void>;
}

export const useDeleteStore = create<DeleteStore>((set, get) => ({
    selected: [],

    setSelected: (selected) => set({ selected }),

    handleDelete: async (url: string, fetchData?: () => void) => {
        const { selected, setSelected } = get();

        if (selected.length === 0) {
            alert("No entries selected");
            return;
        }

        try {
            await axios.post(url, { ids: selected });
            alert("Deleted successfully");
            setSelected([]);
            fetchData && fetchData(); // Refresh data if callback is passed
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting entries");
        }
    },
}));
