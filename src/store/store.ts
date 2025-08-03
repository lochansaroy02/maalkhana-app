// store/useOpenStore.ts
import { create } from 'zustand';

interface IsOpenProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    toggleOpen: () => void;
}

export const useOpenStore = create<IsOpenProps>((set) => ({
    isOpen: false,
    setIsOpen: (value: boolean) => set({ isOpen: value }),
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
