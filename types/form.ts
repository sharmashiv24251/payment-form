import type { Currency } from "./payment";

export interface PaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export type FormErrors = Partial<Record<keyof PaymentFormValues, string>>;

export type FormFieldName = keyof PaymentFormValues;
