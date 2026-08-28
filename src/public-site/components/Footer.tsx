'use client';

import Link from 'next/link';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import type { DictKey } from '@/public-site/i18n/dictionary';
import { Logo } from './Logo';

/** ลิงก์ตาม Feature 3.4 – มีทุกหน้า */
const COLUMNS: { title: DictKey; links: { key: DictKey; href: string }[] }[] = [
  {
    title: 'footer.jobseeker',
    links: [
      { key: 'footer.searchJobs', href: '/jobs' },
      { key: 'footer.profile', href: '/profile' },
      { key: 'footer.saved', href: '/my-jobs?tab=saved' },
      { key: 'footer.history', href: '/my-jobs?tab=applied' },
    ],
  },
  {
    title: 'footer.employer',
    links: [
      { key: 'footer.registerFree', href: process.env.NEXT_PUBLIC_OWNER_URL ?? '/contact' },
      { key: 'footer.postJob', href: process.env.NEXT_PUBLIC_OWNER_URL ?? '/contact' },
    ],
  },
  {
    title: 'footer.aboutCol',
    links: [{ key: 'footer.contactUs', href: '/contact' }],
  },
];

export function Footer() {
  const { t } = useI18n();
  const year = 2026;

  return (
    <footer className="bg-brand-900 text-white">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-9 py-10 sm:gap-x-10 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-10 md:py-12">
        <div className="col-span-2 border-b border-white/10 pb-7 md:col-span-1 md:border-0 md:pb-0">
          <Logo variant="dark" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            {t('footer.tagline')}
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="min-w-0 last:col-span-2 sm:last:col-span-1 md:last:col-span-1">
            <h3 className="mb-3 text-sm font-bold text-white">{t(col.title)}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-accent-400"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-stretch justify-between gap-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:py-4">
          <p className="text-center leading-relaxed sm:text-left">
            Copyright © {year} CYBERJOB Co.,Ltd | {t('footer.rights')}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 sm:justify-end sm:border-0 sm:pt-0">
            <li>
              <Link href="/terms" className="transition-colors hover:text-accent-400">
                {t('footer.terms')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-accent-400">
                {t('footer.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/security" className="transition-colors hover:text-accent-400">
                {t('footer.security')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
