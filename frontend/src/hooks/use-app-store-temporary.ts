import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type StoreProps = {
  isPurchaseDialogOpen: boolean;
  setIsPurchaseDialogOpen: (value: StoreProps["isPurchaseDialogOpen"]) => void;
};

// used to create the store
export const useAppStoreTemporary = create<StoreProps>((set, get) => ({
  isPurchaseDialogOpen: false,
  setIsPurchaseDialogOpen: (value) =>
    set({
      isPurchaseDialogOpen: value,
    }),
}));
