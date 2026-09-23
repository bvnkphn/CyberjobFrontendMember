import AppShell from "@/components/layout/AppShell";
import { InvitationsView } from "@/components/candidates/InvitationsView";

export default function InvitationsPage() {
  return (
    <AppShell titleKey="pageTitle.invitations">
      <InvitationsView />
    </AppShell>
  );
}
