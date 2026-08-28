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
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo variant="dark" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            {t('footer.tagline')}
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
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
        <div className="container-page flex flex-col items-center justify-between gap-3 py-4 text-xs text-white/60 sm:flex-row">
          <p>
            Copyright © {year} CYBERJOB Co.,Ltd | {t('footer.rights')}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
