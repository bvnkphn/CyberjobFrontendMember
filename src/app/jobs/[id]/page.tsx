import { notFound } from "next/navigation";
import { JobDetailPage as LatestJobDetailPage } from "@/public-site/components/jobs/JobDetailPage";
import { jobsService } from "@/public-site/services/jobs.service";

export default async function JobDescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, related] = await Promise.all([
    jobsService.findOne(id),
    jobsService.related(id, 2),
  ]);

  if (!job) notFound();
  return <LatestJobDetailPage job={job} related={related} />;
}
