"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState, Loading, Notice, Pagination, PersonAvatar, ScoreBadge, UpgradeNotice } from "@/components/ui/ui";
import { relativeDay } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { errorMessage, useApi, useOwner } from "@/lib/owner";
import type { CandidateList, CandidateSummary } from "@/lib/types";
import styles from "./Candidates.module.css";
import { CandidateDetailModal } from "./CandidateDetailModal";
import { BookmarkIcon, CloseIcon, FileIcon, FilterIcon, SearchIcon, SendIcon } from "./shared";

type Source = "cyberjob" | "company";
type Sort = "newest" | "oldest" | "matching";

interface Filters {
  q: string;
  source: Source;
  expMin: string;
  expMax: string;
  skills: string[];
  scoreMin: number;
  scoreMax: number;
  sort: Sort;
}

const PAGE_SIZE = 10;

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** ผู้สมัครทั้งหมด (Feature 2.1) และผู้ที่สมัครเข้ามา (Feature 2.2) – สลับด้วยตัวกรองแหล่งที่มา */
export function AllCandidatesView() {
  const { t, isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const params = useSearchParams();
  const { me, api } = useOwner();

  const initialSource: Source =
    params.get("source") === "company" || !me.plan.talentSearch ? "company" : "cyberjob";
  const empty: Filters = {
    q: "",
    source: initialSource,
    expMin: "",
    expMax: "",
    skills: [],
    scoreMin: 0,
    scoreMax: 100,
    sort: "newest",
  };

  const [filters, setFilters] = useState<Filters>({ ...empty, q: params.get("q") ?? "" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CandidateSummary | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const q = useDebounced(filters.q);
  const expMin = useDebounced(filters.expMin);
  const expMax = useDebounced(filters.expMax);
  const scoreMin = useDebounced(filters.scoreMin);
  const scoreMax = useDebounced(filters.scoreMax);
  const scoreFiltered = scoreMin > 0 || scoreMax < 100;

  const list = useApi<CandidateList>("/owner/candidates", {
    query: {
      source: filters.source,
      q,
      expMin,
      expMax,
      skills: filters.skills,
      scoreMin: scoreFiltered ? scoreMin : undefined,
      scoreMax: scoreFiltered ? scoreMax : undefined,
      sort: filters.sort,
      page,
      pageSize: PAGE_SIZE,
    },
  });

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const planBlocked = list.error?.code === "PLAN_REQUIRED";

  const toggleBookmark = async (candidate: CandidateSummary) => {
    setBusyId(candidate.id);
    setNotice(null);
    try {
      if (candidate.bookmarked) await api(`/owner/bookmarks/${candidate.id}`, { method: "DELETE" });
      else await api("/owner/bookmarks", { body: { candidateId: candidate.id } });
      list.setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) => (item.id === candidate.id ? { ...item, bookmarked: !item.bookmarked } : item)),
            }
          : current,
      );
    } catch (error) {
      setNotice({ tone: "error", text: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  };

  const skills = list.data?.skills ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{filters.source === "company" ? L("ผู้สมัครที่สมัครเข้ามา", "Applicants to your jobs") : t("pageTitle.allCandidates")}</h1>
        <p>{t("candidates.countLabel", { count: list.data?.total ?? 0 })}</p>
      </header>

      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <div className={styles.layout}>
        <aside className={styles.filters}>
          <div className={styles.filtersHead}>
            <span className={styles.filtersTitle}>
              <FilterIcon />
              {t("candidates.filters")}
            </span>
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setFilters({ ...empty, source: filters.source });
                setPage(1);
              }}
            >
              <CloseIcon />
              {t("candidates.clearFilters")}
            </button>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t("candidates.sourceLabel")}</span>
            <div>
              {(["cyberjob", "company"] as const).map((source) => (
                <button
                  key={source}
                  type="button"
                  className={`${styles.sourceOption} ${filters.source === source ? styles.sourceOptionActive : ""}`}
                  onClick={() => update("source", source)}
                >
                  {source === "cyberjob" ? t("candidates.sourceCyberjob") : t("candidates.sourceCompany")}
                  {source === "cyberjob" && !me.plan.talentSearch ? " 🔒" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t("candidates.experienceLabel")}</span>
            <div className={styles.rangeRow}>
              <input
                className={styles.input}
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={t("candidates.experienceMin")}
                value={filters.expMin}
                onChange={(event) => update("expMin", event.target.value)}
              />
              <span>—</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={t("candidates.experienceMax")}
                value={filters.expMax}
                onChange={(event) => update("expMax", event.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t("candidates.skillsLabel")}</span>
            <p className={styles.fieldHint}>{t("candidates.skillsHint")}</p>
            <div className={styles.skillBox}>
              {skills.length === 0 && <span className={styles.fieldHint}>-</span>}
              {skills.map((skill) => {
                const active = filters.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    aria-pressed={active}
                    className={`${styles.skillChip} ${active ? styles.skillChipActive : ""}`}
                    onClick={() =>
                      update("skills", active ? filters.skills.filter((item) => item !== skill) : [...filters.skills, skill])
                    }
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              {t("candidates.scoreRangeLabel")}: {filters.scoreMin} – {filters.scoreMax}
            </span>
            <input
              className={styles.slider}
              type="range"
              min={0}
              max={100}
              value={filters.scoreMin}
              aria-label={`${t("candidates.scoreRangeLabel")} ${t("candidates.experienceMin")}`}
              onChange={(event) => update("scoreMin", Math.min(Number(event.target.value), filters.scoreMax))}
            />
            <input
              className={styles.slider}
              type="range"
              min={0}
              max={100}
              value={filters.scoreMax}
              aria-label={`${t("candidates.scoreRangeLabel")} ${t("candidates.experienceMax")}`}
              onChange={(event) => update("scoreMax", Math.max(Number(event.target.value), filters.scoreMin))}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t("candidates.sortLabel")}</span>
            <select className={styles.select} value={filters.sort} onChange={(event) => update("sort", event.target.value as Sort)}>
              <option value="newest">{t("candidates.sortNewest")}</option>
              <option value="oldest">{t("candidates.sortOldest")}</option>
              <option value="matching">{t("candidates.sortMatching")}</option>
            </select>
          </div>
        </aside>

        <section className={styles.results}>
          <div className={styles.searchBar}>
            <SearchIcon />
            <input
              value={filters.q}
              placeholder={t("candidates.searchPlaceholder")}
              onChange={(event) => update("q", event.target.value)}
            />
          </div>

          <div className={styles.tableCard}>
            {planBlocked ? (
              <div style={{ padding: 16 }}>
                <UpgradeNotice message={list.error!.message} />
              </div>
            ) : list.error ? (
              <ErrorState message={list.error.message} onRetry={list.reload} />
            ) : list.loading && !list.data ? (
              <Loading />
            ) : !list.data || list.data.items.length === 0 ? (
              <div className={styles.empty}>
                <strong>{t("candidates.empty")}</strong>
                <span>{t("candidates.emptyHint")}</span>
              </div>
            ) : (
              <>
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{t("candidates.colName")}</th>
                        <th>{L("ทักษะ", "Skills")}</th>
                        <th>{t("candidates.colExperience")}</th>
                        <th>Resume Score</th>
                        <th>Matching Score</th>
                        <th>{filters.source === "company" ? L("สมัครเมื่อ", "Applied") : t("candidates.colRegistered")}</th>
                        <th style={{ textAlign: "right" }}>{t("candidates.colActions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.data.items.map((candidate) => {
                        const invitedCount = candidate.invitations.length;
                        return (
                          <tr key={candidate.id}>
                            <td>
                              <span className={styles.person}>
                                <PersonAvatar name={candidate.name} url={candidate.avatarUrl} />
                                <span>
                                  <strong className={styles.personName}>{candidate.name}</strong>
                                  <span className={styles.personRole}>
                                    {candidate.appliedJobs[0]
                                      ? `${L("สมัคร", "Applied")}: ${candidate.appliedJobs[0].title}`
                                      : (candidate.position ?? "-")}
                                  </span>
                                  {candidate.workplacePreference && (
                                    <span className={styles.personRole}>
                                      {L("รูปแบบงาน", "Work")}: {candidate.workplacePreference}
                                    </span>
                                  )}
                                </span>
                              </span>
                            </td>
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
                            <td>{t("candidates.years", { count: candidate.experienceYears })}</td>
                            <td>
                              <ScoreBadge value={candidate.resumeScore} label="Resume Score" />
                            </td>
                            <td>
                              <ScoreBadge
                                value={candidate.matchingScore}
                                label={candidate.matchedJob ? `Matching: ${candidate.matchedJob.title}` : "Matching Score"}
                              />
                            </td>
                            <td>
                              {relativeDay(
                                filters.source === "company" && candidate.lastAppliedAt ? candidate.lastAppliedAt : candidate.registeredAt,
                                isEn,
                              )}
                            </td>
                            <td>
                              <span className={styles.actions}>
                                <button type="button" className={styles.ghostButton} onClick={() => setSelected(candidate)}>
                                  <FileIcon />
                                  {t("candidates.viewResume")}
                                </button>
                                <button
                                  type="button"
                                  className={styles.iconButton}
                                  aria-label={t("candidates.invite")}
                                  title={invitedCount ? L(`เชิญแล้ว ${invitedCount} ตำแหน่ง`, `Invited to ${invitedCount} job(s)`) : t("candidates.invite")}
                                  onClick={() => setSelected(candidate)}
                                >
                                  <SendIcon />
                                </button>
                                <button
                                  type="button"
                                  aria-pressed={candidate.bookmarked}
                                  disabled={busyId === candidate.id}
                                  className={`${styles.iconButton} ${candidate.bookmarked ? styles.iconButtonActive : ""}`}
                                  aria-label={candidate.bookmarked ? t("candidates.removeBookmark") : t("candidates.bookmark")}
                                  title={candidate.bookmarked ? t("candidates.removeBookmark") : t("candidates.bookmark")}
                                  onClick={() => toggleBookmark(candidate)}
                                >
                                  <BookmarkIcon filled={candidate.bookmarked} />
                                </button>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={PAGE_SIZE} total={list.data.total} onChange={setPage} />
              </>
            )}
          </div>
        </section>
      </div>

      {selected && (
        <CandidateDetailModal
          candidateId={selected.id}
          jobId={filters.source === "company" ? selected.appliedJobs[0]?.id : undefined}
          onClose={() => setSelected(null)}
          onChanged={list.reload}
        />
      )}
    </div>
  );
}
