import { notFound } from "next/navigation";
import { CompanyProfileView } from "@/public-site/components/company/CompanyProfileView";
import { companiesService } from "@/public-site/services/jobs.service";

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [company, jobs] = await Promise.all([
    companiesService.findOne(slug),
    companiesService.jobs(slug, { pageSize: 8 }),
  ]);

  if (!company) notFound();
  return <CompanyProfileView company={company} jobs={jobs.items} />;
}
