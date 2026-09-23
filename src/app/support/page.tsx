import AppShell from "@/components/layout/AppShell";
import { SupportView } from "@/components/support/SupportView";

export default function SupportPage() {
  return (
    <AppShell titleKey="pageTitle.support">
      <SupportView />
    </AppShell>
  );
}
