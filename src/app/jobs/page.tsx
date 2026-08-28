import { Suspense } from "react";
import { Footer } from "@/public-site/components/Footer";
import { Navbar } from "@/public-site/components/Navbar";
import { JobsExplorer } from "@/public-site/components/jobs/JobsExplorer";

export default function JobsPage() {
  return (
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<div className="container-page py-12 text-sm text-slate-500">กำลังโหลดงาน...</div>}>
              <JobsExplorer />
            </Suspense>
          </main>
          <Footer />
        </div>
  );
}
