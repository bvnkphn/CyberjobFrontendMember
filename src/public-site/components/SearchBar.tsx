'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { WorkStyle } from '@cyberjob/shared';
import { PROVINCES, WORK_STYLES } from '@cyberjob/shared';
import { jobsService } from '@/public-site/services/jobs.service';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { BriefcaseIcon, ChevronDownIcon, MapPinIcon, SearchIcon } from './Icons';

export interface SearchValues {
  q: string;
  workStyle: WorkStyle[];
  province: string;
}

interface SearchBarProps {
  initial?: Partial<SearchValues>;
  /** ถ้าไม่ส่งมา จะพาไปหน้า /jobs พร้อม query string */
  onSearch?: (values: SearchValues) => void;
  variant?: 'hero' | 'compact';
}

/**
 * Feature 3.1 – ระบบค้นหางาน
 * ช่องค้นหาตำแหน่งงาน (มี Search Auto จับจากตัวอักษรแรก)
 * + รูปแบบงาน + จังหวัดของสถานประกอบการ + ปุ่มค้นหางาน
 */
export function SearchBar({
  initial,
  onSearch,
  variant = 'hero',
}: SearchBarProps) {
  const { t, label } = useI18n();
  const router = useRouter();

  const [q, setQ] = useState(initial?.q ?? '');
  const [workStyle, setWorkStyle] = useState<WorkStyle[]>(
    initial?.workStyle ?? [],
  );
  const [province, setProvince] = useState(initial?.province ?? '');

  useEffect(() => {
    setQ(initial?.q ?? '');
    setWorkStyle(initial?.workStyle ?? []);
    setProvince(initial?.province ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.q, initial?.province, initial?.workStyle?.join(',')]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const values: SearchValues = { q: q.trim(), workStyle, province };
    if (onSearch) {
      onSearch(values);
      return;
    }
    const params = new URLSearchParams();
    if (values.q) params.set('q', values.q);
    if (values.province) params.set('location', values.province);
    if (values.workStyle.length) params.set('workStyle', values.workStyle.join(','));
    router.push(`/jobs${params.toString() ? `?${params}` : ''}`);
  }

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={submit}
      className={`flex w-full flex-col gap-2 rounded-2xl bg-white p-2 md:flex-row md:items-center ${
        isHero ? 'shadow-pop' : 'border border-slate-200 shadow-card'
      }`}
    >
      <KeywordField value={q} onChange={setQ} onPick={(v) => setQ(v)} />

      <span className="hidden h-8 w-px bg-slate-200 md:block" />

      <WorkStyleField
        value={workStyle}
        onChange={setWorkStyle}
        labelText={t('filter.workStyle')}
        renderLabel={label}
      />

      <span className="hidden h-8 w-px bg-slate-200 md:block" />

      <div className="relative md:w-52">
        <MapPinIcon
          width={18}
          height={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <select
          aria-label={t('search.location')}
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="w-full appearance-none rounded-lg border-0 bg-transparent py-2.5 pl-9 pr-8 text-sm text-slate-700 outline-none focus:ring-0"
        >
          <option value="">{t('search.location')}</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          width={16}
          height={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      <button type="submit" className="btn-accent shrink-0 md:px-6">
        {t('search.submit')}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* ช่องคำค้น + Search Auto                                              */
/* ------------------------------------------------------------------ */

function KeywordField({
  value,
  onChange,
  onPick,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (v: string) => void;
}) {
  const { t } = useI18n();
  const [suggestions, setSuggestions] = useState<
    { type: 'title' | 'company' | 'skill'; value: string }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = value.trim();
    if (term.length < 1) {
      setSuggestions([]);
      return;
    }
    let alive = true;
    const timer = setTimeout(async () => {
      const list = await jobsService.suggest(term, 8);
      if (alive) {
        setSuggestions(list);
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

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      onPick(suggestions[highlight].value);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative flex-1">
      <SearchIcon
        width={18}
        height={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="hero-search-suggestions"
        aria-autocomplete="list"
        aria-label={t('search.keyword')}
        placeholder={t('search.keyword')}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        className="w-full rounded-lg border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:ring-0"
      />

      {open && suggestions.length > 0 && (
        <ul id="hero-search-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
          {suggestions.map((s, i) => (
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

/* ------------------------------------------------------------------ */
/* รูปแบบงาน (multi-select แบบ checkbox ตาม Figma)                      */
/* ------------------------------------------------------------------ */

function WorkStyleField({
  value,
  onChange,
  labelText,
  renderLabel,
}: {
  value: WorkStyle[];
  onChange: (v: WorkStyle[]) => void;
  labelText: string;
  renderLabel: (o: { labelTh: string; labelEn: string }) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = (v: WorkStyle) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  const summary =
    value.length === 0
      ? labelText
      : value
          .map((v) => {
            const o = WORK_STYLES.find((w) => w.value === v);
            return o ? renderLabel(o) : v;
          })
          .join(', ');

  return (
    <div ref={ref} className="relative md:w-48">
      <BriefcaseIcon
        width={18}
        height={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full truncate rounded-lg py-2.5 pl-9 pr-8 text-left text-sm text-slate-700 hover:bg-slate-50"
      >
        <span className={value.length ? '' : 'text-slate-400'}>{summary}</span>
      </button>
      <ChevronDownIcon
        width={16}
        height={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-pop">
          {WORK_STYLES.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
              />
              {renderLabel(opt)}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

