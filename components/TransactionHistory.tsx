"use client";

export default function TransactionHistory() {
  return (
    <div style={{ width: "100%", maxWidth: 720 }}>
      <p style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 24 }}>TRANSACTION HISTORY</p>
      <div style={{ background: "#111", borderRadius: 16, padding: 24, color: "#666", fontSize: 13, textAlign: "center", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        No transactions yet.
      </div>
    </div>
  );
}
