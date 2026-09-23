"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState, Loading, Notice } from "@/components/ui/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useApi } from "@/lib/owner";
import type { JobList, JobStatus } from "@/lib/types";
import JobPostingCard from "./JobPostingCard";
import JobPostingDetail from "./JobPostingDetail";
import styles from "./JobPostingsView.module.css";

const FILTERS: Array<{ value: "all" | JobStatus; th: string; en: string }> = [
  { value: "all", th: "ทั้งหมด", en: "All" },
  { value: "published", th: "เผยแพร่", en: "Published" },
  { value: "draft", th: "ฉบับร่าง", en: "Draft" },
  { value: "closed", th: "ปิดรับสมัคร", en: "Closed" },
];

/** ประกาศรับสมัครงานของบริษัท (Owner Feature 4.1) – จอใหญ่: รายการซ้าย รายละเอียดขวา · จอเล็ก: กดแล้วเปิดเต็มจอ */
export default function JobPostingsView() {
  const { t, isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"all" | JobStatus>("all");
  const [selectedId, setSelectedId] = useState<string>(params.get("job") ?? "");
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(Boolean(params.get("job")));
  const list = useApi<JobList>("/owner/jobs", { query: { status } });

  const items = list.data?.items ?? [];
  const selected = items.find((job) => job.id === selectedId) ?? items[0];

  useEffect(() => {
    if (list.data && selectedId && !list.data.items.some((job) => job.id === selectedId)) {
      setSelectedId(list.data.items[0]?.id ?? "");
    }
  }, [list.data, selectedId]);

  const usage = list.data?.usage;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>{t("jobPostings.title")}</h1>
          <p className={styles.subheading}>
            {L(`ประกาศงานทั้งหมด ${list.data?.counts.all ?? 0} รายการ`, `${list.data?.counts.all ?? 0} job postings`)}
          </p>
        </div>
        <Link href="/job-postings/create" className={styles.createButton}>
          {t("jobPostings.newButton")}
        </Link>
      </div>

      {usage && !usage.verified && (
        <Notice tone="warning">
          {L(
            "บริษัทยังไม่ผ่านการยืนยัน – บันทึกเป็นฉบับร่างได้ แต่จะเผยแพร่ได้หลังทีมงานตรวจสอบ (1–3 วันทำการ)",
            "Your company is not verified yet – you can save drafts and publish after review (1–3 business days).",
          )}
        </Notice>
      )}
      {usage && usage.verified && (
        <p className={styles.usage}>
          {L("แพ็กเกจ", "Plan")} <b>{usage.plan}</b> ·{" "}
          {usage.lifetimePosts !== null
            ? L(`โพสต์แล้ว ${usage.postsUsed}/${usage.lifetimePosts} ครั้ง`, `${usage.postsUsed}/${usage.lifetimePosts} posts used`)
            : usage.maxActiveJobs !== null
              ? L(`เปิดรับอยู่ ${usage.activeJobs}/${usage.maxActiveJobs} ประกาศ`, `${usage.activeJobs}/${usage.maxActiveJobs} active postings`)
              : L("ประกาศได้ไม่จำกัด", "Unlimited postings")}
          {!usage.canPublish && (
            <>
              {" · "}
              <Link href="/packages">{L("อัปเกรดเพื่อประกาศเพิ่ม", "Upgrade to post more")}</Link>
            </>
          )}
        </p>
      )}

      <div className={styles.filters} role="tablist">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={status === filter.value}
            className={`${styles.filter} ${status === filter.value ? styles.filterActive : ""}`}
            onClick={() => setStatus(filter.value)}
          >
            {isEn ? filter.en : filter.th}
            <span>{list.data?.counts[filter.value] ?? 0}</span>
          </button>
        ))}
      </div>

      {list.loading && !list.data ? (
        <Loading />
      ) : list.error ? (
        <ErrorState message={list.error.message} onRetry={list.reload} />
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p>{t("jobPostings.empty")}</p>
          <Link href="/job-postings/create" className={styles.createButton}>
            {t("jobPostings.newButton")}
          </Link>
        </div>
      ) : (
        <div className={`${styles.layout} ${showDetailOnMobile ? styles.showDetail : ""}`}>
          <div className={styles.listColumn}>
            {items.map((posting) => (
              <JobPostingCard
                key={posting.id}
                posting={posting}
                selected={posting.id === selected?.id}
                onSelect={() => {
                  setSelectedId(posting.id);
                  setShowDetailOnMobile(true);
                  router.replace(`/job-postings?job=${posting.id}`, { scroll: false });
                }}
              />
            ))}
          </div>

          <div className={styles.detailColumn}>
            <button type="button" className={styles.backToList} onClick={() => setShowDetailOnMobile(false)}>
              ‹ {L("กลับไปรายการประกาศ", "Back to postings")}
            </button>
            {selected && <JobPostingDetail key={selected.id} jobId={selected.id} onChanged={list.reload} />}
          </div>
        </div>
      )}
    </div>
  );
}
