"use client";

import { useEffect, useState } from "react";
import { useTransactionStore } from "@/store/transactionStore";
import type { Transaction } from "@/types";

const CURRENCY_SYMBOL: Record<string, string> = { INR: "₹", USD: "$" };

const STATUS_STYLES: Record<Transaction["status"], { dot: string; text: string; label: string }> = {
  success: { dot: "bg-green-500", text: "text-green-400", label: "SUCCESS" },
  failed:  { dot: "bg-red-500",   text: "text-red-400",   label: "FAILED"  },
  timeout: { dot: "bg-yellow-500",text: "text-yellow-400",label: "TIMEOUT" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TransactionHistory() {
  const transactions = useTransactionStore((s) => s.transactions);
  const clearTransactions = useTransactionStore((s) => s.clearTransactions);

  // avoid SSR/client hydration mismatch — store reads localStorage only on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-widest text-[#555]">TRANSACTION HISTORY</p>
        {transactions.length > 0 && (
          <button
            onClick={clearTransactions}
            className="text-[10px] tracking-widest text-[#444] hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent"
          >
            CLEAR ALL
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="bg-[#111] rounded-2xl p-5 text-[#555] text-sm text-center min-h-40 flex items-center justify-center border border-[#1a1a1a]">
          No transactions yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {transactions.map((tx) => {
            const style = STATUS_STYLES[tx.status];
            const symbol = CURRENCY_SYMBOL[tx.currency] ?? tx.currency;
            return (
              <li
                key={tx.id}
                className="bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 w-2 h-2 rounded-full ${style.dot}`} />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {symbol}{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[#555] text-[10px] font-mono truncate mt-0.5">
                      {tx.id.slice(0, 8).toUpperCase()}…
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-[10px] tracking-widest font-medium ${style.text}`}>
                    {style.label}
                  </p>
                  <p className="text-[#555] text-[10px] mt-0.5">{formatDate(tx.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
