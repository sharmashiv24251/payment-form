import type { Currency, PaymentStatus } from "./payment";

export type TransactionStatus = Exclude<PaymentStatus, "idle" | "processing">;

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  timestamp: string;
  attemptCount: number;
  reason?: string;
}
