import { PageHeading } from "@/components/page-heading";

export function ProfilePageHeading({ title, description, fallbackHref = "/profile" }: { title: string; description?: string; fallbackHref?: string }) {
  return <PageHeading title={title} description={description} fallbackHref={fallbackHref} className="profile-page-heading" />;
}
