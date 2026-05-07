"use client";

import { useState } from "react";
import type { PaymentFormValues } from "@/types";
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

  function handleChange(field: keyof PaymentFormValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div style={{ display: "flex", gap: 64, alignItems: "flex-start" }}>
      <CardPreview
        card={{
          cardholderName: formValues.cardholderName,
          cardNumber: formValues.cardNumber,
          expiry: formValues.expiry,
          cvv: formValues.cvv,
          type: "unknown",
        }}
      />
      <PaymentForm values={formValues} onChange={handleChange} />
    </div>
  );
}
