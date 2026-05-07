"use client";

import { useState } from "react";
import type { CardType, FormErrors, GatewayResponse, PaymentFormValues, PaymentPayload, PaymentStatus } from "@/types";
import { detectCardType, formatCardNumber, formatExpiry, validateCardNumber, validateCVV, validateExpiry } from "@/utils/card";
import CardPreview from "./CardPreview";
import PaymentForm from "./PaymentForm";

const initialValues: PaymentFormValues = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
  currency: "INR",
};

export default function PaymentSection() {
  const [formValues, setFormValues] = useState<PaymentFormValues>(initialValues);
  const [cardType, setCardType] = useState<CardType>("unknown");
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [failReason, setFailReason] = useState<string | undefined>();

  function handleChange(field: keyof PaymentFormValues, value: string) {
    let next = value;

    if (field === "cardNumber") {
      const type = detectCardType(value);
      setCardType(type);
      next = formatCardNumber(value, type);
      setErrors((prev) => ({ ...prev, cardNumber: validateCardNumber(next, type) ?? undefined }));
    }

    if (field === "expiry") {
      next = formatExpiry(value);
      setErrors((prev) => ({ ...prev, expiry: validateExpiry(next) ?? undefined }));
    }

    if (field === "cvv") {
      next = value.replace(/\D/g, "");
      setErrors((prev) => ({ ...prev, cvv: validateCVV(next, cardType) ?? undefined }));
    }

    setFormValues((prev) => ({ ...prev, [field]: next }));
  }

  async function handleSubmit() {
    const newErrors: FormErrors = {};
    if (!formValues.cardholderName.trim()) newErrors.cardholderName = "Required";
    const cardErr = validateCardNumber(formValues.cardNumber, cardType);
    if (cardErr) newErrors.cardNumber = cardErr;
    const expiryErr = validateExpiry(formValues.expiry);
    if (expiryErr) newErrors.expiry = expiryErr;
    const cvvErr = validateCVV(formValues.cvv, cardType);
    if (cvvErr) newErrors.cvv = cvvErr;
    if (!formValues.amount || parseFloat(formValues.amount) <= 0) newErrors.amount = "Enter a valid amount";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("processing");
    setFailReason(undefined);

    const payload: PaymentPayload = {
      transactionId: crypto.randomUUID(),
      cardholderName: formValues.cardholderName,
      cardNumber: formValues.cardNumber.replace(/\s/g, ""),
      expiry: formValues.expiry,
      cvv: formValues.cvv,
      amount: parseFloat(formValues.amount),
      currency: formValues.currency,
    };

    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: GatewayResponse = await res.json();
      setStatus(data.outcome === "success" ? "success" : data.outcome === "timeout" ? "timeout" : "failed");
      setFailReason(data.reason);
    } catch {
      setStatus("failed");
      setFailReason("Network error. Please try again.");
    }
  }

  function handleReset() {
    setStatus("idle");
    setFailReason(undefined);
    setFormValues(initialValues);
    setCardType("unknown");
    setErrors({});
  }

  const currencySymbol = formValues.currency === "INR" ? "₹" : "$";
  const showResult = status === "success" || status === "failed" || status === "timeout";

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full md:items-start">
      <CardPreview
        card={{
          cardholderName: formValues.cardholderName,
          cardNumber: formValues.cardNumber,
          expiry: formValues.expiry,
          type: cardType,
        }}
      />
      {showResult ? (
        <ResultCard
          status={status as "success" | "failed" | "timeout"}
          reason={failReason}
          amount={formValues.amount}
          currencySymbol={currencySymbol}
          onReset={handleReset}
        />
      ) : (
        <PaymentForm
          values={formValues}
          cardType={cardType}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          status={status}
        />
      )}
    </div>
  );
}

function ResultCard({
  status,
  reason,
  amount,
  currencySymbol,
  onReset,
}: {
  status: "success" | "failed" | "timeout";
  reason?: string;
  amount: string;
  currencySymbol: string;
  onReset: () => void;
}) {
  const resetBtn = (
    <button
      onClick={onReset}
      className="mt-2 w-full py-3 rounded-lg bg-[#2a2a3e] text-white text-xs tracking-widest cursor-pointer border-none hover:bg-[#363652] transition-colors"
    >
      TRY AGAIN
    </button>
  );

  if (status === "success") {
    return (
      <div className="w-full border border-[#1a3a1a] rounded-2xl p-5 flex flex-col items-center justify-center gap-4 min-h-[320px]">
        <div className="w-14 h-14 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white text-base font-medium mb-1">Payment Successful</p>
          <p className="text-[#888] text-sm">{currencySymbol}{amount} processed</p>
        </div>
        <button
          onClick={onReset}
          className="mt-2 w-full py-3 rounded-lg bg-[#1a3a1a] text-green-400 text-xs tracking-widest cursor-pointer border border-green-900 hover:bg-[#224422] transition-colors"
        >
          NEW PAYMENT
        </button>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="w-full border border-[#3a2e00] rounded-2xl p-5 flex flex-col items-center justify-center gap-4 min-h-[320px]">
        <div className="w-14 h-14 rounded-full bg-yellow-900/20 border border-yellow-700 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white text-base font-medium mb-1">Request Timed Out</p>
          <p className="text-[#888] text-sm">The gateway took too long to respond. Your card was not charged.</p>
        </div>
        {resetBtn}
      </div>
    );
  }

  return (
    <div className="w-full border border-[#3a1a1a] rounded-2xl p-5 flex flex-col items-center justify-center gap-4 min-h-[320px]">
      <div className="w-14 h-14 rounded-full bg-red-900/20 border border-red-800 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-white text-base font-medium mb-1">Payment Failed</p>
        {reason && <p className="text-red-400 text-sm">{reason}</p>}
      </div>
      {resetBtn}
    </div>
  );
}
