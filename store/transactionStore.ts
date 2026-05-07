import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Transaction } from "@/types";

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) =>
        set((state) => ({ transactions: [tx, ...state.transactions] })),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: "payment-transactions",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
