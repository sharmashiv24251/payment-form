"use client";

import Image from "next/image";
import type { CardType, FormErrors, PaymentFormValues, PaymentStatus } from "@/types";
import { cvvMaxLength } from "@/utils/card";
import { CARD_ICONS } from "@/constants/card";

interface PaymentFormProps {
  values: PaymentFormValues;
  cardType: CardType;
  errors: FormErrors;
  onChange: (field: keyof PaymentFormValues, value: string) => void;
  onSubmit: () => void;
  status: PaymentStatus;
}

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm placeholder-[#444] outline-none focus:border-[#555]";
const labelClass = "block text-[10px] tracking-widest text-[#888] mb-1.5";
const errorClass = "text-[10px] text-red-400 mt-1";

export default function PaymentForm({ values, cardType, errors, onChange, onSubmit, status }: PaymentFormProps) {
  const maxCvv = cvvMaxLength(cardType);
  const cardIcon = CARD_ICONS[cardType];
  const isProcessing = status === "processing";
  const disabledInput = `${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`;

  return (
    <div className="w-full border border-[#222] rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-[10px] tracking-widest text-[#555]">SECURE PAYMENT</p>

      <div>
        <label className={labelClass}>CARDHOLDER NAME</label>
        <input
          value={values.cardholderName}
          onChange={(e) => onChange("cardholderName", e.target.value)}
          placeholder="Jane Smith"
          disabled={isProcessing}
          className={disabledInput}
        />
        {errors.cardholderName && <p className={errorClass}>{errors.cardholderName}</p>}
      </div>

      <div>
        <label className={labelClass}>CARD NUMBER</label>
        <div className="relative">
          <input
            value={values.cardNumber}
            onChange={(e) => onChange("cardNumber", e.target.value)}
            placeholder="0000 0000 0000 0000"
            disabled={isProcessing}
            className={`${disabledInput} pr-14`}
            inputMode="numeric"
          />
          {cardIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Image src={cardIcon} alt={cardType} width={36} height={24} className="object-contain" />
            </span>
          )}
        </div>
        {errors.cardNumber && <p className={errorClass}>{errors.cardNumber}</p>}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>EXPIRY DATE</label>
          <input
            value={values.expiry}
            onChange={(e) => onChange("expiry", e.target.value)}
            placeholder="MM/YY"
            maxLength={5}
            inputMode="numeric"
            disabled={isProcessing}
            className={disabledInput}
          />
          {errors.expiry && <p className={errorClass}>{errors.expiry}</p>}
        </div>
        <div className="flex-1">
          <label className={labelClass}>CVV</label>
          <input
            value={values.cvv}
            onChange={(e) => onChange("cvv", e.target.value)}
            placeholder={"·".repeat(maxCvv)}
            maxLength={maxCvv}
            inputMode="numeric"
            disabled={isProcessing}
            className={disabledInput}
          />
          {errors.cvv && <p className={errorClass}>{errors.cvv}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>AMOUNT</label>
        <div className="flex gap-2">
          <select
            value={values.currency}
            onChange={(e) => onChange("currency", e.target.value)}
            disabled={isProcessing}
            className="px-3 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-[#555] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>
          <input
            value={values.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            disabled={isProcessing}
            className={`${disabledInput} flex-1`}
          />
        </div>
        {errors.amount && <p className={errorClass}>{errors.amount}</p>}
      </div>

      <button
        onClick={onSubmit}
        disabled={isProcessing}
        className="w-full py-3 rounded-lg bg-[#2a2a3e] text-white text-sm tracking-widest cursor-pointer border-none hover:bg-[#363652] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            PROCESSING...
          </>
        ) : (
          "PAY NOW"
        )}
      </button>
    </div>
  );
}
