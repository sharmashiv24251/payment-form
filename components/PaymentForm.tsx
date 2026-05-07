"use client";

import Image from "next/image";
import type { CardType, FormErrors, PaymentFormValues, PaymentStatus } from "@/types";
import { cvvMaxLength } from "@/utils/card";
import { formatCurrency } from "@/utils/format";
import { CARD_BADGE, CARD_ICONS } from "@/constants/card";
import { CURRENCY_LABEL, OPPOSITE_CURRENCY } from "@/constants/currency";

interface PaymentFormProps {
  values: PaymentFormValues;
  cardType: CardType;
  errors: FormErrors;
  touched: Partial<Record<keyof PaymentFormValues, boolean>>;
  isFormValid: boolean;
  attemptCount: number;
  maxRetries: number;
  onChange: (field: keyof PaymentFormValues, value: string) => void;
  onBlur: (field: keyof PaymentFormValues) => void;
  onSubmit: () => void;
  status: PaymentStatus;
}

function inputCls(hasError: boolean, isValid: boolean, extra = "") {
  const base =
    "w-full px-3 py-[11px] rounded-lg border bg-[#191c2a] text-[#e4e7f2] text-sm placeholder-[#323756] outline-none transition-[border-color,box-shadow] duration-200 " +
    extra;
  if (hasError)
    return base + " border-[#f05270] shadow-[0_0_0_3px_rgba(240,82,112,0.12)] focus:border-[#f05270] focus:shadow-[0_0_0_3px_rgba(240,82,112,0.12)]";
  if (isValid)
    return base + " border-[rgba(52,217,148,0.5)] focus:border-[#5856d6] focus:shadow-[0_0_0_3px_rgba(88,86,214,0.18)]";
  return base + " border-[#22263a] focus:border-[#5856d6] focus:shadow-[0_0_0_3px_rgba(88,86,214,0.18)]";
}

