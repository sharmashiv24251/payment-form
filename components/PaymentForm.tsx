"use client";

import type { PaymentFormValues } from "@/types";

interface PaymentFormProps {
  values: PaymentFormValues;
  onChange: (field: keyof PaymentFormValues, value: string) => void;
}

export default function PaymentForm({ values, onChange }: PaymentFormProps) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 16, padding: 32, width: 480 }}>
      <p style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 24 }}>SECURE PAYMENT</p>

      <label>CARDHOLDER NAME</label>
      <input
        value={values.cardholderName}
        onChange={(e) => onChange("cardholderName", e.target.value)}
        placeholder="Jane Smith"
        style={{ display: "block", width: "100%", marginBottom: 16, padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
      />

      <label>CARD NUMBER</label>
      <input
        value={values.cardNumber}
        onChange={(e) => onChange("cardNumber", e.target.value)}
        placeholder="0000 0000 0000 0000"
        style={{ display: "block", width: "100%", marginBottom: 16, padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
      />

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label>EXPIRY DATE</label>
          <input
            value={values.expiry}
            onChange={(e) => onChange("expiry", e.target.value)}
            placeholder="MM/YY"
            style={{ display: "block", width: "100%", padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>CVV</label>
          <input
            value={values.cvv}
            onChange={(e) => onChange("cvv", e.target.value)}
            placeholder="..."
            style={{ display: "block", width: "100%", padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
          />
        </div>
      </div>

      <label>AMOUNT</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <select
          value={values.currency}
          onChange={(e) => onChange("currency", e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
        >
          <option value="INR">₹ INR</option>
          <option value="USD">$ USD</option>
        </select>
        <input
          value={values.amount}
          onChange={(e) => onChange("amount", e.target.value)}
          placeholder="0.00"
          style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
        />
      </div>

      <button
        style={{ width: "100%", padding: 16, borderRadius: 8, background: "#2a2a3e", color: "white", border: "none", cursor: "pointer" }}
      >
        Pay Now
      </button>
    </div>
  );
}
