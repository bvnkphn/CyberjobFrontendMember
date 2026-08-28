'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Job } from '@cyberjob/shared';
import { useBookmarks } from '@/public-site/lib/bookmarks';
import { ChevronLeftIcon, ChevronRightIcon } from '@/public-site/components/Icons';
import { JobResultCard } from './JobResultCard';

/**
 * แถวการ์ดงานแนวนอน – ไม่กว้างเกินคอนเทนต์ด้านบน
 * ถ้าการ์ดล้นออกนอกกรอบจะเลื่อนแนวนอนได้ พร้อมปุ่มลูกศรบนจอใหญ่
 */
export function JobCarousel({ jobs }: { jobs: Job[] }) {
  const bookmarks = useBookmarks();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, jobs.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: 'smooth' });
  };

  if (!jobs.length) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="scroll-slim flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
      >
        {jobs.map((job) => (
          <div
            key={job.id}
            // shrink-0 กันไม่ให้บีบจนอ่านไม่ออก, grow ให้ยืดเต็มแถวเมื่อการ์ดมีน้อย
            className="w-[290px] shrink-0 grow snap-start sm:w-[300px] sm:max-w-[380px]"
          >
            <JobResultCard
              job={job}
              href={`/jobs/${job.slug}`}
              bookmarked={bookmarks.has(job.id)}
              onToggleBookmark={() => bookmarks.toggle(job.id)}
            />
          </div>
        ))}
      </div>

      {canPrev && (
        <ArrowButton side="left" onClick={() => scrollBy(-1)} />
      )}
      {canNext && (
        <ArrowButton side="right" onClick={() => scrollBy(1)} />
      )}
    </div>
  );
}

function ArrowButton({
  side,
  onClick,
}: {
  side: 'left' | 'right';
  onClick: () => void;
}) {
  const Icon = side === 'left' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'previous' : 'next'}
      className={`absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-card transition-colors hover:border-brand-300 hover:text-brand-600 md:flex ${
        side === 'left' ? '-left-4' : '-right-4'
      }`}
    >
      <Icon width={18} height={18} />
    </button>
  );
}

