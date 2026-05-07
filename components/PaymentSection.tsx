"use client";

import { useState } from "react";
import type { CardType, FormErrors, GatewayResponse, PaymentFormValues, PaymentPayload, PaymentStatus } from "@/types";
import { detectCardType, formatCardNumber, formatExpiry, validateCardNumber, validateCVV, validateExpiry } from "@/utils/card";
import { formatCurrency } from "@/utils/format";
import { useTransactionStore } from "@/store/transactionStore";
import { ABORT_TIMEOUT_MS, MAX_RETRIES } from "@/constants/gateway";
import { AMOUNT_DEDUPE_DECIMAL_REGEX, AMOUNT_FILTER_REGEX, NAME_FILTER_REGEX } from "@/constants/validation";
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

type TouchedFields = Partial<Record<keyof PaymentFormValues, boolean>>;

export default function PaymentSection() {
  const [formValues, setFormValues]   = useState<PaymentFormValues>(initialValues);
  const [cardType, setCardType]       = useState<CardType>("unknown");
  const [errors, setErrors]           = useState<FormErrors>({});
  const [touched, setTouched]         = useState<TouchedFields>({});
  const [status, setStatus]           = useState<PaymentStatus>("idle");
  const [failReason, setFailReason]   = useState<string | undefined>();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [attemptCount, setAttemptCount]   = useState(0);
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  function computeErrors(vals: PaymentFormValues, type: CardType): FormErrors {
    const e: FormErrors = {};
    const name = vals.cardholderName.trim();
    if (!name) e.cardholderName = "Cardholder name is required";
    else if (name.length < 2) e.cardholderName = "Name is too short";
    const cardErr = validateCardNumber(vals.cardNumber, type);
    if (cardErr) e.cardNumber = cardErr;
    const expiryErr = validateExpiry(vals.expiry);
    if (expiryErr) e.expiry = expiryErr;
    const cvvErr = validateCVV(vals.cvv, type);
    if (cvvErr) e.cvv = cvvErr;
    const amt = parseFloat(vals.amount);
    if (!vals.amount || isNaN(amt) || amt <= 0) e.amount = "Enter a valid amount greater than 0";
    return e;
  }

  const isFormValid = Object.keys(computeErrors(formValues, cardType)).length === 0;

  function handleChange(field: keyof PaymentFormValues, value: string) {
    let next = value;
    let nextType = cardType;

    if (field === "cardholderName") {
      next = value.replace(NAME_FILTER_REGEX, "");
    }
    if (field === "cardNumber") {
      nextType = detectCardType(value);
      setCardType(nextType);
      next = formatCardNumber(value, nextType);
    }
    if (field === "expiry") {
      next = formatExpiry(value);
    }
    if (field === "cvv") {
      next = value.replace(/\D/g, "");
    }
    if (field === "amount") {
      next = value.replace(AMOUNT_FILTER_REGEX, "").replace(AMOUNT_DEDUPE_DECIMAL_REGEX, "$1");
    }

    const nextVals = { ...formValues, [field]: next };
    setFormValues(nextVals);
    setErrors(computeErrors(nextVals, nextType));
  }

  function handleBlur(field: keyof PaymentFormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(computeErrors(formValues, cardType));
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
      const outcome =
        data.outcome === "success" ? "success"
        : data.outcome === "timeout" ? "timeout"
        : "failed";
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
    const allTouched: TouchedFields = {
      cardholderName: true, cardNumber: true, expiry: true,
      cvv: true, amount: true, currency: true,
    };
    setTouched(allTouched);
    const errs = computeErrors(formValues, cardType);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const txId = crypto.randomUUID();
    setTransactionId(txId);
    setAttemptCount(1);
    await executePayment(txId, 1);
  }

  async function handleRetry() {
    if (!transactionId || attemptCount >= MAX_RETRIES) return;
    const next = attemptCount + 1;
    setAttemptCount(next);
    await executePayment(transactionId, next);
  }

  function handleCancel() {
    setStatus("idle");
    setTransactionId(null);
    setAttemptCount(0);
    setFailReason(undefined);
    setFormValues(initialValues);
    setCardType("unknown");
    setErrors({});
    setTouched({});
  }

  const showResult = status !== "idle";

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
          key={status}
          status={status as "processing" | "success" | "failed" | "timeout"}
          reason={failReason}
          amount={formValues.amount}
          currency={formValues.currency}
          transactionId={transactionId}
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
          touched={touched}
          isFormValid={isFormValid}
          attemptCount={attemptCount}
          maxRetries={MAX_RETRIES}
          onChange={handleChange}
          onBlur={handleBlur}
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
  currency,
  transactionId,
  attemptCount,
  maxRetries,
  onRetry,
  onCancel,
}: {
  status: "processing" | "success" | "failed" | "timeout";
  reason?: string;
  amount: string;
  currency: string;
  transactionId: string | null;
  attemptCount: number;
  maxRetries: number;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const canRetry      = attemptCount < maxRetries;
  const exhausted     = !canRetry;
  const formattedAmt  = formatCurrency(amount, currency);
  const txnShort      = transactionId ? "TXN · " + transactionId.split("-")[0].toUpperCase() : null;

  const shell = "w-full border border-[#22263a] rounded-2xl overflow-hidden bg-[#0d0f18]";
  const body  = "flex flex-col items-center text-center px-8 py-[52px]";

  const ghostBtn =
    "py-[11px] px-[22px] rounded-lg bg-transparent border border-[#22263a] text-[13px] font-semibold text-[#e4e7f2] cursor-pointer transition-colors hover:border-[#7877e6] hover:text-[#7877e6]";
  const primaryBtn =
    "py-[11px] px-[22px] rounded-lg bg-[#5856d6] text-white text-[13px] font-bold cursor-pointer border-none transition-colors hover:bg-[#7877e6]";
  const disabledBtn =
    "py-[11px] px-[22px] rounded-lg bg-[#191c2a] text-[#323756] text-[13px] font-bold cursor-not-allowed border-none";

  if (status === "processing") {
    return (
      <div key="processing" className={`${shell} pf-screen-enter`}>
        <div className={body}>
          <div className="w-[72px] h-[72px] rounded-full bg-[rgba(88,86,214,0.18)] border-2 border-[rgba(88,86,214,0.3)] flex items-center justify-center mb-[22px]">
            <div
              className="w-[34px] h-[34px] rounded-full border-[3px] border-[rgba(88,86,214,0.25)] border-t-[#5856d6] animate-spin"
              role="status"
              aria-label="Processing"
            />
          </div>
          <p className="text-[20px] font-bold tracking-tight mb-1.5 text-[#e4e7f2]">Processing Payment</p>
          <p className="text-[13px] text-[#5a6080] leading-relaxed mb-4">Please don&apos;t close this window</p>
          {formattedAmt && (
            <p className="text-[36px] font-extrabold tracking-[-0.04em] text-[#e4e7f2] mb-1">{formattedAmt}</p>
          )}
          {txnShort && (
            <span className="font-mono text-[11px] text-[#5a6080] bg-[#191c2a] border border-[#22263a] rounded px-2.5 py-1">
              {txnShort}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div key="success" className={`${shell} pf-screen-enter`}>
        <div className={body}>
          <div
            className="w-[72px] h-[72px] rounded-full bg-[rgba(52,217,148,0.1)] border-2 border-[rgba(52,217,148,0.3)] flex items-center justify-center mb-[22px]"
            role="img"
            aria-label="Success"
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
              <path
                className="pf-check-path"
                d="M9 19L16 26L29 12"
                stroke="#34d994"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[20px] font-bold tracking-tight mb-1.5 text-[#34d994]">Payment Successful</p>
          <p className="text-[13px] text-[#5a6080] leading-relaxed mb-4">
            Your payment has been processed successfully
          </p>
          {formattedAmt && (
            <p className="text-[36px] font-extrabold tracking-[-0.04em] text-[#e4e7f2] mb-1">{formattedAmt}</p>
          )}
          {txnShort && (
            <span className="font-mono text-[11px] text-[#5a6080] bg-[#191c2a] border border-[#22263a] rounded px-2.5 py-1 mb-7">
              {txnShort}
            </span>
          )}
          <button onClick={onCancel} className={`${ghostBtn} min-w-[180px] mt-7`}>
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div key="timeout" className={`${shell} pf-screen-enter`}>
        <div className={body}>
          <div
            className="w-[72px] h-[72px] rounded-full bg-[rgba(245,166,35,0.1)] border-2 border-[rgba(245,166,35,0.3)] flex items-center justify-center mb-[22px]"
            role="img"
            aria-label="Timeout"
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
              <circle cx="19" cy="20" r="12" stroke="#f5a623" strokeWidth="2.5" />
              <path d="M19 15V20.5L22.5 24" stroke="#f5a623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 8H22" stroke="#f5a623" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M19 5V8"  stroke="#f5a623" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[20px] font-bold tracking-tight mb-1.5 text-[#f5a623]">Request Timed Out</p>
          <p className="text-[13px] text-[#5a6080] leading-relaxed mb-5">
            The payment took too long to respond.{" "}
            <br />
            Your card has <strong className="text-[#e4e7f2]">not</strong> been charged.
          </p>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[rgba(245,166,35,0.1)] text-[#f5a623] border border-[rgba(245,166,35,0.2)] mb-5">
            Attempt {attemptCount} of {maxRetries} timed out
          </span>
          <div className="flex gap-2.5 items-center">
            {canRetry ? (
              <button onClick={onRetry} className={primaryBtn}>Retry Payment</button>
            ) : (
              <button disabled className={disabledBtn}>No retries left</button>
            )}
            <button onClick={onCancel} className={ghostBtn}>Cancel</button>
          </div>
          {exhausted && (
            <p className="text-[12px] text-[#5a6080] mt-3.5">
              Maximum attempts reached. Please try again later.
            </p>
          )}
        </div>
      </div>
    );
  }

  // failed
  return (
    <div key="failed" className={`${shell} pf-screen-enter`}>
      <div className={body}>
        <div
          className="w-[72px] h-[72px] rounded-full bg-[rgba(240,82,112,0.1)] border-2 border-[rgba(240,82,112,0.3)] flex items-center justify-center mb-[22px]"
          role="img"
          aria-label="Failed"
        >
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
            <path className="pf-x-path"   d="M12 12L26 26" stroke="#f05270" strokeWidth="3" strokeLinecap="round" />
            <path className="pf-x-path-2" d="M26 12L12 26" stroke="#f05270" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-[20px] font-bold tracking-tight mb-1.5 text-[#f05270]">Payment Failed</p>
        <p className="text-[13px] text-[#5a6080] leading-relaxed mb-5">
          {reason ?? "Your payment could not be processed."}
        </p>
        <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[rgba(240,82,112,0.1)] text-[#f05270] border border-[rgba(240,82,112,0.2)] mb-5">
          Attempt {attemptCount} of {maxRetries} failed
        </span>
        <div className="flex gap-2.5 items-center">
          {canRetry ? (
            <button onClick={onRetry} className={primaryBtn}>Retry Payment</button>
          ) : (
            <button disabled className={disabledBtn}>No retries left</button>
          )}
          <button onClick={onCancel} className={ghostBtn}>Cancel</button>
        </div>
        {exhausted && (
          <p className="text-[12px] text-[#5a6080] mt-3.5">
            Maximum attempts reached. Please try a different card or contact your bank.
          </p>
        )}
      </div>
    </div>
  );
}
