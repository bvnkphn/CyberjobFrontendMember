"use client";

import { useEffect, useState } from "react";
import { ErrorState, Loading, PersonAvatar } from "@/components/ui/ui";
import { formatDate, relativeDay } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useApi } from "@/lib/owner";
import type { InvitationList, InvitationStatus } from "@/lib/types";
import styles from "./Candidates.module.css";
import { CandidateDetailModal } from "./CandidateDetailModal";
import { EyeIcon, SearchIcon } from "./shared";

const STAT_TONES: Record<string, { background: string; color: string }> = {
  sent: { background: "var(--color-blue-light)", color: "var(--color-blue)" },
  accepted: { background: "#e4f6ee", color: "var(--color-green)" },
  awaiting: { background: "#fdf1dc", color: "var(--color-gold-dark)" },
  declined: { background: "var(--color-danger-light)", color: "var(--color-danger)" },
};

/** คำเชิญผู้สมัคร (Feature 2.5) */
export function InvitationsView() {
  const { t, isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | InvitationStatus>("all");
  const [days, setDays] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selected, setSelected] = useState<{ candidateId: string; jobId: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const list = useApi<InvitationList>("/owner/invitations", {
    query: { q, status, sort, days: days === "all" ? undefined : days },
  });

  const statusLabel: Record<InvitationStatus, string> = {
    sent: t("invitations.statusSent"),
    accepted: t("invitations.statusAccepted"),
    declined: t("invitations.statusDeclined"),
  };
  const statusClass: Record<InvitationStatus, string> = {
    sent: styles.badgeSent,
    accepted: styles.badgeAccepted,
    declined: styles.badgeDeclined,
  };

  const stats = list.data?.stats;
  const cards = [
    { key: "sent", value: stats?.total ?? 0, label: t("invitations.sent") },
    { key: "accepted", value: stats?.accepted ?? 0, label: t("invitations.accepted") },
    { key: "awaiting", value: stats?.pending ?? 0, label: t("invitations.awaiting") },
    { key: "declined", value: stats?.declined ?? 0, label: t("invitations.declined") },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{t("pageTitle.invitations")}</h1>
      </header>

      <div className={styles.statGrid}>
        {cards.map((card) => (
          <article key={card.key} className={styles.statCard}>
            <span className={styles.statIcon} style={STAT_TONES[card.key]} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {card.key === "accepted" ? (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8.5 12 2.5 2.5 4.5-5" />
                  </>
                ) : card.key === "declined" ? (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 9l6 6M15 9l-6 6" />
                  </>
                ) : card.key === "awaiting" ? (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </>
                )}
              </svg>
            </span>
            <strong className={styles.statValue}>{card.value}</strong>
            <span className={styles.statLabel}>{card.label}</span>
          </article>
        ))}
      </div>

      <div className={styles.toolbar}>
        <SearchIcon />
        <input
          className={styles.input}
          value={search}
          placeholder={t("responses.searchPlaceholder")}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className={styles.select} value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label={t("invitations.colStatus")}>
          <option value="all">{t("invitations.allStatuses")}</option>
          <option value="sent">{t("invitations.statusSent")}</option>
          <option value="accepted">{t("invitations.statusAccepted")}</option>
          <option value="declined">{t("invitations.statusDeclined")}</option>
        </select>
        <select className={styles.select} value={days} onChange={(event) => setDays(event.target.value)} aria-label={L("วันที่ส่งคำเชิญ", "Sent date")}>
          <option value="all">{L("ส่งเมื่อไรก็ได้", "Any time")}</option>
          <option value="7">{L("ส่งภายใน 7 วัน", "Last 7 days")}</option>
          <option value="30">{L("ส่งภายใน 30 วัน", "Last 30 days")}</option>
        </select>
        <select className={styles.select} value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label={t("candidates.sortLabel")}>
          <option value="newest">{t("candidates.sortNewest")}</option>
          <option value="oldest">{t("candidates.sortOldest")}</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {list.loading && !list.data ? (
          <Loading />
        ) : list.error ? (
          <ErrorState message={list.error.message} onRetry={list.reload} />
        ) : !list.data || list.data.items.length === 0 ? (
          <div className={styles.empty}>
            <strong>{t("invitations.empty")}</strong>
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("invitations.colCandidate")}</th>
                  <th>{t("invitations.colJob")}</th>
                  <th>{t("invitations.colSent")}</th>
                  <th>{t("invitations.colStatus")}</th>
                  <th style={{ textAlign: "right" }}>{t("candidates.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {list.data.items.map((invitation) => (
                  <tr key={invitation.id}>
                    <td>
                      <span className={styles.person}>
                        <PersonAvatar name={invitation.candidate.name} url={invitation.candidate.avatarUrl} />
                        <span>
                          <strong className={styles.personName}>{invitation.candidate.name}</strong>
                          <span className={styles.personRole}>{invitation.candidate.code}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      {invitation.job.title}
                      {invitation.job.deleted ? L(" (ลบแล้ว)", " (deleted)") : ""}
                    </td>
                    <td title={formatDate(invitation.createdAt)}>{relativeDay(invitation.createdAt, isEn)}</td>
                    <td>
                      <span className={`${styles.badge} ${statusClass[invitation.status]}`}>{statusLabel[invitation.status]}</span>
                    </td>
                    <td>
                      <span className={styles.actions}>
                        <button
                          type="button"
                          className={styles.ghostButton}
                          onClick={() => setSelected({ candidateId: invitation.candidate.id, jobId: invitation.job.id })}
                        >
                          <EyeIcon />
                          {t("invitations.viewCandidate")}
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
        <CandidateDetailModal
          candidateId={selected.candidateId}
          jobId={selected.jobId}
          onClose={() => setSelected(null)}
          onChanged={list.reload}
        />
      )}
    </div>
  );
}
