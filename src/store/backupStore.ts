import axios from 'axios';
import { create } from 'zustand';

export interface BackupSummary {
    email: string;
    label: string;
    role: string;
    entries: number;
    vehicles: number;
}

export interface BackupResult {
    success: boolean;
    message?: string;
    data?: { email: string; counts: { entries: number; vehicles: number }; files: { name: string; size: number }[] };
}

type BackupStore = {
    getSummary: (userId: string, role: string) => Promise<BackupSummary | null>;
    sendBackup: (userId: string, role: string, formats: ("bak" | "csv")[]) => Promise<BackupResult>;
};

const errorMessage = (err: any) => err?.response?.data?.message || err?.message || "";

export const useBackupStore = create<BackupStore>(() => ({
    getSummary: async (userId, role) => {
        try {
            const res = await axios.get(`/api/backup?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`);
            return res.data?.data ?? null;
        } catch (err) {
            console.error("Backup summary failed:", err);
            return null;
        }
    },
    sendBackup: async (userId, role, formats) => {
        try {
            const res = await axios.post(`/api/backup`, { userId, role, formats });
            return res.data;
        } catch (err) {
            console.error("Backup failed:", err);
            return { success: false, message: errorMessage(err) };
        }
    },
}));
