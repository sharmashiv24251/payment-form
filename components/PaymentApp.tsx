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
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 32px" }}>
      {/* Top tab bar */}
      <div style={{ display: "flex", gap: 4, background: "#111", borderRadius: 10, padding: 4, marginBottom: 48 }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            style={{
              padding: "10px 28px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 1,
              background: activeView === key ? "#2a2a3e" : "transparent",
              color: activeView === key ? "white" : "#666",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* View */}
      {activeView === "payment" ? <PaymentSection /> : <TransactionHistory />}
    </div>
  );
}
