'use client';

import Link from 'next/link';
import type { Company } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { CompanyLogo } from '@/public-site/components/CompanyLogo';
import {
  ChevronRightIcon,
  LinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  VerifiedIcon,
} from '@/public-site/components/Icons';

/** การ์ด "โปรไฟล์บริษัท" ท้ายรายละเอียดงาน */
export function CompanyProfileCard({ company }: { company: Company }) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-start gap-3">
        <CompanyLogo company={company} size={48} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-bold text-brand-900">
            <span className="truncate">{company.name}</span>
            {company.verified && <VerifiedIcon width={14} height={14} />}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500">
            <MailIcon width={14} height={14} className="text-slate-400" />
            {company.contact.email}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-500">
            <PhoneIcon width={14} height={14} className="text-slate-400" />
            {company.contact.phone}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-[13px] text-slate-500">
        <div className="flex gap-2">
          <dt className="shrink-0">{t('company.businessType')}:</dt>
          <dd className="text-slate-700">{company.businessType}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">{t('company.website')}:</dt>
          <dd className="flex items-center gap-1 text-slate-700">
            <LinkIcon width={13} height={13} className="text-slate-400" />
            {company.contact.website}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">{t('company.address')}:</dt>
          <dd className="flex gap-1 text-slate-700">
            <MapPinIcon
              width={13}
              height={13}
              className="mt-0.5 shrink-0 text-slate-400"
            />
            {company.contact.address}
          </dd>
        </div>
      </dl>

      <Link
        href={`/companies/${company.slug}`}
        className="btn-outline mt-4 w-full justify-center text-[13px]"
      >
        {t('job.viewAllCompanyJobs')}
        <ChevronRightIcon width={15} height={15} />
      </Link>
    </div>
  );
}