function FieldError({ id, message, visible }: { id?: string; message?: string; visible: boolean }) {
  const show = visible && !!message;
  return (
    <div
      id={id}
      role={show ? "alert" : undefined}
      className={`overflow-hidden transition-all duration-200 ease-out ${show ? "max-h-5 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
    >
      <span className="text-[11px] text-[#f05270]">{message}</span>
    </div>
  );
}

export default function PaymentForm({
  values,
  cardType,
  errors,
  touched,
  isFormValid,
  attemptCount,
  maxRetries,
  onChange,
  onBlur,
  onSubmit,
  status,
}: PaymentFormProps) {
  const maxCvv    = cvvMaxLength(cardType);
  const cardIcon  = CARD_ICONS[cardType];
  const badge     = CARD_BADGE[cardType];
  const isProcessing = status === "processing";

  const fs = (field: keyof PaymentFormValues, hasValue?: boolean) => {
    const hv = hasValue !== undefined ? hasValue : !!values[field];
    return {
      hasError: !!(touched[field] && errors[field]),
      isValid:  !!(touched[field] && !errors[field] && hv),
    };
  };

  const nameFs   = fs("cardholderName", !!values.cardholderName.trim());
  const cardFs   = fs("cardNumber");
  const expiryFs = fs("expiry");
  const cvvFs    = fs("cvv");
  const amountFs = fs("amount", parseFloat(values.amount) > 0 && !isNaN(parseFloat(values.amount)));

  const formattedAmount = isFormValid
    ? formatCurrency(values.amount, values.currency)
    : null;

  const amountShellCls =
    "flex rounded-lg overflow-hidden border transition-[border-color,box-shadow] duration-200 " +
    (amountFs.hasError
      ? "border-[#f05270] shadow-[0_0_0_3px_rgba(240,82,112,0.12)] focus-within:border-[#f05270] focus-within:shadow-[0_0_0_3px_rgba(240,82,112,0.12)]"
      : amountFs.isValid
      ? "border-[rgba(52,217,148,0.5)] focus-within:border-[#5856d6] focus-within:shadow-[0_0_0_3px_rgba(88,86,214,0.18)]"
      : "border-[#22263a] focus-within:border-[#5856d6] focus-within:shadow-[0_0_0_3px_rgba(88,86,214,0.18)]");

  const labelCls   = "block text-[11px] font-semibold tracking-[0.06em] text-[#5a6080] mb-1.5";
  const disabledCls = "disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="w-full border border-[#22263a] rounded-2xl overflow-hidden bg-[#0d0f18]">
      <div className="px-7 pt-6">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-[#5a6080]">SECURE PAYMENT</p>
      </div>

      <div className="px-7 pt-5 pb-7 flex flex-col gap-3.5">
        {/* Cardholder name */}
        <div>
          <label className={labelCls} htmlFor="pf-name">CARDHOLDER NAME</label>
          <input
            id="pf-name"
            value={values.cardholderName}
            onChange={(e) => onChange("cardholderName", e.target.value)}
            onBlur={() => onBlur("cardholderName")}
            placeholder="Jane Smith"
            disabled={isProcessing}
            autoComplete="cc-name"
            aria-describedby="pf-name-err"
            className={inputCls(nameFs.hasError, nameFs.isValid, disabledCls)}
          />
          <FieldError id="pf-name-err" message={errors.cardholderName} visible={nameFs.hasError} />
        </div>

        {/* Card number */}
        <div>
          <label className={labelCls} htmlFor="pf-card">CARD NUMBER</label>
          <div className="relative">
            <input
              id="pf-card"
              value={values.cardNumber}
              onChange={(e) => onChange("cardNumber", e.target.value)}
              onBlur={() => onBlur("cardNumber")}
              placeholder="0000 0000 0000 0000"
              disabled={isProcessing}
              inputMode="numeric"
              autoComplete="cc-number"
              aria-describedby="pf-card-err"
              className={inputCls(cardFs.hasError, cardFs.isValid, `pr-16 font-mono tracking-[0.04em] ${disabledCls}`)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center" aria-hidden="true">
              {cardIcon ? (
                <Image src={cardIcon} alt={cardType} width={34} height={22} className="object-contain" />
              ) : (
                <span className={`text-[11px] font-bold tracking-[0.08em] ${badge.cls}`}>
                  {badge.label}
                </span>
              )}
            </span>
          </div>
          <FieldError id="pf-card-err" message={errors.cardNumber} visible={cardFs.hasError} />
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="pf-expiry">EXPIRY DATE</label>
            <input
              id="pf-expiry"
              value={values.expiry}
              onChange={(e) => onChange("expiry", e.target.value)}
              onBlur={() => onBlur("expiry")}
              placeholder="MM/YY"
              maxLength={5}
              inputMode="numeric"
              disabled={isProcessing}
              autoComplete="cc-exp"
              aria-describedby="pf-expiry-err"
              className={inputCls(expiryFs.hasError, expiryFs.isValid, disabledCls)}
            />
            <FieldError id="pf-expiry-err" message={errors.expiry} visible={expiryFs.hasError} />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-cvv">CVV</label>
            <input
              id="pf-cvv"
              value={values.cvv}
              onChange={(e) => onChange("cvv", e.target.value)}
              onBlur={() => onBlur("cvv")}
              placeholder={"•".repeat(3)}
              maxLength={maxCvv}
              inputMode="numeric"
              disabled={isProcessing}
              autoComplete="cc-csc"
              aria-describedby="pf-cvv-err"
              className={inputCls(cvvFs.hasError, cvvFs.isValid, `font-mono tracking-widest ${disabledCls}`)}
            />
            <FieldError id="pf-cvv-err" message={errors.cvv} visible={cvvFs.hasError} />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#22263a]" />

        {/* Amount */}
        <div>
          <label className={labelCls} htmlFor="pf-amount">AMOUNT</label>
          <div className={amountShellCls}>
            <button
              type="button"
              onClick={() => onChange("currency", OPPOSITE_CURRENCY[values.currency])}
              disabled={isProcessing}
              aria-label={`Currency: ${values.currency}. Click to switch.`}
              className={`bg-[#13151f] border-r border-[#22263a] px-3 py-[11px] flex items-center justify-between gap-1.5 text-[12px] font-bold text-[#5a6080] w-[80px] shrink-0 transition-colors duration-150 hover:text-[#e4e7f2] hover:bg-[#191c2a] group ${disabledCls}`}
            >
              <span>{CURRENCY_LABEL[values.currency]}</span>
              <svg
                width="10" height="14" viewBox="0 0 10 14" fill="none"
                className="shrink-0 text-[#323756] group-hover:text-[#5a6080] transition-colors duration-150"
                aria-hidden="true"
              >
                <path d="M2.5 5L5 2L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.5 9L5 12L7.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <input
              id="pf-amount"
              value={values.amount}
              onChange={(e) => onChange("amount", e.target.value)}
              onBlur={() => onBlur("amount")}
              placeholder="0.00"
              inputMode="decimal"
              disabled={isProcessing}
              autoComplete="off"
              aria-describedby="pf-amount-err"
              className={`flex-1 bg-[#191c2a] px-3.5 py-[11px] text-[15px] font-medium text-[#e4e7f2] placeholder-[#323756] outline-none font-mono ${disabledCls}`}
            />
          </div>
          <FieldError id="pf-amount-err" message={errors.amount} visible={amountFs.hasError} />
        </div>

        {/* Retry context tag */}
        {attemptCount > 0 && (
          <div className="text-[11px] font-semibold text-[#f5a623] bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] rounded-full px-4 py-[5px] text-center">
            Attempt {attemptCount + 1} of {maxRetries}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={onSubmit}
          disabled={!isFormValid || isProcessing}
          aria-label="Pay now"
          className={[
            "w-full py-[13px] rounded-lg text-[14px] font-bold tracking-[0.02em] transition-all duration-200 relative overflow-hidden border-none",
            isFormValid && !isProcessing
              ? "bg-[#5856d6] hover:bg-[#7877e6] active:scale-[0.992] text-white cursor-pointer"
              : "bg-[#191c2a] text-[#323756] cursor-not-allowed",
          ].join(" ")}
        >
          {isFormValid && !isProcessing && (
            <span className="absolute inset-0 pointer-events-none bg-linear-to-br from-white/8 to-transparent" />
          )}
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
              Processing...
            </span>
          ) : isFormValid ? (
            `Pay ${formattedAmount}`
          ) : (
            "Pay Now"
          )}
        </button>
      </div>
    </div>
  );
}
