import AppShell from "@/components/layout/AppShell";
import { CompanyProfileView } from "@/components/company/CompanyProfileView";

export default function CompanyPage() {
  return (
    <AppShell titleKey="pageTitle.company">
      <CompanyProfileView />
    </AppShell>
  );
}
