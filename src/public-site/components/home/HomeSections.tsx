'use client';

import Link from 'next/link';
import type { Job } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { ARTICLES } from '@/public-site/lib/articles';
import { JobCard } from '@/public-site/components/JobCard';
import { SearchBar } from '@/public-site/components/SearchBar';
import {
  HeroPattern,
  ResumeIllustration,
  TeamIllustration,
} from '@/public-site/components/Illustrations';
import { BriefcaseIcon, ChevronRightIcon } from '@/public-site/components/Icons';

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
  const { t } = useI18n();

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
  const { t, lang } = useI18n();

  return (
    <section className="bg-white">
      <div className="container-page py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl text-brand-900">
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

        {jobs.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-brand-600 shadow-sm">
              <BriefcaseIcon width={28} height={28} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand-900 sm:text-xl">
              {lang === 'en' ? 'Upcoming Featured Job Openings' : 'กำลังรวบรวมตำแหน่งงานแนะนำเร็วๆ นี้'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
              {lang === 'en'
                ? 'We are currently connecting and curating job openings from leading organizations. Stay tuned!'
                : 'ระบบกำลังเชื่อมโยงและคัดสรรตำแหน่งงานคุณภาพจากองค์กรชั้นนำ เพื่อให้คุณได้พบกับโอกาสที่ดีที่สุด'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/jobs" className="btn-brand">
                {lang === 'en' ? 'Explore all jobs' : 'ค้นหาตำแหน่งงานทั้งหมด'}
                <ChevronRightIcon width={16} height={16} />
              </Link>
              <Link href="/profile/edit" className="btn-outline">
                {lang === 'en' ? 'Upload resume' : 'ฝากประวัติไว้ล่วงหน้า'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 6. บทความและเคล็ดลับการทำงาน                                       */
/* ---------------------------------------------------------------- */

import { useEffect, useState } from 'react';
import { articlesService } from '@/public-site/services/articles.service';
import type { ArticleItem } from '@/app/articles/article-data';
import { ClockIcon, FileTextIcon } from '@/public-site/components/Icons';

export function ArticlesSection() {
  const { t, lang } = useI18n();
  const [articlesList, setArticlesList] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesService
      .latest(3)
      .then((items) => {
        setArticlesList(items);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="border-t border-slate-200/60 bg-slate-50/70 py-16">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl text-brand-900">
              {t('articles.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t('articles.subtitle')}</p>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {lang === 'en' ? 'View all articles' : 'ดูบทความทั้งหมด'}
            <ChevronRightIcon width={16} height={16} />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="aspect-[16/10] w-full rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 w-20 rounded bg-slate-200" />
                <div className="mt-3 h-5 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : articlesList.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articlesList.map((article) => (
              <article
                key={article.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
              >
                <Link href={`/articles/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-sm border border-slate-100">
                      {lang === 'en' ? article.categoryEn : article.category}
                    </span>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{lang === 'en' ? article.dateEn : article.date}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon width={12} height={12} />
                        {article.readMinutes} {lang === 'en' ? 'min' : 'นาที'}
                      </span>
                    </div>

                    <Link href={`/articles/${article.slug}`}>
                      <h3 className="mt-2.5 text-base sm:text-lg font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {lang === 'en' ? article.titleEn : article.title}
                      </h3>
                    </Link>

                    <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {lang === 'en' ? article.excerptEn : article.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span className="font-semibold text-slate-600">
                      {lang === 'en' ? article.author.nameEn : article.author.name}
                    </span>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-brand-600 group-hover:text-brand-700"
                    >
                      {lang === 'en' ? 'Read' : 'อ่านต่อ'}
                      <ChevronRightIcon width={14} height={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-brand-600 shadow-sm">
              <FileTextIcon width={28} height={28} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand-900 sm:text-xl">
              {lang === 'en' ? 'Upcoming Career Articles & Advice' : 'กำลังรวบรวมบทความและสาระน่ารู้เร็วๆ นี้'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
              {lang === 'en'
                ? 'We are preparing high-quality career advice, resume guides, and workplace trends. Stay tuned!'
                : 'ระบบกำลังเชื่อมโยงและคัดสรรเนื้อหาคุณภาพ เคล็ดลับการทำงาน และการพัฒนาตนเอง เพื่อให้คุณก้าวหน้าในอาชีพ'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/articles" className="btn-brand">
                {lang === 'en' ? 'Explore all articles' : 'ดูบทความทั้งหมด'}
                <ChevronRightIcon width={16} height={16} />
              </Link>
              <Link href="/jobs" className="btn-outline">
                {lang === 'en' ? 'Explore jobs' : 'ค้นหาตำแหน่งงาน'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

