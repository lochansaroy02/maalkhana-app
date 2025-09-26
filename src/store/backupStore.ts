
import axios from 'axios';
import { create } from 'zustand';


type firStore = {
    backupData: any;
    createBackup: (userId: string | undefined) => Promise<any>;
};



export const useBackupStore = create<firStore>((set, get) => ({
    backupData: null,
    createBackup: async (userId: string | undefined) => {
        try {
            const response = await axios.get(`/api/all?userId=${userId}`)
            const data = response.data
            console.log(data)
            return data;
        } catch (error) {
            console.error("Error fetching FIR:", error);
            return null;
        }
    }
}));


