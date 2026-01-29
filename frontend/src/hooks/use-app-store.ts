import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type StoreProps = {
  previousLink: string;
  setPreviousLink: (newLink: StoreProps['previousLink']) => void;
};

// used to create the store
export const useAppStore = create(
  persist<StoreProps>(
    (set, get) => ({
      previousLink: '/',
      setPreviousLink: (newLink) =>
        set({
          previousLink: newLink ?? '/',
        }),
    }),
    {
      name: 'app', // name of the localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
