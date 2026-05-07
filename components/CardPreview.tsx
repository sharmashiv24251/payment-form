"use client";

import type { CardDetails } from "@/types";

interface CardPreviewProps {
  card: CardDetails;
}

export default function CardPreview({ card }: CardPreviewProps) {
  return (
    <div className="w-full rounded-2xl p-5 text-white" style={{ background: "#1a1a2e" }}>
      <div className="text-2xl mb-6">💳</div>
      <div className="tracking-widest text-base mb-6">
        {card.cardNumber || "0000 0000 0000 0000"}
      </div>
      <div className="flex justify-between text-sm">
        <div>
          <div className="text-[10px] opacity-50 tracking-widest mb-0.5">CARD HOLDER</div>
          <div>{card.cardholderName || "FULL NAME"}</div>
        </div>
        <div>
          <div className="text-[10px] opacity-50 tracking-widest mb-0.5">EXPIRES</div>
          <div>{card.expiry || "MM / YY"}</div>
        </div>
      </div>
    </div>
  );
}
