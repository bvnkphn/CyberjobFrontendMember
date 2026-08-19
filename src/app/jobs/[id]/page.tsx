import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JobDescription } from "@/components/jobs/job-description";

export default function JobDescriptionPage() {
  return <div className="job-site-shell"><Header /><JobDescription /><Footer /></div>;
}