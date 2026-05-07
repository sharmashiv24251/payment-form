"use client";

import type { PaymentFormValues } from "@/types";

interface PaymentFormProps {
  values: PaymentFormValues;
  onChange: (field: keyof PaymentFormValues, value: string) => void;
}

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm placeholder-[#444] outline-none focus:border-[#555]";
const labelClass = "block text-[10px] tracking-widest text-[#888] mb-1.5";

export default function PaymentForm({ values, onChange }: PaymentFormProps) {
  return (
    <div className="w-full border border-[#222] rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-[10px] tracking-widest text-[#555]">SECURE PAYMENT</p>

      <div>
        <label className={labelClass}>CARDHOLDER NAME</label>
        <input
          value={values.cardholderName}
          onChange={(e) => onChange("cardholderName", e.target.value)}
          placeholder="Jane Smith"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>CARD NUMBER</label>
        <input
          value={values.cardNumber}
          onChange={(e) => onChange("cardNumber", e.target.value)}
          placeholder="0000 0000 0000 0000"
          className={inputClass}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>EXPIRY DATE</label>
          <input
            value={values.expiry}
            onChange={(e) => onChange("expiry", e.target.value)}
            placeholder="MM/YY"
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>CVV</label>
          <input
            value={values.cvv}
            onChange={(e) => onChange("cvv", e.target.value)}
            placeholder="···"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>AMOUNT</label>
        <div className="flex gap-2">
          <select
            value={values.currency}
            onChange={(e) => onChange("currency", e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-[#555]"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>
          <input
            value={values.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            placeholder="0.00"
            className={`${inputClass} flex-1`}
          />
        </div>
      </div>

      <button className="w-full py-3 rounded-lg bg-[#2a2a3e] text-white text-sm tracking-widest cursor-pointer border-none hover:bg-[#363652] transition-colors">
        PAY NOW
      </button>
    </div>
  );
}
