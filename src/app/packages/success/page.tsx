import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import { PaymentSuccessView } from "@/components/packages/PackagesViews";

export default function PaymentSuccessPage() {
  return (
    <AppShell titleKey="pageTitle.paymentSuccess">
      <Suspense fallback={null}>
        <PaymentSuccessView />
      </Suspense>
    </AppShell>
  );
}
