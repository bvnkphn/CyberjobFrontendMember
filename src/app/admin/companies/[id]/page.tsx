import { CompanyVerificationDetailView } from "@/components/admin/companies/CompanyVerificationDetailView";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompanyVerificationDetailView id={id} />;
}
