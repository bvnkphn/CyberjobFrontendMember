"use client";

import { formatDate, salaryRange } from "@/lib/format";
import { useLanguage, type LanguageKey } from "@/lib/i18n/LanguageContext";
import type { JobListItem, JobStatus } from "@/lib/types";
import styles from "./JobPostingCard.module.css";

interface JobPostingCardProps {
  posting: JobListItem;
  selected: boolean;
  onSelect: () => void;
}

export function statusLabel(status: JobStatus, t: (k: LanguageKey) => string) {
  switch (status) {
    case "published":
      return t("jobPostings.published");
    case "draft":
      return t("jobPostings.draft");
    default:
      return t("jobPostings.closed");
  }
}

const STATUS_STYLE: Record<JobStatus, { background: string; color: string }> = {
  published: { background: "#e4f6ee", color: "#146c47" },
  draft: { background: "var(--color-gray-100)", color: "var(--color-gray-600)" },
  closed: { background: "var(--color-danger-light)", color: "#b4232a" },
};

/** ข้อมูลในแต่ละรายการ (Feature 4.1.1.1) */
export default function JobPostingCard({ posting, selected, onSelect }: JobPostingCardProps) {
  const { t, isEn } = useLanguage();

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.cardSelected : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{posting.title}</h3>
        <span className={styles.badge} style={STATUS_STYLE[posting.status]}>
          {statusLabel(posting.status, t)}
        </span>
      </div>

      <div className={styles.company}>{posting.company.name}</div>

      <div className={styles.meta}>
        <span>{posting.company.businessType}</span>
        <span>
          {posting.salaryMin === 0 && posting.salaryMax === 0
            ? posting.employmentType === "internship"
              ? (isEn ? "ไม่มีเงินเดือน (ฝึกงาน)" : "ไม่มีเงินเดือน (ฝึกงาน)")
              : (isEn ? "Negotiable" : "ตามตกลง")
            : salaryRange(posting.salaryMin, posting.salaryMax, isEn)}
        </span>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerItem} title={isEn ? "Posted" : "วันที่ประกาศ"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatDate(posting.postedAt)}
        </span>
        <span className={styles.footerItem}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {posting.applicantCount} {t("jobPostings.applicants")}
        </span>
      </div>
    </button>
  );
}
