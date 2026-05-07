import type { CardType } from "@/types";

export const CARD_ICONS: Record<CardType, string | null> = {
  visa: "/cards/Visa Credit Card Icon.svg",
  mastercard: "/cards/Mastercard Credit Card Icon.svg",
  amex: "/cards/Amex Credit Card Icon.svg",
  unknown: null,
};

export const AMEX_CARD_LENGTH = 15;
export const STANDARD_CARD_LENGTH = 16;
export const AMEX_CVV_LENGTH = 4;
export const STANDARD_CVV_LENGTH = 3;
