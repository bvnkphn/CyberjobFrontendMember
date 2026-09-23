import AppShell from "@/components/layout/AppShell";
import { TutorialsView } from "@/components/support/TutorialsView";

export default function TutorialsPage() {
  return (
    <AppShell titleKey="pageTitle.tutorials">
      <TutorialsView />
    </AppShell>
  );
}
