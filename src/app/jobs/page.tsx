import { Suspense } from "react";
import { JobsExplorer } from "@/public-site/components/jobs/JobsExplorer";

export default function JobsPage() {
  return (
    <main className="flex-1">
      <Suspense fallback={<div className="container-page py-12 text-sm text-slate-500">กำลังโหลดงาน...</div>}>
        <JobsExplorer />
      </Suspense>
    </main>
  );
}
