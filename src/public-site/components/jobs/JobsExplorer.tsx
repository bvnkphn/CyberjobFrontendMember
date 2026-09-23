'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  ExperienceLevel,
  FilterMeta,
  Job,
  JobQuery,
  JobSort,
  PostedWithin,
  WorkStyle,
} from '@cyberjob/shared';
import { provincesOfRegion } from '@cyberjob/shared';
import { jobsService, metaService } from '@/public-site/services/jobs.service';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { useBookmarks } from '@/public-site/lib/bookmarks';
import { useHiddenJobs } from '@/public-site/lib/useHiddenJobs';
import { formatNumber } from '@/public-site/lib/format';
import { useDropdown } from '@/public-site/lib/useDropdown';
import { useMediaQuery } from '@/public-site/lib/useMediaQuery';
import { BriefcaseIcon, SortIcon } from '@/public-site/components/Icons';
import {
  EMPTY_SEARCH,
  JobSearchBand,
  type JobSearchState,
} from './JobSearchBand';
import { JobResultCard } from './JobResultCard';
import { JobDetailView } from './JobDetailView';
import { Pagination } from './Pagination';

const PAGE_SIZE = 8;

/**
 * หน้าค้นหางาน / ประกาศรับสมัคร (งานทั้งหมด)
 * Feature 3.1 (ค้นหา) + 3.2 (แยกหมวดหมู่) + 3.3 (รายการ + รายละเอียด + แบ่งหน้า)
 */
