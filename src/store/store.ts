// store/useOpenStore.ts
import { create } from 'zustand';

interface IsOpenProps {
    isOpen: boolean;
    reportType: string,
    setReportType: (value: string) => void
    setIsOpen: (value: boolean) => void;
    toggleOpen: () => void;
}

export const useOpenStore = create<IsOpenProps>((set) => ({
    isOpen: false,
    reportType: '',
    setReportType: (value: string) => set({
        reportType: value
    }),
    setIsOpen: (value: boolean) => set({ isOpen: value }),
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
