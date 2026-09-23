import AppShell from "@/components/layout/AppShell";
import CreateJobPostingForm from "@/components/job-postings/CreateJobPostingForm";

export default function CreateJobPostingPage() {
  return (
    <AppShell titleKey="pageTitle.createJobPosting">
      <CreateJobPostingForm />
    </AppShell>
  );
}