export function JobsExplorer() {
  const { t, label } = useI18n();
  const router = useRouter();
  const params = useSearchParams();

  const [meta, setMeta] = useState<FilterMeta | null>(null);

  /** ค่าที่กำลังกรอกอยู่ในแถบค้นหา */
  const [draft, setDraft] = useState<JobSearchState>(() => readState(params));
  /** ค่าที่ยืนยันแล้ว (ใช้ยิง API) */
  const [applied, setApplied] = useState<JobSearchState>(() => readState(params));

  const [sort, setSort] = useState<JobSort>(
    (params.get('sort') as JobSort) ?? 'newest',
  );
  const [page, setPage] = useState(Number(params.get('page') ?? 1));
  const [selectedId, setSelectedId] = useState<string | null>(params.get('job'));

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  /**
   * ต่ำกว่า xl ไม่มีคอลัมน์รายละเอียดข้าง ๆ รายการ
   * การเลือกงานจึงพาไปหน้ารายละเอียดเต็มแทนการกางต่อท้ายรายการ
   */
  const isCompact = useMediaQuery('(max-width: 1279.98px)');

  const bookmarks = useBookmarks();
  const { hiddenIds, hideJob, unhideJob, unhideAll, lastHidden, clearLastHidden } = useHiddenJobs();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    metaService.filters().then(setMeta);
  }, []);

  const query: JobQuery = useMemo(() => {
    const provinces = expandLocation(applied.location);
    return {
      q: applied.q || undefined,
      category: applied.category || undefined,
      province: provinces.length ? provinces : undefined,
      workStyle: applied.workStyle.length ? applied.workStyle : undefined,
      experience: applied.experience.length ? applied.experience : undefined,
      salaryMin: applied.salaryMin === '' ? undefined : applied.salaryMin,
      salaryMax: applied.salaryMax === '' ? undefined : applied.salaryMax,
      postedWithin: applied.postedWithin,
      sort,
      page,
      pageSize: PAGE_SIZE,
    };
  }, [applied, sort, page]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    jobsService.search(query).then((res) => {
      if (!alive) return;
      setJobs(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setLoading(false);
      setSelectedId((current) =>
        current && res.items.some((j) => j.id === current)
          ? current
          : (res.items[0]?.id ?? null),
      );
    });
    return () => {
      alive = false;
    };
  }, [query]);

  // sync เงื่อนไขขึ้น URL เพื่อให้แชร์ลิงก์ได้
  useEffect(() => {
    const sp = new URLSearchParams();
    if (applied.q) sp.set('q', applied.q);
    if (applied.category) sp.set('category', applied.category);
    if (applied.location) sp.set('location', applied.location);
    if (applied.salaryMin !== '') sp.set('salaryMin', String(applied.salaryMin));
    if (applied.salaryMax !== '') sp.set('salaryMax', String(applied.salaryMax));
    if (applied.workStyle.length) sp.set('workStyle', applied.workStyle.join(','));
    if (applied.experience.length)
      sp.set('experience', applied.experience.join(','));
    if (applied.postedWithin !== 'all')
      sp.set('postedWithin', applied.postedWithin);
    if (sort !== 'newest') sp.set('sort', sort);
    if (page > 1) sp.set('page', String(page));
    if (selectedId) sp.set('job', selectedId);

    router.replace(`/jobs${sp.toString() ? `?${sp}` : ''}`, { scroll: false });
  }, [applied, sort, page, selectedId, router]);

  /** ตัวกรอง (pill) มีผลทันที ส่วนคำค้น/สาขา/สถานที่ รอกดปุ่มค้นหา */
  const handleDraftChange = useCallback(
    (next: JobSearchState) => {
      setDraft(next);
      const instant =
        next.salaryMin !== draft.salaryMin ||
        next.salaryMax !== draft.salaryMax ||
        next.workStyle !== draft.workStyle ||
        next.experience !== draft.experience ||
        next.postedWithin !== draft.postedWithin;
      if (instant) {
        setApplied(next);
        setPage(1);
      }
    },
    [draft],
  );

  const submit = useCallback(() => {
    setApplied(draft);
    setPage(1);
  }, [draft]);

  const reset = useCallback(() => {
    setDraft(EMPTY_SEARCH);
    setApplied(EMPTY_SEARCH);
    setPage(1);
  }, []);

  const visibleJobs = useMemo(() => jobs.filter((j) => !hiddenIds.has(j.id)), [jobs, hiddenIds]);
  const selected = visibleJobs.find((j) => j.id === selectedId) ?? visibleJobs[0] ?? null;

  return (
    <div className="bg-white">
      <JobSearchBand
        meta={meta}
        value={draft}
        onChange={handleDraftChange}
        onSubmit={submit}
        onReset={reset}
      />

      <div className="container-page py-6">
        {/* จำนวนงาน + ปุ่มเรียงลำดับ */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-slate-600">
              {loading ? t('jobs.loading') : t('jobs.count', { n: formatNumber(Math.max(0, total - hiddenIds.size)) })}
            </p>
            {hiddenIds.size > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                มุดไว้ {hiddenIds.size} งาน
                <button
                  type="button"
                  onClick={unhideAll}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  (ยกเลิกทั้งหมด)
                </button>
              </span>
            )}
          </div>
          <SortMenu
            sorts={meta?.sorts ?? []}
            value={sort}
            renderLabel={label}
            onChange={(v) => {
              setSort(v);
              setPage(1);
            }}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,390px)_minmax(0,1fr)]">
          {/* ครึ่งซ้าย – ประกาศงานโดยย่อ */}
          <div ref={listRef} className="space-y-3">
            {loading && visibleJobs.length === 0 && <ListSkeleton />}

            {!loading && visibleJobs.length === 0 && (
              <div className="rounded-xl border border-slate-200 p-10 text-center">
                <p className="font-semibold text-brand-900">{t('jobs.empty')}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {hiddenIds.size > 0 ? 'คุณได้มุดงานทั้งหมดในหน้านี้ไว้' : t('jobs.emptyHint')}
                </p>
                {hiddenIds.size > 0 ? (
                  <button type="button" onClick={unhideAll} className="btn-outline mt-4">
                    ยกเลิกการมุดทั้งหมด
                  </button>
                ) : (
                  <button type="button" onClick={reset} className="btn-outline mt-4">
                    {t('filter.reset')}
                  </button>
                )}
              </div>
            )}

            {visibleJobs.map((job) => (
              <JobResultCard
                key={job.id}
                job={job}
                selected={!isCompact && job.id === selectedId}
                bookmarked={bookmarks.has(job.id)}
                {...(isCompact
                  ? { href: `/jobs/${job.id}` }
                  : { onSelect: () => setSelectedId(job.id) })}
                onToggleBookmark={() => bookmarks.toggle(job.id)}
                onHide={() => hideJob(job.id, job.title)}
              />
            ))}

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => {
                setPage(p);
                listRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            />
          </div>

          {/* ครึ่งขวา – รายละเอียดงานเต็ม */}
          <div className="hidden xl:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scroll-slim">
              {selected ? (
                <JobDetailView
                  job={selected}
                  bookmarked={bookmarks.has(selected.id)}
                  onToggleBookmark={() => bookmarks.toggle(selected.id)}
                />
              ) : (
                <div className="flex h-[520px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 text-center text-slate-400">
                  <BriefcaseIcon width={40} height={40} />
                  <p className="text-sm">{t('jobs.selectPrompt')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {lastHidden && (
        <aside aria-label="แจ้งเตือนการมุดงาน" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900/95 px-5 py-3.5 text-sm text-white shadow-2xl backdrop-blur">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            มุดงาน &ldquo;<strong className="max-w-[200px] truncate inline-block align-bottom">{lastHidden.title}</strong>&rdquo; เรียบร้อยแล้ว
          </span>
          <button
            type="button"
            onClick={() => unhideJob(lastHidden.id)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-sm"
          >
            เลิกทำ (Undo)
          </button>
          <button
            type="button"
            onClick={clearLastHidden}
            aria-label="ปิดการแจ้งเตือน"
            className="ml-1 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </aside>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* เมนูเรียงลำดับ                                                       */
/* ------------------------------------------------------------------ */

function SortMenu({
  sorts,
  value,
  onChange,
  renderLabel,
}: {
  sorts: { value: JobSort; labelTh: string; labelEn: string }[];
  value: JobSort;
  onChange: (v: JobSort) => void;
  renderLabel: (o: { labelTh: string; labelEn: string }) => string;
}) {
  const { t } = useI18n();
  const { open, toggle, setOpen, ref } = useDropdown();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={t('jobs.sort')}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-600"
      >
        <SortIcon width={18} height={18} />
      </button>

      {open && (
        <ul className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
          {sorts.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-left text-sm ${
                  opt.value === value
                    ? 'bg-brand-50 font-semibold text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {renderLabel(opt)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-slate-200 p-4"
        >
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* helper                                                              */
/* ------------------------------------------------------------------ */

/** ถ้าเลือกเป็น "ภาค" ให้ขยายเป็นรายชื่อจังหวัดในภาคนั้น */
function expandLocation(location: string): string[] {
  if (!location) return [];
  const provinces = provincesOfRegion(location);
  return provinces.length ? provinces : [location];
}

interface ParamReader {
  get(key: string): string | null;
}

function readState(params: ParamReader): JobSearchState {
  const split = <T extends string>(raw: string | null): T[] =>
    raw ? (raw.split(',').map((s) => s.trim()).filter(Boolean) as T[]) : [];
  const num = (raw: string | null): number | '' => {
    if (!raw) return '';
    const n = Number(raw);
    return Number.isFinite(n) ? n : '';
  };

  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    location: params.get('location') ?? params.get('province') ?? '',
    salaryMin: num(params.get('salaryMin')),
    salaryMax: num(params.get('salaryMax')),
    workStyle: split<WorkStyle>(params.get('workStyle')),
    experience: split<ExperienceLevel>(params.get('experience')),
    postedWithin: (params.get('postedWithin') as PostedWithin) ?? 'all',
  };
}

