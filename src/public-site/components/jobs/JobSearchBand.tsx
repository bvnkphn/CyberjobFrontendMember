'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ExperienceLevel,
  FilterMeta,
  PostedWithin,
  WorkStyle,
} from '@cyberjob/shared';
import { jobsService } from '@/public-site/services/jobs.service';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { formatNumber } from '@/public-site/lib/format';
import { BriefcaseIcon, MapPinIcon, SearchIcon } from '@/public-site/components/Icons';
import { CheckRow, FilterPill } from './FilterPill';
import { TreeSelect } from './TreeSelect';

/** เงื่อนไขทั้งหมดของหน้าค้นหางาน (Feature 3.1 + 3.2) */
export interface JobSearchState {
  q: string;
  /** สาขาอาชีพ – กลุ่มหรือสาขาย่อย ('' = ทั้งหมด) */
  category: string;
  /** สถานที่ทำงาน – ภาคหรือจังหวัด ('' = ทั้งหมด) */
  location: string;
  salaryMin: number | '';
  salaryMax: number | '';
  workStyle: WorkStyle[];
  experience: ExperienceLevel[];
  postedWithin: PostedWithin;
}

export const EMPTY_SEARCH: JobSearchState = {
  q: '',
  category: '',
  location: '',
  salaryMin: '',
  salaryMax: '',
  workStyle: [],
  experience: [],
  postedWithin: 'all',
};

