import type { CardType } from "@/types";
import {
  AMEX_CARD_LENGTH,
  AMEX_CVV_LENGTH,
  STANDARD_CARD_LENGTH,
  STANDARD_CVV_LENGTH,
} from "@/constants/card";

export function detectCardType(raw: string): CardType {
  const n = raw.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^3[47]/.test(n)) return "amex";
  if (/^5[1-5]/.test(n) || /^2(2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720)/.test(n)) return "mastercard";
  return "unknown";
}

// Amex: 4-6-5   Others: 4-4-4-4
export function formatCardNumber(raw: string, type: CardType): string {
  const digits = raw.replace(/\D/g, "");
  if (type === "amex") {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, AMEX_CARD_LENGTH);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }
  return digits.slice(0, STANDARD_CARD_LENGTH).replace(/(.{4})/g, "$1 ").trimEnd();
}

export function cvvMaxLength(type: CardType): number {
  return type === "amex" || type === "unknown" ? AMEX_CVV_LENGTH : STANDARD_CVV_LENGTH;
}

export function validateCardNumber(raw: string, type: CardType): string | null {
  const digits = raw.replace(/\s/g, "");
  const maxLen = type === "amex" ? AMEX_CARD_LENGTH : STANDARD_CARD_LENGTH;
  if (digits.length === 0) return "Card number is required";
  if (digits.length < maxLen) return `Must be ${maxLen} digits`;
  return null;
}

export function validateCVV(cvv: string, type: CardType): string | null {
  const len = cvvMaxLength(type);
  if (cvv.length === 0) return "CVV is required";
  if (cvv.length !== len) return `Must be ${len} digits`;
  return null;
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validateExpiry(value: string): string | null {
  if (!value) return "Expiry is required";
  if (!/^\d{2}\/\d{2}$/.test(value)) return "Use MM/YY format";
  const [mm, yy] = value.split("/").map(Number);
  if (mm < 1 || mm > 12) return "Invalid month";
  const now = new Date();
  const cardYear = 2000 + yy;
  if (cardYear < now.getFullYear() || (cardYear === now.getFullYear() && mm < now.getMonth() + 1)) {
    return "Card has expired";
  }
  return null;
}
