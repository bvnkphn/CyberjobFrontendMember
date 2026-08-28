'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Company, Job } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { useBookmarks } from '@/public-site/lib/bookmarks';
import { CompanyLogo } from '@/public-site/components/CompanyLogo';
import { CoverBanner, GalleryTile, StaticMap } from '@/public-site/components/media/Media';
import { JobCarousel } from '@/public-site/components/jobs/JobCarousel';
import { JobResultCard } from '@/public-site/components/jobs/JobResultCard';
import {
  ChevronRightIcon,
  ShareIcon,
  VerifiedIcon,
} from '@/public-site/components/Icons';

interface Props {
  company: Company & { jobCount: number };
  jobs: Job[];
}

/** หน้าโปรไฟล์บริษัท */
export function CompanyProfileView({ company, jobs }: Props) {
  const { t } = useI18n();
  const bookmarks = useBookmarks();
  const [tab, setTab] = useState<'about' | 'jobs'>('about');

  return (
    <div className="bg-white">
      {/* ส่วนหัว */}
      <div className="container-page pt-6">
        <div className="relative">
          <CoverBanner
            seed={company.slug}
            src={company.coverImage}
            className="h-52 w-full rounded-xl object-cover sm:h-64"
          />
          <div className="absolute -bottom-6 left-6 rounded-xl bg-white p-2 shadow-card">
            <CompanyLogo company={company} size={56} />
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-brand-900 sm:text-2xl">
              {company.name}
              {company.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                  <VerifiedIcon width={13} height={13} />
                  {t('company.verified')}
                </span>
              )}
            </h1>
            <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {t('company.tagBusiness')}
            </span>
          </div>

          <button
            type="button"
            aria-label={t('job.share')}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            <ShareIcon width={18} height={18} />
          </button>
        </div>

        {/* แท็บ */}
        <div className="mt-5 flex gap-6 border-b border-slate-200">
          <TabButton
            active={tab === 'about'}
            onClick={() => setTab('about')}
            label={t('company.tabAbout')}
          />
          <TabButton
            active={tab === 'jobs'}
            onClick={() => setTab('jobs')}
            label={t('company.tabJobs')}
            badge={company.jobCount}
          />
        </div>
      </div>

      <div className="container-page py-8">
        {tab === 'about' ? (
          <AboutTab company={company} />
        ) : (
          <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobResultCard
                key={job.id}
                job={job}
                href={`/jobs/${job.slug}`}
                bookmarked={bookmarks.has(job.id)}
                onToggleBookmark={() => bookmarks.toggle(job.id)}
              />
            ))}
          </div>
        )}

        {/* งานของบริษัทนี้ */}
        {tab === 'about' && jobs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-brand-900">
              {t('company.jobsAt', { name: company.name })}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('company.jobsAtHint')}
            </p>

            {/* แถวเดียวแนวนอน กว้างเต็มระยะเดียวกับ cover ของโปรไฟล์ ล้นแล้วเลื่อนได้ */}
            <div className="mt-4">
              <JobCarousel jobs={jobs} />
            </div>

            <Link href="/jobs" className="btn-outline mt-4">
              {t('job.viewAll')}
              <ChevronRightIcon width={15} height={15} />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative -mb-px flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${
        active
          ? 'text-brand-700'
          : 'text-slate-500 hover:text-brand-600'
      }`}
    >
      {label}
      {typeof badge === 'number' && (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
          {badge}
        </span>
      )}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-600" />
      )}
    </button>
  );
}

function AboutTab({ company }: { company: Company }) {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-brand-900">{t('company.info')}</h2>

      <dl className="mt-5 space-y-4 text-sm">
        <Row label={t('company.website')}>{company.contact.website}</Row>
        <Row label={t('company.businessType')}>{company.businessType}</Row>
        <Row label={t('company.location')}>
          {company.province}
          {company.district ? `, ${company.district}` : ''}
        </Row>
        {company.employeeCount && (
          <Row label={t('company.employees')}>{company.employeeCount}</Row>
        )}
      </dl>

      <p className="mt-6 text-sm leading-relaxed text-slate-600">
        {company.about}
      </p>

      <h3 className="mt-8 text-base font-bold text-brand-900">
        {t('company.contactInfo')}
      </h3>
      <div className="mt-2 space-y-1 text-sm text-slate-600">
        <p>{company.legalName}</p>
        <p>
          {t('company.address')}: {company.contact.address}
        </p>
        <p>
          {t('company.phone')}: {company.contact.phone}
        </p>
        <p>
          {t('company.email')}: {company.contact.email}
        </p>
      </div>

      {/* แผนที่ */}
      <section className="mt-8 rounded-xl bg-slate-50 p-5">
        <h3 className="text-sm font-bold text-brand-900">
          {t('company.mapTitle')}
        </h3>
        <StaticMap className="mt-3 h-56 w-full rounded-lg" />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <GalleryTile
              key={i}
              seed={`${company.slug}-${i}`}
              src={company.gallery?.[i]}
              className="h-24 w-full rounded-lg"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_minmax(0,1fr)]">
      <dt className="font-semibold text-brand-900">{label}</dt>
      <dd className="text-slate-600">{children}</dd>
    </div>
  );
}

