import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, articleCategories } from "../article-data";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  BriefcaseIcon,
  FileTextIcon,
} from "@/public-site/components/Icons";
import { ArticleShareBar } from "../ArticleShareBar";
import "../articles.css";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();

  const related = articles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="articles-shell min-h-screen bg-slate-50/50 pb-16">
      {/* Top Header / Breadcrumbs Bar */}
      <section className="border-b border-blue-100/70 bg-white py-6">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-brand-600 transition-colors">
                หน้าแรก
              </Link>
              <span>/</span>
              <Link href="/articles" className="hover:text-brand-600 transition-colors">
                บทความ
              </Link>
              <span>/</span>
              <span className="text-brand-700 font-semibold">{article.category}</span>
            </nav>

            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <ChevronLeftIcon width={14} height={14} />
              กลับไปหน้ารวมบทความ
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container-page py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Article Body (8 cols) */}
          <main className="lg:col-span-8">
            <article className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
              {/* Category & Date Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-brand-700 border border-blue-100">
                  {article.category}
                </span>
                <span>•</span>
                <span>{article.date}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <ClockIcon width={13} height={13} />
                  {article.readMinutes} นาทีอ่าน
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <EyeIcon width={13} height={13} />
                  {article.views.toLocaleString()} ครั้ง
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-4 text-2xl font-extrabold text-brand-900 sm:text-3xl lg:text-4xl leading-tight">
                {article.title}
              </h1>

              {/* Author Box */}
              <div className="mt-6 flex items-center justify-between border-y border-slate-100 py-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-sm">
                    {article.author.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-brand-900">{article.author.name}</p>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        ทีมงานทางการ
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{article.author.role}</p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="relative mt-8 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image}
                  alt={article.title}
                  className="max-h-[460px] w-full object-cover"
                />
              </div>

              {/* Article Content */}
              <div className="article-rich-content mt-8">
                {/* Intro */}
                <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed bg-blue-50/40 p-4 sm:p-5 rounded-2xl border border-blue-100/60 mb-8">
                  {article.content.intro}
                </p>

                {/* Sections */}
                {article.content.sections.map((section, idx) => (
                  <section key={idx} className="mb-8">
                    <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-brand-900 border-l-4 border-brand-600 pl-3">
                      {section.heading}
                    </h2>

                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="mt-3 text-slate-600 leading-relaxed text-sm sm:text-base">
                        {p}
                      </p>
                    ))}

                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="mt-4 space-y-2 rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                        {section.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm sm:text-base text-slate-700">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.callout && (
                      <div className="mt-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/60 p-4 text-xs sm:text-sm text-amber-900 leading-relaxed">
                        <strong className="block font-bold mb-1">💡 ข้อแนะนำเพิ่มเติม:</strong>
                        {section.callout}
                      </div>
                    )}
                  </section>
                ))}

                {/* Conclusion */}
                {article.content.conclusion && (
                  <div className="mt-10 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
                    <h3 className="text-base font-bold text-brand-900 mb-2">บทสรุปและก้าวต่อไป</h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {article.content.conclusion}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6">
                <span className="text-xs font-semibold text-slate-400 mr-1">แท็ก:</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/articles`}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-brand-600 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Share Bar */}
              <div className="mt-8">
                <ArticleShareBar title={article.title} />
              </div>
            </article>

            {/* Author Card Box */}
            <div className="mt-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-md">
                  {article.author.avatar}
                </div>
                <div>
                  <h4 className="text-base font-bold text-brand-900">{article.author.name}</h4>
                  <p className="text-xs text-brand-600 font-semibold">{article.author.role}</p>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    ทีมงานกองบรรณาธิการ CyberJob มุ่งมั่นคัดสรรเนื้อหา บทวิเคราะห์ตลาดแรงงาน และเทคนิคการทำงานที่มีคุณภาพ เพื่อสนับสนุนคนทำงานทุกระดับสู่ความสำเร็จในสายอาชีพ
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Right Column: Sidebar (4 cols) */}
          <aside className="space-y-6 lg:col-span-4">
            {/* CyberJob Career Action Card */}
            <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6 sm:p-7 text-white shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm mb-4">
                <BriefcaseIcon width={24} height={24} />
              </div>
              <h3 className="text-lg font-bold text-white">กำลังมองหางานที่ใช่?</h3>
              <p className="mt-2 text-xs text-blue-100/90 leading-relaxed">
                CyberJob รวมตำแหน่งงานคุณภาพจากบริษัทชั้นนำ สมัครฟรี พร้อมระบบจับคู่ตำแหน่งงานที่ตรงกับทักษะของคุณ
              </p>
              <div className="mt-5 space-y-2.5">
                <Link
                  href="/jobs"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold text-brand-900 shadow-sm transition hover:bg-blue-50"
                >
                  ค้นหาตำแหน่งงานทันที
                  <ChevronRightIcon width={14} height={14} />
                </Link>
                <Link
                  href="/profile/edit"
                  className="flex w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  ฝากเรซูเม่ฟรี
                </Link>
              </div>
            </div>

            {/* Recent / Recommended Articles */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-brand-900 border-b border-slate-100 pb-3">
                บทความแนะนำอื่นๆ
              </h3>
              <div className="mt-4 divide-y divide-slate-100">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/articles/${item.slug}`}
                    className="group flex gap-3.5 py-3.5 first:pt-0 last:pb-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-20 shrink-0 rounded-xl object-cover transition group-hover:opacity-90"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="mt-0.5 text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-400">{item.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories Widget */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-brand-900 border-b border-slate-100 pb-3">
                หมวดหมู่บทความ
              </h3>
              <div className="mt-3 space-y-1">
                {articleCategories
                  .filter((cat) => cat !== "ทั้งหมด")
                  .map((category) => {
                    const count = articles.filter((a) => a.category === category).length;
                    return (
                      <Link
                        key={category}
                        href="/articles"
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50/70 hover:text-brand-700 transition"
                      >
                        <span>{category}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 font-semibold">
                          {count}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Related Articles Section */}
        <section className="mt-16 border-t border-slate-200/80 pt-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-900">บทความที่เกี่ยวข้อง</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                เสริมความรู้และพัฒนาศักยภาพด้วยเนื้อหาที่คัดสรรมาเพื่อคุณ
              </p>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              ดูทั้งหมด
              <ChevronRightIcon width={16} height={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <article
                key={item.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
              >
                <Link href={`/articles/${item.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-sm border border-slate-100">
                      {item.category}
                    </span>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon width={12} height={12} />
                        {item.readMinutes} นาที
                      </span>
                    </div>

                    <Link href={`/articles/${item.slug}`}>
                      <h3 className="mt-2.5 text-base font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span className="font-semibold text-slate-600">{item.author.name}</span>
                    <Link
                      href={`/articles/${item.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-brand-600 group-hover:text-brand-700"
                    >
                      อ่านต่อ
                      <ChevronRightIcon width={14} height={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
