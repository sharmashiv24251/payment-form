"use client";

import { useState } from "react";
import type { CardType, FormErrors, PaymentFormValues } from "@/types";
import { detectCardType, formatCardNumber, formatExpiry, validateCardNumber, validateCVV, validateExpiry } from "@/utils/card";
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
  const [cardType, setCardType] = useState<CardType>("unknown");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(field: keyof PaymentFormValues, value: string) {
    let next = value;

    if (field === "cardNumber") {
      const type = detectCardType(value);
      setCardType(type);
      next = formatCardNumber(value, type);
      setErrors((prev) => ({ ...prev, cardNumber: validateCardNumber(next, type) ?? undefined }));
    }

    if (field === "expiry") {
      next = formatExpiry(value);
      setErrors((prev) => ({ ...prev, expiry: validateExpiry(next) ?? undefined }));
    }

    if (field === "cvv") {
      next = value.replace(/\D/g, "");
      setErrors((prev) => ({ ...prev, cvv: validateCVV(next, cardType) ?? undefined }));
    }

    setFormValues((prev) => ({ ...prev, [field]: next }));
  }

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
      <PaymentForm values={formValues} cardType={cardType} errors={errors} onChange={handleChange} />
    </div>
  );
}
