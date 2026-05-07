export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export interface CardDetails {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  type: CardType;
}
