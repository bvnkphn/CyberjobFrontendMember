import { PageHeading } from "@/components/page-heading";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="container-page w-full py-12 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <PageHeading title={title} fallbackHref="/" />
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">{children}</div>
      </article>
    </main>
  );
}
