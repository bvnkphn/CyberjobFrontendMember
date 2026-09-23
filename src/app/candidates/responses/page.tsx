import AppShell from "@/components/layout/AppShell";
import { ApplicantResponsesView } from "@/components/candidates/ApplicantResponsesView";

export default function ApplicantResponsesPage() {
  return (
    <AppShell titleKey="pageTitle.responses">
      <ApplicantResponsesView />
    </AppShell>
  );
}
