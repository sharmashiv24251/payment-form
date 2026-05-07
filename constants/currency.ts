import type { Currency } from "@/types";

export const CURRENCY_LABEL: Record<Currency, string> = {
  INR: "₹ INR",
  USD: "$ USD",
};

export const OPPOSITE_CURRENCY: Record<Currency, Currency> = {
  INR: "USD",
  USD: "INR",
};
