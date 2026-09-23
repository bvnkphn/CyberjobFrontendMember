"use client";

import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import CreateJobPostingForm from "@/components/job-postings/CreateJobPostingForm";
import { ErrorState, Loading } from "@/components/ui/ui";
import { useApi } from "@/lib/owner";
import type { JobDetail } from "@/lib/types";

export default function EditJobPostingPage() {
  const params = useParams<{ id: string }>();
  const job = useApi<JobDetail>(params?.id ? `/owner/jobs/${params.id}` : null);

  return (
    <AppShell titleKey="pageTitle.editJobPosting">
      {job.loading && !job.data ? (
        <Loading />
      ) : job.error || !job.data ? (
        <ErrorState message={job.error?.message ?? ""} onRetry={job.reload} />
      ) : (
        <CreateJobPostingForm key={job.data.id} initialData={job.data} />
      )}
    </AppShell>
  );
}
