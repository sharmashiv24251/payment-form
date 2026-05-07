export type Currency = "INR" | "USD";

export type PaymentStatus = "idle" | "processing" | "success" | "failed" | "timeout";

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  currency: Currency;
}

export interface GatewayResponse {
  outcome: "success" | "failed" | "timeout";
  reason?: string;
}

export interface PaymentResult {
  status: "success" | "failed" | "timeout";
  reason?: string;
}
