'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Job } from '@cyberjob/shared';
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_STYLES,
} from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { useAuth } from '@/public-site/auth/AuthProvider';
import { meService } from '@/public-site/services/auth.service';
import { ApiError } from '@/public-site/lib/api';
import { formatSalary, postedLabel } from '@/public-site/lib/format';
import { CompanyLogo } from '@/public-site/components/CompanyLogo';
import { CoverBanner } from '@/public-site/components/media/Media';
import {
  BookmarkIcon,
  BriefcaseIcon,
  CheckIcon,
  ClockIcon,
  CoinIcon,
  ExternalLinkIcon,
  MapPinIcon,
  SparkIcon,
  UsersIcon,
  VerifiedIcon,
} from '@/public-site/components/Icons';
import { CompanyProfileCard } from './CompanyProfileCard';

interface Props {
  job: Job;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  /** 'panel' = ฝั่งขวาของหน้าค้นหา, 'page' = หน้ารายละเอียดเต็ม */
  variant?: 'panel' | 'page';
}

/** รายละเอียดงานเต็มพร้อมปุ่มสมัคร (Feature 3.3 – ครึ่งขวา) */
export function JobDetailView({
  job,
  bookmarked,
  onToggleBookmark,
  variant = 'panel',
}: Props) {
  const { t, label } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  /** ยังไม่ล็อกอิน → พาไปหน้าเข้าสู่ระบบก่อน แล้วค่อยกลับมา */
  async function handleApply() {
    if (!user) {
      router.push(`/gate/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setApplyError(null);
    try {
      await meService.apply(job.id);
      setApplied(true);
    } catch (err) {
      // สมัครซ้ำก็ถือว่าสมัครแล้ว
      if (err instanceof ApiError && err.status === 409) setApplied(true);
      else setApplyError(err instanceof ApiError ? err.message : t('auth.failed'));
    }
  }

  const employment = EMPLOYMENT_TYPES.find((e) => e.value === job.employmentType);
  const style = WORK_STYLES.find((w) => w.value === job.workStyle);
  const experience = EXPERIENCE_LEVELS.find(
    (e) => e.value === job.experienceLevel,
  );

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <CoverBanner
        seed={job.company.slug}
        src={job.coverImage ?? job.company.coverImage}
        className={`w-full ${variant === 'page' ? 'h-56' : 'h-40'}`}
      />

      <div className={variant === 'page' ? 'p-6 sm:p-8' : 'p-5'}>
        <CompanyLogo company={job.company} size={40} />

        <h1
          className={`mt-3 font-bold leading-snug text-brand-900 ${
            variant === 'page' ? 'text-2xl' : 'text-lg'
          }`}
        >
          {job.title}
        </h1>

        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
          <span>{job.company.name}</span>
          {job.company.verified && <VerifiedIcon width={14} height={14} />}
          <Link
            href={`/companies/${job.company.slug}`}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:underline"
          >
            {t('job.viewDetail')}
            <ExternalLinkIcon width={13} height={13} />
          </Link>
        </p>

        {/* ข้อมูลสรุปของประกาศ */}
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-[13px] text-slate-600 sm:grid-cols-2">
          <Meta icon={<MapPinIcon width={15} height={15} />}>
            {job.province}
            {style ? ` (${label(style)})` : ''}
          </Meta>
          {employment && (
            <Meta icon={<BriefcaseIcon width={15} height={15} />}>
              {label(employment)}
            </Meta>
          )}
          {experience && (
            <Meta icon={<ClockIcon width={15} height={15} />}>
              {label(experience)}
            </Meta>
          )}
          <Meta icon={<CoinIcon width={15} height={15} />}>
            {formatSalary(job, t('job.negotiable'))}
            {!job.salaryNegotiable && ` ${t('job.perMonth')}`}
          </Meta>
          <Meta icon={<UsersIcon width={15} height={15} />}>
            {t('job.openings', { n: job.openings })}
          </Meta>
        </dl>

        <p className="mt-3 text-[12px] text-slate-400">
          {t('job.postedOn')} {postedLabel(job.postedAt, t)}
        </p>

        {/* ปุ่มสมัคร / บันทึก */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleApply}
            disabled={applied}
            className="btn-brand min-w-[120px]"
          >
            {applied ? (
              <>
                <CheckIcon width={16} height={16} />
                {t('job.applied')}
              </>
            ) : (
              t('job.apply')
            )}
          </button>
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-pressed={bookmarked}
            className="btn-outline min-w-[110px]"
          >
            <BookmarkIcon width={16} height={16} filled={bookmarked} />
            {bookmarked ? t('job.saved') : t('job.save')}
          </button>
        </div>

        {applyError && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {applyError}
          </p>
        )}

        {/* เนื้อหาประกาศ */}
        <Section title={t('job.description')}>
          <p className="text-[13px] leading-relaxed text-slate-600">
            {job.description}
          </p>
        </Section>

        <Section title={t('job.requirement')}>
          <Bullets items={job.requirements} />
        </Section>

        <Section title={t('job.additional')}>
          <Bullets items={job.additionalQualifications} />
        </Section>

        <Section title={t('job.skills')}>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span key={skill} className="chip bg-brand-50 text-brand-700">
                <SparkIcon width={13} height={13} />
                {skill}
              </span>
            ))}
          </div>
        </Section>

        <Section title={t('job.employerAnswers')}>
          <p className="mb-2 text-[13px] text-slate-500">
            {t('job.employerAnswersHint')}
          </p>
          <Bullets items={job.employerAnswers} />
        </Section>

        <Section title={t('job.benefits')}>
          <Bullets items={job.benefits} />
        </Section>

        <Section title={t('job.companyProfile')} last>
          <CompanyProfileCard company={job.company} />
        </Section>
      </div>
    </article>
  );
}

function Meta({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-slate-400">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={last ? 'mt-6' : 'mt-6'}>
      <h2 className="mb-2 text-sm font-bold text-brand-900">{title}</h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 text-[13px] leading-relaxed text-slate-600"
        >
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
          {item}
        </li>
      ))}
    </ul>
  );
}
