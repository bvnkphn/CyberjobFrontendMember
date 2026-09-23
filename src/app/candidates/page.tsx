import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import { AllCandidatesView } from "@/components/candidates/AllCandidatesView";

export default function AllCandidatesPage() {
  return (
    <AppShell titleKey="pageTitle.allCandidates">
      {/* อ่าน ?source= และ ?q= จาก URL จึงต้องอยู่ใน Suspense */}
      <Suspense fallback={null}>
        <AllCandidatesView />
      </Suspense>
    </AppShell>
  );
}
