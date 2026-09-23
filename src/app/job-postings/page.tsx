import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import JobPostingsView from "@/components/job-postings/JobPostingsView";

export default function JobPostingsPage() {
  return (
    <AppShell titleKey="pageTitle.jobPostings">
      {/* อ่าน ?job= จาก URL จึงต้องอยู่ใน Suspense */}
      <Suspense fallback={null}>
        <JobPostingsView />
      </Suspense>
    </AppShell>
  );
}
