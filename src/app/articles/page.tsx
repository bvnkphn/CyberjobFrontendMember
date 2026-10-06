'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { PageHeading } from '@/components/page-heading';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ClockIcon,
  FileTextIcon,
} from '@/public-site/components/Icons';
import {
  articlesService,
  type PaginatedArticles,
} from '@/public-site/services/articles.service';
import { articleCategories, type ArticleItem } from './article-data';
import './articles.css';

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span>กำลังโหลดข้อมูลบทความ...</span>
          </div>
        </div>
      }
    >
      <ArticlesContent />
    </Suspense>
  );
}

function ArticlesContent() {
  const { lang } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial states from URL query parameters
  const initialCategory = searchParams.get('category') || 'ทั้งหมด';
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<PaginatedArticles>({
    items: [],
    total: 0,
    page: initialPage,
    pageSize: 6,
    totalPages: 1,
    categories: articleCategories,
  });
  const [loading, setLoading] = useState(true);

  // Fetch articles from API
  const fetchArticles = useCallback(
    async (cat: string, p: number) => {
      setLoading(true);
      try {
        const res = await articlesService.search({
          category: cat,
          page: p,
          pageSize: 6,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to fetch articles from API:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sync state with API and update URL
  useEffect(() => {
    fetchArticles(activeCategory, page);

    const sp = new URLSearchParams();
    if (activeCategory && activeCategory !== 'ทั้งหมด') sp.set('category', activeCategory);
    if (page > 1) sp.set('page', String(page));

    const qs = sp.toString() ? `?${sp.toString()}` : '';
    router.replace(`/articles${qs}`, { scroll: false });
  }, [activeCategory, page, fetchArticles, router]);

  // Handle category change
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setPage(1);
  };

  // Handle page change (Pagination)
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= data.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="site-shell">
      <main className="articles-page member-page-container">
        {/* ส่วนหัวมาตรฐานเหมือนหน้าเกี่ยวกับเรา พร้อมปุ่มย้อนกลับ */}
        <PageHeading
          title={lang === 'en' ? 'Articles & Career Advice' : 'บทความและเคล็ดลับการทำงาน'}
          description={
            lang === 'en'
              ? 'Explore career trends, resume frameworks, interview techniques, and modern workplace skills.'
              : 'รวบรวมเทรนด์การทำงาน เทคนิคเขียนเรซูเม่ วิธีสัมภาษณ์งาน และทักษะดิจิทัลเพื่อพัฒนาตนเองและก้าวสู่ความสำเร็จ'
          }
          fallbackHref="/"
          className="articles-title"
          hideBack
        />

        {/* หมวดหมู่บทความ (Interactive Category Pills) */}
        <div className="mb-8 mt-2 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {articleCategories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-blue-200 ring-2 ring-brand-600/30'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-blue-50/50 hover:text-brand-700'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Content / Loading / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div className="aspect-[16/10] w-full rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
                <div className="mt-3 h-5 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((article) => (
              <ArticleCard key={article.slug} article={article} lang={lang} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="my-8 rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-brand-600">
              <FileTextIcon width={32} height={32} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-brand-900 sm:text-2xl">
              {lang === 'en' ? 'No Articles Published Yet' : 'ยังไม่มีบทความที่เผยแพร่ในขณะนี้'}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
              {lang === 'en'
                ? 'Stay tuned for upcoming articles, resume tips, and career advice.'
                : 'ติดตามบทความ สาระน่ารู้ และเคล็ดลับการทำงานได้ที่นี่เร็วๆ นี้'}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/jobs" className="btn-brand">
                {lang === 'en' ? 'Browse Available Jobs' : 'ค้นหาตำแหน่งงานแนะนำ'}
              </Link>
              <Link
                href="/profile/edit"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-brand-600"
              >
                {lang === 'en' ? 'Upload Resume' : 'ฝากประวัติไว้ล่วงหน้า'}
              </Link>
            </div>
          </div>
        )}

        {/* Real Pagination */}
        {data.totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-slate-200/80 pt-8 sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-500">
              แสดงหน้า <strong className="text-brand-900">{data.page}</strong> จากทั้งหมด{' '}
              <strong className="text-brand-900">{data.totalPages}</strong> หน้า
            </p>

            <nav aria-label="Pagination" className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page <= 1}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-brand-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700"
              >
                <ChevronLeftIcon width={14} height={14} />
                <span>ก่อนหน้า</span>
              </button>

              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === data.page;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-blue-200 ring-2 ring-brand-600/30'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-blue-50/50 hover:text-brand-600'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page >= data.totalPages}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-brand-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700"
              >
                <span>ถัดไป</span>
                <ChevronRightIcon width={14} height={14} />
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}

function ArticleCard({ article, lang }: { article: ArticleItem; lang: string }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-md">
      {/* Cover Image */}
      <Link href={`/articles/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-lg border border-slate-100 bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-sm">
            {lang === 'en' ? article.categoryEn : article.category}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{lang === 'en' ? article.dateEn : article.date}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon width={12} height={12} />
              {article.readMinutes} {lang === 'en' ? 'min' : 'นาที'}
            </span>
          </div>

          <Link href={`/articles/${article.slug}`}>
            <h3 className="mt-2.5 line-clamp-2 text-base font-bold leading-snug text-brand-900 transition-colors group-hover:text-brand-600 sm:text-lg">
              {lang === 'en' ? article.titleEn : article.title}
            </h3>
          </Link>

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
            {lang === 'en' ? article.excerptEn : article.excerpt}
          </p>
        </div>

        {/* Card Footer */}
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
  );
}
