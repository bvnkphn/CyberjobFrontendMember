"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateDetailModal } from "@/components/candidates/CandidateDetailModal";
import { ErrorState, Loading, Notice, PersonAvatar, ScoreBadge, UpgradeNotice } from "@/components/ui/ui";
import { EMPLOYMENT_LABEL, WORK_STYLE_LABEL, formatDate, salaryRange } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ApiError, errorMessage, useApi, useOwner } from "@/lib/owner";
import type { JobDetail } from "@/lib/types";
import ConfirmActionModal from "./ConfirmActionModal";
import { statusLabel } from "./JobPostingCard";
import styles from "./JobPostingDetail.module.css";

function CircleStopIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** รายละเอียดประกาศ + ผู้ที่สมัคร (Feature 4.1.1) */
export default function JobPostingDetail({ jobId, onChanged }: { jobId: string; onChanged: () => void }) {
  const { t, isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const router = useRouter();
  const { api } = useOwner();
  const detail = useApi<JobDetail>(`/owner/jobs/${jobId}`);

  const [confirm, setConfirm] = useState<"close" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [resumeOf, setResumeOf] = useState<string | null>(null);

  if (detail.loading && !detail.data) return <section className={styles.detail}><Loading /></section>;
  if (detail.error || !detail.data) {
    return (
      <section className={styles.detail}>
        <ErrorState message={detail.error?.message ?? ""} onRetry={detail.reload} />
      </section>
    );
  }

  const posting = detail.data;

  const run = async (action: "close" | "publish" | "delete") => {
    setBusy(true);
    setError(null);
    try {
      if (action === "delete") {
        await api(`/owner/jobs/${posting.id}`, { method: "DELETE" });
        setConfirm(null);
        onChanged();
        router.replace("/job-postings", { scroll: false });
        return;
      }
      const updated = await api<JobDetail>(`/owner/jobs/${posting.id}/${action}`, { method: "POST" });
      detail.setData(updated);
      setConfirm(null);
      onChanged();
    } catch (reason) {
      setConfirm(null);
      setError(reason instanceof Error ? reason : new Error(errorMessage(reason)));
    } finally {
      setBusy(false);
    }
  };

  const planError = error instanceof ApiError && (error.code === "PLAN_LIMIT" || error.code === "VERIFICATION_REQUIRED");

  return (
    <section className={styles.detail}>
      {error &&
        (planError && (error as ApiError).code === "PLAN_LIMIT" ? (
          <UpgradeNotice message={error.message} />
        ) : (
          <Notice tone={planError ? "warning" : "error"}>{error.message}</Notice>
        ))}

      <div className={styles.detailHeader}>
        <div className={styles.headerText}>
          <h2 className={styles.detailTitle}>{posting.title}</h2>
          <div className={styles.tags}>
            <span className={styles.statusTag}>{statusLabel(posting.status, t)}</span>
            <span className={styles.categoryTag}>{posting.category}</span>
            {posting.isUrgent && <span className={styles.categoryTag}>{L("ด่วน", "Urgent")}</span>}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonEdit}`}
            aria-label={L("แก้ไข", "Edit")}
            title={L("แก้ไข", "Edit")}
            onClick={() => router.push(`/job-postings/edit/${posting.id}`)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
          {posting.status === "published" ? (
            <button
              type="button"
              className={styles.iconButton}
              aria-label={L("ปิดรับสมัคร", "Close applications")}
              title={L("ปิดรับสมัคร", "Close applications")}
              disabled={busy}
              onClick={() => setConfirm("close")}
            >
              <CircleStopIcon />
            </button>
          ) : (
            <button type="button" className={styles.publishButton} disabled={busy} onClick={() => run("publish")}>
              {posting.status === "draft" ? L("เผยแพร่", "Publish") : L("เปิดรับอีกครั้ง", "Reopen")}
            </button>
          )}
          <button
            type="button"
            className={`${styles.iconButton} ${styles.deleteButton}`}
            aria-label={L("ลบ", "Delete")}
            title={L("ลบ", "Delete")}
            disabled={busy}
            onClick={() => setConfirm("delete")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("jobPostings.salary")}</span>
          <span className={styles.metaValue}>
            {salaryRange(posting.salaryMin, posting.salaryMax, isEn)}
            {posting.salaryNegotiable ? L(" (ต่อรองได้)", " (negotiable)") : ""}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{L("ประเภทของบริษัท", "Company type")}</span>
          <span className={styles.metaValue}>{posting.company.businessType}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{L("รูปแบบการทำงาน", "Work style")}</span>
          <span className={styles.metaValue}>{isEn ? WORK_STYLE_LABEL[posting.workStyle].en : WORK_STYLE_LABEL[posting.workStyle].th}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("jobPostings.employmentType")}</span>
          <span className={styles.metaValue}>
            {isEn ? EMPLOYMENT_LABEL[posting.employmentType].en : EMPLOYMENT_LABEL[posting.employmentType].th}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{L("ประสบการณ์ที่ต้องการ", "Experience")}</span>
          <span className={styles.metaValue}>
            {posting.experienceYears > 0 ? L(`${posting.experienceYears} ปีขึ้นไป`, `${posting.experienceYears}+ years`) : L("ไม่กำหนด", "Not required")}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{L("จำนวนที่เปิดรับ", "Openings")}</span>
          <span className={styles.metaValue}>{L(`${posting.openings} อัตรา`, `${posting.openings}`)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{L("วันที่ประกาศ", "Posted")}</span>
          <span className={styles.metaValue}>{formatDate(posting.postedAt)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("jobPostings.lastUpdated")}</span>
          <span className={styles.metaValue}>{formatDate(posting.updatedAt)}</span>
        </div>
      </div>

      {posting.memberUrl && (
        <p className={styles.memberLink}>
          <a href={posting.memberUrl} target="_blank" rel="noreferrer">
            {L("ดูประกาศนี้บนหน้าเว็บผู้หางาน ↗", "View on the job seeker site ↗")}
          </a>
        </p>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t("jobPostings.jobDescription")}</h3>
        <p className={styles.description}>{posting.description || "-"}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t("jobPostings.requiredSkills")}</h3>
        <div className={styles.skills}>
          {posting.skills.length ? posting.skills.map((skill) => <span key={skill} className={styles.skillTag}>{skill}</span>) : "-"}
        </div>
      </div>

      {posting.questions.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{L("คำถามคัดกรอง", "Screening questions")}</h3>
          <ol className={styles.questions}>
            {posting.questions.map((question) => (
              <li key={question.id}>
                {question.text}
                {!question.required && <small> {L("(ไม่บังคับ)", "(optional)")}</small>}
                {question.options.length > 0 && <small className={styles.options}>{question.options.join(" · ")}</small>}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t("jobPostings.applicants")} ({posting.applicants.length})
        </h3>
        {posting.applicants.length === 0 ? (
          <p className={styles.description}>{L("ยังไม่มีผู้สมัครในตำแหน่งนี้", "No applicants for this posting yet")}</p>
        ) : (
          <div className={styles.applicants}>
            {posting.applicants.map((applicant) => (
              <div key={applicant.applicationId} className={styles.applicant}>
                <PersonAvatar name={applicant.name} url={applicant.avatarUrl} size={44} />
                <div className={styles.applicantInfo}>
                  <div className={styles.applicantName}>{applicant.name}</div>
                  <div className={styles.applicantMeta}>
                    {applicant.position ?? "-"} · {formatDate(applicant.appliedAt)}
                  </div>
                  <button type="button" className={styles.resumeLink} onClick={() => setResumeOf(applicant.candidateId)}>
                    {t("jobPostings.viewResume")}
                  </button>
                </div>
                <div className={styles.applicantScores}>
                  <ScoreBadge value={applicant.resumeScore} label="Resume Score" />
                  <small>Resume</small>
                </div>
                <div className={styles.applicantScores}>
                  <ScoreBadge value={applicant.matchingScore} label="Matching Score" />
                  <small>Match</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmActionModal
        isOpen={confirm === "close"}
        onClose={() => setConfirm(null)}
        onConfirm={() => run("close")}
        variant="warning"
        title={t("confirm.closeTitle")}
        description={t("confirm.closeDescription")}
        targetName={posting.title}
        confirmLabel={t("confirm.closeLabel")}
      />
      <ConfirmActionModal
        isOpen={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => run("delete")}
        variant="danger"
        title={t("confirm.deleteTitle")}
        description={t("confirm.deleteDescription")}
        targetName={posting.title}
        confirmLabel={t("confirm.deleteLabel")}
      />

      {resumeOf && (
        <CandidateDetailModal candidateId={resumeOf} jobId={posting.id} onClose={() => setResumeOf(null)} />
      )}
    </section>
  );
}
