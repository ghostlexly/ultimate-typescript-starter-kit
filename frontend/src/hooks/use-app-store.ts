import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type StoreProps = {
  targetModel: string;
  setTargetModel: (model: StoreProps["targetModel"]) => void;

  newConversationStartMessage: string | null;
  setNewConversationStartMessage: (
    message: StoreProps["newConversationStartMessage"]
  ) => void;
};

// used to create the store
export const useAppStore = create(
  persist<StoreProps>(
    (set, get) => ({
      targetModel: "Claude-3-5-Sonnet",
      setTargetModel: (model) =>
        set({
          targetModel: model,
        }),

      newConversationStartMessage: null,
      setNewConversationStartMessage: (message) =>
        set({
          newConversationStartMessage: message,
        }),
    }),
    {
      name: "app-v2", // name of the localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
