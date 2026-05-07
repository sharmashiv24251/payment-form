"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PaymentSection from "./PaymentSection";
import TransactionHistory from "./TransactionHistory";

type View = "payment" | "history";

const TABS: { key: View; label: string }[] = [
  { key: "payment", label: "PAYMENT" },
  { key: "history", label: "TX HISTORY" },
];

export default function PaymentApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView: View = searchParams.get("view") === "history" ? "history" : "payment";

  function switchTab(view: View) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center px-4 py-8">
      <div className="flex gap-1 bg-[#111] rounded-lg p-1 mb-8">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-6 py-2 rounded-md text-xs font-medium tracking-widest transition-all cursor-pointer border-none ${
              activeView === key ? "bg-[#2a2a3e] text-white" : "bg-transparent text-[#666]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-lg md:max-w-4xl">
        {activeView === "payment" ? <PaymentSection /> : <TransactionHistory />}
      </div>
    </div>
  );
}
