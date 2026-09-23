import AppShell from "@/components/layout/AppShell";
import { CompanyEditForm } from "@/components/company/CompanyEditForm";

export default function CompanyEditPage() {
  return (
    <AppShell titleKey="pageTitle.companyEdit">
      <CompanyEditForm />
    </AppShell>
  );
}
