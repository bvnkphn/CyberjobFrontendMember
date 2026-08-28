'use client';

import Link from 'next/link';
import type { Job } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { useBookmarks } from '@/public-site/lib/bookmarks';
import { ChevronLeftIcon, ChevronRightIcon } from '@/public-site/components/Icons';
import { JobDetailView } from './JobDetailView';
import { JobResultCard } from './JobResultCard';

/** หน้ารายละเอียดงานแบบเต็มหน้า พร้อมส่วน "งานที่แนะนำ" */
export function JobDetailPage({
  job,
  related,
}: {
  job: Job;
  related: Job[];
}) {
  const { t } = useI18n();
  const bookmarks = useBookmarks();

  return (
    <div className="bg-slate-50">
      <div className="container-page py-6">
        <Link
          href="/jobs"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
        >
          <ChevronLeftIcon width={16} height={16} />
          {t('job.backToJobs')}
        </Link>

        <div className="mx-auto max-w-4xl">
          <JobDetailView
            job={job}
            variant="page"
            bookmarked={bookmarks.has(job.id)}
            onToggleBookmark={() => bookmarks.toggle(job.id)}
          />

          {related.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-brand-900">
                {t('job.recommended')}
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {related.map((item) => (
                  <JobResultCard
                    key={item.id}
                    job={item}
                    href={`/jobs/${item.slug}`}
                    bookmarked={bookmarks.has(item.id)}
                    onToggleBookmark={() => bookmarks.toggle(item.id)}
                  />
                ))}
              </div>
              <Link href="/jobs" className="btn-outline mt-4">
                {t('job.viewAll')}
                <ChevronRightIcon width={15} height={15} />
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

