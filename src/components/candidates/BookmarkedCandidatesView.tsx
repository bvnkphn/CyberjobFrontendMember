"use client";

import { useState } from "react";
import { ErrorState, Loading, Notice, PersonAvatar, ScoreBadge } from "@/components/ui/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { errorMessage, useApi, useOwner } from "@/lib/owner";
import type { CandidateSummary } from "@/lib/types";
import styles from "./Candidates.module.css";
import { CandidateDetailModal } from "./CandidateDetailModal";
import { FileIcon, SendIcon, TrashIcon } from "./shared";

type BookmarkList = { items: Array<CandidateSummary & { bookmarkedAt: string }>; total: number };

/** ผู้สมัครที่บันทึกไว้ (Feature 2.3) */
export function BookmarkedCandidatesView() {
  const { t, isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const { api } = useOwner();
  const list = useApi<BookmarkList>("/owner/bookmarks");
  const [selected, setSelected] = useState<CandidateSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remove = async (candidate: CandidateSummary) => {
    setError(null);
    try {
      await api(`/owner/bookmarks/${candidate.id}`, { method: "DELETE" });
      list.setData((current) =>
        current ? { items: current.items.filter((item) => item.id !== candidate.id), total: current.total - 1 } : current,
      );
    } catch (reason) {
      setError(errorMessage(reason));
    }
  };

  const rows = list.data?.items ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{t("pageTitle.bookmarks")}</h1>
        <p>{t("candidates.countLabel", { count: list.data?.total ?? 0 })}</p>
      </header>

      {error && <Notice tone="error">{error}</Notice>}

      <div className={styles.tableCard}>
        {list.loading && !list.data ? (
          <Loading />
        ) : list.error ? (
          <ErrorState message={list.error.message} onRetry={list.reload} />
        ) : rows.length === 0 ? (
          <div className={styles.empty}>
            <strong>{L("ยังไม่มีผู้สมัครที่บันทึกไว้", "No bookmarked candidates yet")}</strong>
            <span>{L("กดไอคอนบันทึกในหน้าผู้สมัครทั้งหมดเพื่อเพิ่มรายชื่อ", "Use the bookmark icon on the candidates page")}</span>
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("candidates.colName")}</th>
                  <th>{t("candidates.colPositionPlain")}</th>
                  <th>{t("candidates.colExperience")}</th>
                  <th>{t("candidates.colSkills")}</th>
                  <th>{t("candidates.colMatching")}</th>
                  <th style={{ textAlign: "right" }}>{t("candidates.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <span className={styles.person}>
                        <PersonAvatar name={candidate.name} url={candidate.avatarUrl} />
                        <strong className={styles.personName}>{candidate.name}</strong>
                      </span>
                    </td>
                    <td>{candidate.appliedJobs[0]?.title ?? candidate.position ?? "-"}</td>
                    <td>{t("candidates.years", { count: candidate.experienceYears })}</td>
                    <td>
                      <span className={styles.chipRow}>
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className={styles.chip}>
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && <span className={styles.chip}>+{candidate.skills.length - 3}</span>}
                      </span>
                    </td>
                    <td>
                      <ScoreBadge value={candidate.matchingScore} label={candidate.matchedJob?.title} />
                    </td>
                    <td>
                      <span className={styles.actions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={t("candidates.viewResume")}
                          title={t("candidates.viewResume")}
                          onClick={() => setSelected(candidate)}
                        >
                          <FileIcon />
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={t("candidates.invite")}
                          title={t("candidates.invite")}
                          onClick={() => setSelected(candidate)}
                        >
                          <SendIcon />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          aria-label={t("candidates.removeBookmark")}
                          title={t("candidates.removeBookmark")}
                          onClick={() => remove(candidate)}
                        >
                          <TrashIcon />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <CandidateDetailModal candidateId={selected.id} onClose={() => setSelected(null)} onChanged={list.reload} />
      )}
    </div>
  );
}
