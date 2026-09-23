import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import { PaymentView } from "@/components/packages/PackagesViews";

export default function PaymentPage() {
  return (
    <AppShell titleKey="pageTitle.payment">
      <Suspense fallback={null}>
        <PaymentView />
      </Suspense>
    </AppShell>
  );
}
