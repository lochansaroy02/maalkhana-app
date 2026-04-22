// store/useOpenStore.ts
import { create } from 'zustand';

interface isSidebarProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    toggleOpen: () => void;
}

export const useSidebarStore = create<isSidebarProps>((set) => ({
    isOpen: false,
    setIsOpen: (value: boolean) => set({ isOpen: value }),
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
