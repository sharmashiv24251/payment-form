"use client";

import { useState } from "react";
import type { CardType, FormErrors, GatewayResponse, PaymentFormValues, PaymentPayload, PaymentStatus } from "@/types";
import { detectCardType, formatCardNumber, formatExpiry, validateCardNumber, validateCVV, validateExpiry } from "@/utils/card";
import { useTransactionStore } from "@/store/transactionStore";
import { ABORT_TIMEOUT_MS, MAX_RETRIES } from "@/constants/gateway";
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
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const addTransaction = useTransactionStore((s) => s.addTransaction);

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

  async function executePayment(txId: string, attempt: number) {
    setStatus("processing");
    setFailReason(undefined);

    const payload: PaymentPayload = {
      transactionId: txId,
      cardholderName: formValues.cardholderName,
      cardNumber: formValues.cardNumber.replace(/\s/g, ""),
      expiry: formValues.expiry,
      cvv: formValues.cvv,
      amount: parseFloat(formValues.amount),
      currency: formValues.currency,
    };

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), ABORT_TIMEOUT_MS);

    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timerId);
      const data: GatewayResponse = await res.json();
      const outcome = data.outcome === "success" ? "success" : data.outcome === "timeout" ? "timeout" : "failed";
      setStatus(outcome);
      setFailReason(data.reason);
      if (outcome === "success") {
        addTransaction({
          id: txId,
          amount: payload.amount,
          currency: payload.currency,
          status: "success",
          timestamp: new Date().toISOString(),
          attemptCount: attempt,
        });
      }
    } catch (err) {
      clearTimeout(timerId);
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("timeout");
      } else {
        setStatus("failed");
        setFailReason("Network error. Please try again.");
      }
    }
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
    const txId = crypto.randomUUID();
    setTransactionId(txId);
    setAttemptCount(1);
    await executePayment(txId, 1);
  }

  async function handleRetry() {
    if (!transactionId || attemptCount >= MAX_RETRIES) return;
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    await executePayment(transactionId, nextAttempt);
  }

  function handleCancel() {
    setStatus("idle");
    setTransactionId(null);
    setAttemptCount(0);
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
          attemptCount={attemptCount}
          maxRetries={MAX_RETRIES}
          onRetry={handleRetry}
          onCancel={handleCancel}
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
  attemptCount,
  maxRetries,
  onRetry,
  onCancel,
}: {
  status: "success" | "failed" | "timeout";
  reason?: string;
  amount: string;
  currencySymbol: string;
  attemptCount: number;
  maxRetries: number;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const canRetry = attemptCount < maxRetries;

  if (status === "success") {
    return (
      <div className="w-full border border-[#1a3a1a] rounded-2xl p-8 flex flex-col items-center justify-center gap-5 min-h-[360px]">
        <div className="w-20 h-20 rounded-full bg-green-900/30 border-2 border-green-700 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-green-400 text-2xl font-bold mb-2">Payment Successful</p>
          <p className="text-[#888] text-sm">{currencySymbol}{amount} processed successfully</p>
        </div>
        <button
          onClick={onCancel}
          className="mt-2 w-full py-3 rounded-xl bg-green-900/40 text-green-400 text-sm font-semibold cursor-pointer border border-green-800 hover:bg-green-900/60 transition-colors"
        >
          New Payment
        </button>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="w-full border border-[#3a2800] rounded-2xl p-8 flex flex-col items-center justify-center gap-5 min-h-[360px]">
        <div className="w-20 h-20 rounded-full bg-[#2a1a05] border-2 border-[#7c4a10] flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <p className="text-orange-400 text-2xl font-bold">Request Timed Out</p>
          <p className="text-[#888] text-sm leading-relaxed">
            The payment took too long to respond.<br />
            Your card has <strong className="text-white">not</strong> been charged.
          </p>
        </div>
        <span className="border border-orange-800/60 bg-orange-950/40 text-orange-400 text-xs px-4 py-1.5 rounded-full font-medium">
          Attempt {attemptCount} of {maxRetries} timed out
        </span>
        {canRetry ? (
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onRetry}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer border-none transition-colors"
            >
              Retry Payment
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-transparent border border-[#333] hover:border-[#555] text-white text-sm font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full mt-1">
            <p className="text-[#666] text-xs text-center">Maximum attempts reached. Please try a different card.</p>
            <button
              onClick={onCancel}
              className="w-full py-3 rounded-xl bg-transparent border border-[#333] hover:border-[#555] text-white text-sm font-semibold cursor-pointer transition-colors"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    );
  }

  // failed
  return (
    <div className="w-full border border-[#3a1a1a] rounded-2xl p-8 flex flex-col items-center justify-center gap-5 min-h-[360px]">
      <div className="w-20 h-20 rounded-full bg-red-900/20 border-2 border-red-800 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <div className="text-center space-y-2">
        <p className="text-red-400 text-2xl font-bold">Payment Failed</p>
        {reason && <p className="text-[#888] text-sm">{reason}</p>}
      </div>
      <span className="border border-red-800/60 bg-red-950/40 text-red-400 text-xs px-4 py-1.5 rounded-full font-medium">
        Attempt {attemptCount} of {maxRetries} failed
      </span>
      {canRetry ? (
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer border-none transition-colors"
          >
            Retry Payment
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-transparent border border-[#333] hover:border-[#555] text-white text-sm font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full mt-1">
          <p className="text-[#666] text-xs text-center">Maximum attempts reached. Please try a different card.</p>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl bg-transparent border border-[#333] hover:border-[#555] text-white text-sm font-semibold cursor-pointer transition-colors"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
