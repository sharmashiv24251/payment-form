"use client";

import type { CardDetails } from "@/types";

interface CardPreviewProps {
  card: CardDetails;
}

export default function CardPreview({ card }: CardPreviewProps) {
  return (
    <div style={{ background: "#1a1a2e", borderRadius: 16, padding: 24, width: 320, color: "white" }}>
      <div style={{ marginBottom: 32, fontSize: 24 }}>💳</div>
      <div style={{ letterSpacing: 4, fontSize: 18, marginBottom: 24 }}>
        {card.cardNumber || "0000 0000 0000 0000"}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, opacity: 0.6 }}>CARD HOLDER</div>
          <div>{card.cardholderName || "FULL NAME"}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, opacity: 0.6 }}>EXPIRES</div>
          <div>{card.expiry || "MM / YY"}</div>
        </div>
      </div>
    </div>
  );
}
