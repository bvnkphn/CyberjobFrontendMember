import AppShell from "@/components/layout/AppShell";
import { PackagesView } from "@/components/packages/PackagesViews";

export default function PackagesPage() {
  return (
    <AppShell titleKey="pageTitle.packages">
      <PackagesView />
    </AppShell>
  );
}
