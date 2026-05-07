import { Suspense } from "react";
import PaymentApp from "@/components/PaymentApp";

export default function Home() {
  return (
    <Suspense>
      <PaymentApp />
    </Suspense>
  );
}
