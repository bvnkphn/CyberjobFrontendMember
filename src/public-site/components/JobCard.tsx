'use client';

import Link from 'next/link';
import type { Job } from '@cyberjob/shared';
import { EMPLOYMENT_TYPES } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { formatSalary } from '@/public-site/lib/format';
import { BriefcaseIcon, MapPinIcon } from './Icons';
import { CompanyLogo } from './CompanyLogo';

/** การ์ดตำแหน่งงานแนะนำบนหน้าแรก */
export function JobCard({ job }: { job: Job }) {
  const { t, label } = useI18n();
  const employment = EMPLOYMENT_TYPES.find(
    (e) => e.value === job.employmentType,
  );

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="card group flex h-full flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-pop"
    >
      <div className="flex items-start justify-between gap-3">
        <CompanyLogo company={job.company} size={44} />
        {job.isUrgent && (
          <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-500">
            {t('jobs.urgent')}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-bold text-brand-900 group-hover:text-brand-600">
          {job.title}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">{job.company.name}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPinIcon width={14} height={14} />
          {job.province}
        </span>
        <span className="inline-flex items-center gap-1">
          <BriefcaseIcon width={14} height={14} />
          {employment ? label(employment) : job.employmentType}
        </span>
      </div>

      <p className="mt-auto pt-1 text-sm font-bold text-brand-600">
        {formatSalary(job, t('job.negotiable'))}
      </p>
    </Link>
  );
}
