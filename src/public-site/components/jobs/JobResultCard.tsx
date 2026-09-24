'use client';

import { useRouter } from 'next/navigation';
import type { Job } from '@cyberjob/shared';
import { WORK_STYLES } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { formatSalary, postedLabel } from '@/public-site/lib/format';
import { CompanyLogo } from '@/public-site/components/CompanyLogo';
import {
  BookmarkIcon,
  ClockIcon,
  MapPinIcon,
  VerifiedIcon,
} from '@/public-site/components/Icons';

interface Props {
  job: Job;
  selected?: boolean;
  bookmarked: boolean;
  onSelect?: () => void;
  /** ถ้าส่งมา การ์ดจะพาไปยังหน้านั้นเมื่อคลิก (ใช้แทน onSelect) */
  href?: string;
  onToggleBookmark: () => void;
  onHide?: () => void;
}

/**
 * การ์ดประกาศงานในรายการผลการค้นหา (Feature 3.3 – ครึ่งซ้าย)
 * แสดงโลโก้บริษัท ตำแหน่งที่เปิดรับ ชื่อบริษัท สถานที่ เงินเดือน และประกาศมากี่วัน
 */
export function JobResultCard({
  job,
  selected,
  bookmarked,
  onSelect,
  href,
  onToggleBookmark,
  onHide,
}: Props) {
  const { t, label } = useI18n();
  const router = useRouter();
  const style = WORK_STYLES.find((w) => w.value === job.workStyle);

  const activate = href ? () => router.push(href) : onSelect;

  return (
    <article
      role={activate ? 'button' : undefined}
      tabIndex={activate ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      onClick={activate}
      onKeyDown={(e) => {
        if (activate && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          activate();
        }
      }}
      className={`rounded-xl border bg-white p-4 transition-all ${
        activate ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-brand-500 shadow-card ring-1 ring-brand-200'
          : 'border-slate-200 hover:border-brand-300 hover:shadow-card'
      }`}
    >
      <div className="flex gap-3">
        <CompanyLogo company={job.company} size={40} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-brand-900">
            {job.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-slate-500">
            <span className="truncate">{job.company.name}</span>
            {job.company.verified && (
              <VerifiedIcon width={13} height={13} className="shrink-0" />
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-400">
            <MapPinIcon width={13} height={13} />
            {job.province}
            {style ? ` (${label(style)})` : ''}
          </p>
        </div>

        {job.isUrgent && (
          <span className="h-fit shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-500">
            {t('jobs.urgent')}
          </span>
        )}
      </div>

      <p className="mt-3 inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[13px] font-semibold text-slate-700">
        {formatSalary(job, t('job.negotiable'))}
        {!job.salaryNegotiable && ` ${t('job.perMonth')}`}
      </p>

      <p className="mt-3 text-[13px] font-medium text-slate-600">
        {job.company.legalName}
      </p>
      <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-slate-400">
        {job.company.about}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <ClockIcon width={13} height={13} />
          {postedLabel(job.postedAt, t)}
        </span>
        <div className="flex items-center gap-1.5">
          {onHide && (
            <button
              type="button"
              aria-label="ซ่อนประกาศนี้"
              title="ซ่อนประกาศนี้"
              onClick={(e) => {
                e.stopPropagation();
                onHide();
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <span className="text-[11px] font-medium">ซ่อน</span>
            </button>
          )}
          <button
            type="button"
            aria-label={bookmarked ? t('job.saved') : t('job.save')}
            aria-pressed={bookmarked}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={`rounded-lg p-1.5 transition-colors ${
              bookmarked
                ? 'text-accent-600 hover:bg-accent-50'
                : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
            }`}
          >
            <BookmarkIcon width={18} height={18} filled={bookmarked} />
          </button>
        </div>
      </div>
    </article>
  );
}