interface Props {
  meta: FilterMeta | null;
  value: JobSearchState;
  onChange: (next: JobSearchState) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function JobSearchBand({
  meta,
  value,
  onChange,
  onSubmit,
  onReset,
}: Props) {
  const { t, label } = useI18n();

  const set = <K extends keyof JobSearchState>(
    key: K,
    v: JobSearchState[K],
  ) => onChange({ ...value, [key]: v });

  const toggleIn = <T extends string>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const salaryOptions = meta?.salary.options ?? [];

  const salarySummary =
    value.salaryMin === '' && value.salaryMax === ''
      ? ''
      : `${value.salaryMin === '' ? 0 : formatNumber(value.salaryMin)} - ${
          value.salaryMax === '' ? '∞' : formatNumber(value.salaryMax)
        }`;

  const workStyleSummary = value.workStyle
    .map((v) => {
      const o = meta?.workStyles.find((w) => w.value === v);
      return o ? label(o) : v;
    })
    .join(', ');

  const experienceSummary = value.experience
    .map((v) => {
      const o = meta?.experienceLevels.find((e) => e.value === v);
      return o ? label(o) : v;
    })
    .join(', ');

  const postedSummary =
    value.postedWithin === 'all'
      ? ''
      : label(
          meta?.postedWithin.find((p) => p.value === value.postedWithin) ?? {
            labelTh: '',
            labelEn: '',
          },
        );

  const hasFilters =
    value.category !== '' ||
    value.location !== '' ||
    value.salaryMin !== '' ||
    value.salaryMax !== '' ||
    value.workStyle.length > 0 ||
    value.experience.length > 0 ||
    value.postedWithin !== 'all';

  return (
    <section className="bg-brand-600">
      <div className="container-page py-5">
        {/* กล่องค้นหาหลัก */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-pop md:flex-row md:items-center"
        >
          <KeywordInput
            value={value.q}
            onChange={(v) => set('q', v)}
            onPick={(v) => {
              onChange({ ...value, q: v });
              onSubmit();
            }}
          />

          <span className="hidden h-8 w-px bg-slate-200 md:block" />

          <TreeSelect
            icon={<BriefcaseIcon width={17} height={17} />}
            placeholder={t('search.category')}
            allLabel={t('search.allCategories')}
            searchPlaceholder={t('search.findCategory')}
            nodes={meta?.categoryTree ?? []}
            value={value.category}
            onChange={(v) => set('category', v)}
          />

          <span className="hidden h-8 w-px bg-slate-200 md:block" />

          <TreeSelect
            icon={<MapPinIcon width={17} height={17} />}
            placeholder={t('search.location')}
            allLabel={t('search.allLocations')}
            searchPlaceholder={t('search.findLocation')}
            nodes={meta?.regionTree ?? []}
            value={value.location}
            onChange={(v) => set('location', v)}
          />

          <button type="submit" className="btn-accent shrink-0 md:px-6">
            {t('search.submit')}
          </button>
        </form>

        {/* แถวปุ่มตัวกรอง */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FilterPill
            label={t('filter.salary')}
            summary={salarySummary}
            active={value.salaryMin !== '' || value.salaryMax !== ''}
            panelWidth="w-[340px]"
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">
                  {t('filter.salaryMin')}
                </span>
                <select
                  className="field"
                  value={value.salaryMin}
                  onChange={(e) =>
                    set(
                      'salaryMin',
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                >
                  <option value="">—</option>
                  {salaryOptions.map((n) => (
                    <option key={n} value={n}>
                      {formatNumber(n)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">
                  {t('filter.salaryMax')}
                </span>
                <select
                  className="field"
                  value={value.salaryMax}
                  onChange={(e) =>
                    set(
                      'salaryMax',
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                >
                  <option value="">—</option>
                  {salaryOptions.map((n) => (
                    <option key={n} value={n}>
                      {formatNumber(n)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </FilterPill>

          <FilterPill
            label={t('filter.workStyle')}
            summary={workStyleSummary}
            active={value.workStyle.length > 0}
          >
            {(meta?.workStyles ?? []).map((opt) => (
              <CheckRow
                key={opt.value}
                label={label(opt)}
                checked={value.workStyle.includes(opt.value)}
                onChange={() =>
                  set('workStyle', toggleIn(value.workStyle, opt.value))
                }
              />
            ))}
          </FilterPill>

          <FilterPill
            label={t('filter.experience')}
            summary={experienceSummary}
            active={value.experience.length > 0}
          >
            {(meta?.experienceLevels ?? []).map((opt) => (
              <CheckRow
                key={opt.value}
                label={label(opt)}
                checked={value.experience.includes(opt.value)}
                onChange={() =>
                  set('experience', toggleIn(value.experience, opt.value))
                }
              />
            ))}
          </FilterPill>

          <FilterPill
            label={t('filter.postedWithin')}
            summary={postedSummary}
            active={value.postedWithin !== 'all'}
          >
            {(meta?.postedWithin ?? []).map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="postedWithin"
                  checked={value.postedWithin === opt.value}
                  onChange={() => set('postedWithin', opt.value)}
                  className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                {label(opt)}
              </label>
            ))}
          </FilterPill>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {t('filter.reset')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ช่องคำค้น + Search Auto (Feature 3.1)                                */
/* ------------------------------------------------------------------ */

function KeywordInput({
  value,
  onChange,
  onPick,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (v: string) => void;
}) {
  const { t } = useI18n();
  const [items, setItems] = useState<
    { type: 'title' | 'company' | 'skill'; value: string }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = value.trim();
    if (!term) {
      setItems([]);
      return;
    }
    let alive = true;
    const timer = setTimeout(async () => {
      const list = await jobsService.suggest(term, 8);
      if (alive) {
        setItems(list);
        setHighlight(-1);
      }
    }, 220);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const groupLabel = useMemo(
    () => ({
      title: t('search.suggestTitle'),
      company: t('search.suggestCompany'),
      skill: t('search.suggestSkill'),
    }),
    [t],
  );

  return (
    <div ref={boxRef} className="relative flex-1">
      <SearchIcon
        width={17}
        height={17}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="job-search-suggestions"
        aria-autocomplete="list"
        aria-label={t('search.keyword')}
        placeholder={t('search.keyword')}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => (h + 1) % items.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => (h <= 0 ? items.length - 1 : h - 1));
          } else if (e.key === 'Enter' && highlight >= 0) {
            e.preventDefault();
            onPick(items[highlight].value);
            setOpen(false);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className="w-full rounded-lg border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:ring-0"
      />

      {open && items.length > 0 && (
        <ul id="job-search-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-pop scroll-slim">
          {items.map((s, i) => (
            <li key={`${s.type}-${s.value}`}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => {
                  onPick(s.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm ${
                  i === highlight ? 'bg-brand-50' : 'hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <SearchIcon width={15} height={15} className="text-slate-400" />
                  {s.value}
                </span>
                <span className="text-[11px] text-slate-400">
                  {groupLabel[s.type]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

