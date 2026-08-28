'use client';

import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { ChevronLeftIcon, ChevronRightIcon } from '@/public-site/components/Icons';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Feature 3.3 – ปุ่มไปหน้าถัดไป กรณีงานที่ประกาศมีจำนวนมาก */
export function Pagination({ page, totalPages, onChange }: Props) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav
      aria-label="pagination"
      className="mt-5 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronLeftIcon width={16} height={16} />
        <span className="hidden sm:inline">{t('jobs.prev')}</span>
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${
              p === page
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <span className="hidden sm:inline">{t('jobs.next')}</span>
        <ChevronRightIcon width={16} height={16} />
      </button>
    </nav>
  );
}

function buildPageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const out: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) out.push('…');
  for (let i = start; i <= end; i += 1) out.push(i);
  if (end < total - 1) out.push('…');
  out.push(total);

  return out;
}

