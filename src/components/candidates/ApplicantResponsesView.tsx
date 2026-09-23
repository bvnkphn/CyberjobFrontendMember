"use client";

import { useEffect, useState } from "react";
import { ErrorState, Loading, PersonAvatar, ScoreBadge } from "@/components/ui/ui";
import { formatDate, relativeDay } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useApi } from "@/lib/owner";
import type { ResponseList } from "@/lib/types";
import styles from "./Candidates.module.css";
import { CandidateDetailModal } from "./CandidateDetailModal";
import { SearchIcon } from "./shared";

/** คำตอบของผู้สมัคร (Feature 2.4) – รายชื่ออยู่ซ้าย คำถาม/คำตอบอยู่ขวา */
export function ApplicantResponsesView() {
  const { t, isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [jobId, setJobId] = useState("all");
  const [days, setDays] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [resumeOf, setResumeOf] = useState<{ candidateId: string; jobId: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const list = useApi<ResponseList>("/owner/responses", {
    query: { q, jobId: jobId === "all" ? undefined : jobId, days: days === "all" ? undefined : days },
  });

  const items = list.data?.items ?? [];
  const selected = items.find((item) => item.applicationId === selectedId) ?? items[0] ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{t("pageTitle.responses")}</h1>
        <p>{t("responses.countLabel", { count: list.data?.total ?? 0 })}</p>
      </header>

      <div className={styles.toolbar}>
        <SearchIcon />
        <input
          className={styles.input}
          value={search}
          placeholder={t("responses.searchPlaceholder")}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className={styles.select} value={jobId} onChange={(event) => setJobId(event.target.value)} aria-label={t("responses.allJobs")}>
          <option value="all">{t("responses.allJobs")}</option>
          {(list.data?.jobs ?? []).map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <select className={styles.select} value={days} onChange={(event) => setDays(event.target.value)} aria-label={t("responses.allTime")}>
          <option value="all">{t("responses.allTime")}</option>
          <option value="1">{L("ภายใน 24 ชั่วโมง", "Last 24 hours")}</option>
          <option value="7">{L("ภายใน 7 วัน", "Last 7 days")}</option>
          <option value="30">{L("ภายใน 30 วัน", "Last 30 days")}</option>
        </select>
      </div>

      {list.loading && !list.data ? (
        <Loading />
      ) : list.error ? (
        <ErrorState message={list.error.message} onRetry={list.reload} />
      ) : (
        <div className={styles.splitLayout}>
          <div className={styles.candidateList}>
            {items.length === 0 ? (
              <div className={styles.empty}>
                <strong>{t("candidates.empty")}</strong>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.applicationId}
                  type="button"
                  className={`${styles.candidateItem} ${selected?.applicationId === item.applicationId ? styles.candidateItemActive : ""}`}
                  onClick={() => setSelectedId(item.applicationId)}
                >
                  <PersonAvatar name={item.candidate.name} url={item.candidate.avatarUrl} />
                  <span style={{ minWidth: 0 }}>
                    <strong className={styles.personName}>{item.candidate.name}</strong>
                    <span className={styles.personRole}>{item.job.title}</span>
                    <span className={styles.candidateItemTime}>{relativeDay(item.appliedAt, isEn)}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div className={styles.answerCard}>
            {!selected ? (
              <div className={styles.empty}>
                <strong>{t("responses.selectPrompt")}</strong>
              </div>
            ) : (
              <>
                <div className={styles.answerHead}>
                  <PersonAvatar name={selected.candidate.name} url={selected.candidate.avatarUrl} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong className={styles.personName}>{selected.candidate.name}</strong>
                    <span className={styles.personRole}>{selected.candidate.position ?? "-"}</span>
                    <span className={styles.candidateItemTime}>
                      {L("สมัครตำแหน่ง", "Applied for")} {selected.job.title} · {formatDate(selected.appliedAt)}
                    </span>
                  </div>
                  <ScoreBadge value={selected.candidate.resumeScore} label="Resume Score" />
                  <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={() => setResumeOf({ candidateId: selected.candidate.id, jobId: selected.job.id })}
                  >
                    {t("candidates.viewResume")}
                  </button>
                </div>

                {selected.answers.length ? (
                  selected.answers.map((entry, index) => (
                    <div key={`${selected.applicationId}-${index}`} className={styles.question}>
                      <span className={styles.questionIndex}>Q{index + 1}.</span>
                      <div className={styles.questionBody}>
                        <p className={styles.questionText}>{entry.question}</p>
                        <span className={styles.answerLabel}>{t("responses.answerLabel")}</span>
                        <p className={styles.answerText} style={{ whiteSpace: "pre-wrap" }}>
                          {Array.isArray(entry.answer) ? entry.answer.join(", ") : entry.answer}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.empty}>
                    <strong>{t("responses.noAnswers")}</strong>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {resumeOf && (
        <CandidateDetailModal candidateId={resumeOf.candidateId} jobId={resumeOf.jobId} onClose={() => setResumeOf(null)} />
      )}
    </div>
  );
}
