"use client";

import Image from "next/image";
import type { CardDetails } from "@/types";
import { CARD_ICONS } from "@/constants/card";

interface CardPreviewProps {
  card: CardDetails;
}

export default function CardPreview({ card }: CardPreviewProps) {
  const icon = CARD_ICONS[card.type];

  return (
    <div className="w-full md:w-72 md:shrink-0 rounded-2xl p-5 text-white bg-[#1a1a2e]">
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-8 bg-yellow-400/80 rounded-md" />
        {icon && (
          <Image src={icon} alt={card.type} width={48} height={30} className="object-contain" />
        )}
      </div>
      <div className="tracking-widest text-base mb-6 font-mono">
        {card.cardNumber || "0000 0000 0000 0000"}
      </div>
      <div className="flex justify-between text-sm">
        <div className="min-w-0 flex-1 mr-4">
          <div className="text-[10px] opacity-50 tracking-widest mb-0.5">CARD HOLDER</div>
          <div className="truncate uppercase">{card.cardholderName || "FULL NAME"}</div>
        </div>
        <div className="shrink-0">
          <div className="text-[10px] opacity-50 tracking-widest mb-0.5">EXPIRES</div>
          <div>{card.expiry || "MM / YY"}</div>
        </div>
      </div>
    </div>
  );
}
