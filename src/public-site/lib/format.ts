import type { Job } from '@cyberjob/shared';

const nf = new Intl.NumberFormat('en-US');

/** เงินเดือนเป็น Range ต่ำสุด–สูงสุด (Feature 3.2) */
export function formatSalary(job: Job, negotiableLabel: string): string {
  if (job.salaryNegotiable || (!job.salaryMin && !job.salaryMax)) {
    return negotiableLabel;
  }
  if (job.salaryMin === job.salaryMax) return nf.format(job.salaryMin);
  return `${nf.format(job.salaryMin)}-${nf.format(job.salaryMax)}`;
}

export function formatNumber(value: number): string {
  return nf.format(value);
}

/** "ประกาศมากี่วัน" (Feature 3.3) – นับเป็นวันปฏิทิน */
export function daysSincePosted(iso: string): number {
  const posted = new Date(iso);
  const now = new Date();
  const a = Date.UTC(posted.getFullYear(), posted.getMonth(), posted.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

type PostedT = (
  key: 'job.today' | 'job.daysAgo',
  vars?: Record<string, number>,
) => string;

/** "วันนี้" หรือ "6 วันที่แล้ว" */
export function postedLabel(iso: string, t: PostedT): string {
  const days = daysSincePosted(iso);
  return days === 0 ? t('job.today') : t('job.daysAgo', { n: days });
}

