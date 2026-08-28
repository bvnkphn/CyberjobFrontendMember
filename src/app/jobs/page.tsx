import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JobListing } from "@/components/jobs/job-listing";

export default function JobsPage() {
  return (
    <div className="site-shell">
      <Header />
      <JobListing />
      <Footer />
    </div>
  );
}
