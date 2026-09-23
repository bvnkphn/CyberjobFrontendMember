import AppShell from "@/components/layout/AppShell";
import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <AppShell titleKey="pageTitle.settings">
      <SettingsView />
    </AppShell>
  );
}
