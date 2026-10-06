import { PageHeading } from "@/components/page-heading";

export function ProfilePageHeading({
  title,
  description,
  fallbackHref = "/profile",
  hideBack = false,
}: {
  title: string;
  description?: string;
  fallbackHref?: string;
  hideBack?: boolean;
}) {
  return <PageHeading title={title} description={description} fallbackHref={fallbackHref} className="profile-page-heading" hideBack={hideBack} />;
}
