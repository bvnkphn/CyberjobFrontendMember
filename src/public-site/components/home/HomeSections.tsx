'use client';

import Link from 'next/link';
import type { Job } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { ARTICLES } from '@/public-site/lib/articles';
import { JobCard } from '@/public-site/components/JobCard';
import { SearchBar } from '@/public-site/components/SearchBar';
import {
  ArticleThumb,
  HeroPattern,
  ResumeIllustration,
  TeamIllustration,
} from '@/public-site/components/Illustrations';
import { ChevronRightIcon } from '@/public-site/components/Icons';

/* ---------------------------------------------------------------- */
/* 1. Hero + ช่องค้นหางาน (Feature 3.1)                              */
/* ---------------------------------------------------------------- */

export function HeroSection() {
  const { t } = useI18n();

  return (
    // ไม่ใส่ overflow-hidden ที่ section เพราะจะไปตัด dropdown "รูปแบบงาน"
    // ให้ครอบเฉพาะภาพพื้นหลังแทน
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden">
        <HeroPattern className="h-full w-full" />
      </div>
      <div className="container-page relative py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[42px]">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 2. Resume Account Section                                         */
/* ---------------------------------------------------------------- */

export function ResumeAccountSection() {
  const { t } = useI18n();

  return (
    <section className="bg-brand-600 text-white">
      <div className="container-page grid items-center gap-10 py-14 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('resume.title')}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">
            {t('resume.body')}
          </p>
          <Link href="/profile/edit" className="btn-accent mt-6">
            {t('resume.cta')}
            <ChevronRightIcon width={16} height={16} />
          </Link>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <ResumeIllustration className="w-full" />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 3. About Us + บริษัทที่ไว้วางใจเรา                                  */
/* ---------------------------------------------------------------- */

export function AboutSection() {
  const { t, lang } = useI18n();

  return (
    <section className="bg-white">
      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2">
        <TeamIllustration className="w-full rounded-2xl" />
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{t('about.title')}</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {t('about.body')}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {t('about.body2')}
          </p>
        </div>
      </div>

      <div className="container-page pb-16">
        <h3 className="text-center text-lg font-bold sm:text-xl">
          {t('about.trusted')}
        </h3>
        <a
          href="https://cyberpay.asia/"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-6 flex max-w-md items-center justify-between gap-5 rounded-2xl border border-brand-100 bg-brand-50 px-6 py-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-pop"
          aria-label="CyberPay official website"
        >
          <span className="text-xl font-extrabold tracking-tight text-brand-900">
            CYBER<span className="text-accent-500">PAY</span>
          </span>
          <span className="text-right text-xs font-semibold text-slate-500 sm:text-sm">
            {lang === 'en' ? 'Official technology partner' : 'พันธมิตรด้านเทคโนโลยีอย่างเป็นทางการ'}
          </span>
        </a>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 4. แถบสำหรับผู้ประกอบการ                                          */
/* ---------------------------------------------------------------- */

export function EmployerCta() {
  const { t } = useI18n();

  return (
    <section className="bg-brand-100">
      <div className="container-page flex flex-col items-center gap-3 py-12 text-center">
        <h2 className="text-xl font-bold sm:text-2xl">{t('employer.title')}</h2>
        <p className="max-w-2xl text-sm text-slate-600">{t('employer.body')}</p>
        <Link href={process.env.NEXT_PUBLIC_OWNER_URL ?? 'http://localhost:3102/gate'} className="btn-brand mt-2">
          {t('employer.cta')}
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 5. ตำแหน่งงานแนะนำ                                                 */
/* ---------------------------------------------------------------- */

export function RecommendedJobs({ jobs }: { jobs: Job[] }) {
  const { t } = useI18n();

  return (
    <section className="bg-white">
      <div className="container-page py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t('recommended.title')}
          </h2>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {t('recommended.viewAll')}
            <ChevronRightIcon width={16} height={16} />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 6. บทความและเคล็ดลับการทำงาน                                       */
/* ---------------------------------------------------------------- */

export function ArticlesSection() {
  const { t, lang } = useI18n();

  return (
    <section className="bg-slate-50">
      <div className="container-page py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t('articles.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{t('articles.subtitle')}</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {ARTICLES.map((article, i) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="card group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-pop"
            >
              <ArticleThumb index={i} className="h-40 w-full object-cover" />
              <div className="p-5">
                <span className="chip bg-brand-50 text-brand-600">
                  {lang === 'en' ? article.tagEn : article.tagTh}
                </span>
                <h3 className="mt-3 text-base font-bold leading-snug text-brand-900 group-hover:text-brand-600">
                  {lang === 'en' ? article.titleEn : article.titleTh}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {lang === 'en' ? article.excerptEn : article.excerptTh}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  {t('articles.readMore')}
                  <ChevronRightIcon width={15} height={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
