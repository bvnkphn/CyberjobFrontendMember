"use client";

import { useState } from "react";
import { Loading, ErrorState, Modal, Notice, PersonAvatar, ScoreBadge } from "@/components/ui/ui";
import { formatDate, relativeDay } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { errorMessage, useApi, useOwner } from "@/lib/owner";
import type { CandidateDetail, JobList } from "@/lib/types";
import styles from "./CandidateDetail.module.css";

const INVITATION_LABEL = {
  sent: { th: "รอตอบกลับ", en: "Awaiting" },
  accepted: { th: "ตอบรับแล้ว", en: "Accepted" },
  declined: { th: "ปฏิเสธ", en: "Declined" },
} as const;

/**
 * รายละเอียดผู้สมัคร / View Resume (Owner Feature 2.1.3.2)
 * AI Score (Resume Score, Matching Score, Matching Explanation) ข้อมูลติดต่อ ทักษะ ประสบการณ์ การศึกษา
 * พร้อมปุ่ม Bookmark และเชิญผู้สมัคร
 */
export function CandidateDetailModal({
  candidateId,
  jobId,
  onClose,
  onChanged,
}: {
  candidateId: string;
  /** เทียบ Matching Score กับประกาศนี้ (เช่นเปิดจากรายชื่อผู้สมัครของประกาศ) */
  jobId?: string;
  onClose: () => void;
  /** เรียกเมื่อบันทึก/เชิญสำเร็จ ให้หน้าที่เปิดโหลดรายการใหม่ */
  onChanged?: () => void;
}) {
  const { isEn } = useLanguage();
  const { api } = useOwner();
  const L = (th: string, en: string) => (isEn ? en : th);
  const detail = useApi<CandidateDetail>(`/owner/candidates/${candidateId}`, { query: { jobId } });

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [jobs, setJobs] = useState<JobList["items"] | null>(null);
  const [inviteJobId, setInviteJobId] = useState("");
  const [message, setMessage] = useState("");

  const candidate = detail.data;

  const toggleBookmark = async () => {
    if (!candidate) return;
    setBusy(true);
    setNotice(null);
    try {
      if (candidate.bookmarked) {
        await api(`/owner/bookmarks/${candidate.id}`, { method: "DELETE" });
      } else {
        await api("/owner/bookmarks", { body: { candidateId: candidate.id } });
      }
      detail.setData({ ...candidate, bookmarked: !candidate.bookmarked });
      onChanged?.();
    } catch (error) {
      setNotice({ tone: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const openInvite = async () => {
    setInviteOpen(true);
    setNotice(null);
    if (jobs) return;
    try {
      const list = await api<JobList>("/owner/jobs", { query: { status: "published" } });
      setJobs(list.items);
      const first = list.items.find((job) => !candidate?.invitations.some((item) => item.jobId === job.id));
      setInviteJobId(jobId && list.items.some((job) => job.id === jobId) ? jobId : (first?.id ?? ""));
    } catch (error) {
      setJobs([]);
      setNotice({ tone: "error", text: errorMessage(error) });
    }
  };

  const sendInvite = async () => {
    if (!candidate || !inviteJobId) return;
    setBusy(true);
    setNotice(null);
    try {
      await api("/owner/invitations", {
        body: { candidateId: candidate.id, jobId: inviteJobId, message: message.trim() || undefined },
      });
      setInviteOpen(false);
      setMessage("");
      setNotice({ tone: "success", text: L("ส่งคำเชิญเรียบร้อยแล้ว", "Invitation sent") });
      await detail.reload();
      onChanged?.();
    } catch (error) {
      setNotice({ tone: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const footer = candidate ? (
    <>
      <button type="button" className={styles.secondary} onClick={onClose}>
        {L("ปิด", "Close")}
      </button>
      <button type="button" className={styles.secondary} disabled={busy} onClick={toggleBookmark} aria-pressed={candidate.bookmarked}>
        {candidate.bookmarked ? L("★ บันทึกไว้แล้ว", "★ Bookmarked") : L("☆ บันทึกผู้สมัคร", "☆ Bookmark")}
      </button>
      <button type="button" className={styles.primary} disabled={busy} onClick={openInvite}>
        {L("เชิญสมัครงาน", "Invite to apply")}
      </button>
    </>
  ) : undefined;

  return (
    <Modal title={L("รายละเอียดผู้สมัคร", "Candidate details")} onClose={onClose} footer={footer} wide>
      {detail.loading && !candidate ? (
        <Loading />
      ) : detail.error ? (
        <ErrorState message={detail.error.message} onRetry={detail.reload} />
      ) : candidate ? (
        <div className={styles.detail}>
          {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

          {inviteOpen && (
            <section className={styles.invite}>
              <h3>{L("เชิญผู้สมัครให้สมัครงาน", "Invite this candidate")}</h3>
              {jobs === null ? (
                <Loading />
              ) : jobs.length === 0 ? (
                <p className={styles.muted}>{L("ยังไม่มีประกาศที่เปิดรับสมัคร", "You have no open job postings")}</p>
              ) : (
                <>
                  <label className={styles.field}>
                    <span>{L("ตำแหน่งงาน", "Job posting")}</span>
                    <select value={inviteJobId} onChange={(event) => setInviteJobId(event.target.value)}>
                      {jobs.map((job) => {
                        const invited = candidate.invitations.some((item) => item.jobId === job.id);
                        const applied = candidate.appliedJobs.some((item) => item.id === job.id);
                        return (
                          <option key={job.id} value={job.id} disabled={invited || applied}>
                            {job.title}
                            {invited ? L(" (เชิญแล้ว)", " (invited)") : applied ? L(" (สมัครแล้ว)", " (applied)") : ""}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>{L("ข้อความถึงผู้สมัคร (ไม่บังคับ)", "Message (optional)")}</span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={L("บริษัทสนใจประวัติของคุณ...", "We are interested in your profile...")}
                    />
                  </label>
                  <div className={styles.inviteActions}>
                    <button type="button" className={styles.secondary} onClick={() => setInviteOpen(false)}>
                      {L("ยกเลิก", "Cancel")}
                    </button>
                    <button type="button" className={styles.primary} disabled={busy || !inviteJobId} onClick={sendInvite}>
                      {L("ส่งคำเชิญ", "Send invitation")}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          <header className={styles.head}>
            <PersonAvatar name={candidate.name} url={candidate.avatarUrl} size={64} />
            <div>
              <h3>{candidate.name}</h3>
              <p>
                {candidate.position ?? L("ยังไม่ระบุตำแหน่งที่ต้องการ", "No desired position")} · {candidate.code}
              </p>
              <p className={styles.muted}>
                {L("ประสบการณ์", "Experience")} {candidate.experienceYears} {L("ปี", "yrs")}
                {candidate.expectedSalary ? ` · ${L("เงินเดือนที่คาดหวัง", "Expected salary")} ${candidate.expectedSalary}` : ""}
              </p>
            </div>
          </header>

          {/* AI Score */}
          <section className={styles.scores}>
            <div className={styles.scoreCard}>
              <ScoreBadge value={candidate.resumeScore} />
              <div>
                <b>Resume Score</b>
                <small>{L("ความสมบูรณ์ของเรซูเม่", "Resume completeness")}</small>
              </div>
            </div>
            <div className={styles.scoreCard}>
              <ScoreBadge value={candidate.match?.score ?? null} />
              <div>
                <b>Matching Score</b>
                <small>
                  {candidate.match
                    ? `${L("เทียบกับ", "vs.")} ${candidate.match.job.title}`
                    : L("ยังไม่มีประกาศที่ใช้เทียบ", "No job posting to compare")}
                </small>
              </div>
            </div>
          </section>

          {candidate.match && (
            <section className={styles.section}>
              <h4>Matching Explanation</h4>
              <ul className={styles.factors}>
                {candidate.match.factors.map((factor) => (
                  <li key={factor.key}>
                    <div className={styles.factorHead}>
                      <span>{factor.label}</span>
                      <b>
                        {factor.score}/{factor.max}
                      </b>
                    </div>
                    <div className={styles.bar}>
                      <i style={{ width: `${(factor.score / factor.max) * 100}%` }} />
                    </div>
                    <small>{factor.detail}</small>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className={styles.columns}>
            <section className={styles.section}>
              <h4>{L("ข้อมูลติดต่อ", "Contact")}</h4>
              <dl className={styles.definitions}>
                <dt>{L("อีเมล", "Email")}</dt>
                <dd>
                  <a href={`mailto:${candidate.resume.contact.email}`}>{candidate.resume.contact.email}</a>
                </dd>
                <dt>{L("เบอร์โทร", "Phone")}</dt>
                <dd>{candidate.resume.contact.phone ?? "-"}</dd>
                <dt>{L("ที่อยู่", "Address")}</dt>
                <dd>{candidate.resume.contact.address ?? "-"}</dd>
                <dt>{L("รูปแบบงานที่ต้องการ", "Work preference")}</dt>
                <dd>{candidate.workplacePreference ?? "-"}</dd>
              </dl>
            </section>

            <section className={styles.section}>
              <h4>{L("ทักษะที่มี", "Skills")}</h4>
              {candidate.skills.length ? (
                <div className={styles.chips}>
                  {candidate.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p className={styles.muted}>-</p>
              )}
              {candidate.resume.languages.length > 0 && (
                <>
                  <h4 className={styles.subhead}>{L("ภาษา", "Languages")}</h4>
                  <ul className={styles.plainList}>
                    {candidate.resume.languages.map((language) => (
                      <li key={language.name}>
                        {language.name} – {language.level}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <section className={styles.section}>
            <h4>{L("ประสบการณ์การทำงาน", "Work experience")}</h4>
            {candidate.resume.workExperiences.length ? (
              <ul className={styles.timeline}>
                {candidate.resume.workExperiences.map((work, index) => (
                  <li key={`${work.company}-${index}`}>
                    <b>{work.position}</b>
                    <span>
                      {work.company} · {work.period}
                    </span>
                    {work.description && <p>{work.description}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>{L("ยังไม่มีประวัติการทำงาน", "No work experience")}</p>
            )}
          </section>

          <section className={styles.section}>
            <h4>{L("การศึกษา", "Education")}</h4>
            {candidate.resume.educations.length ? (
              <ul className={styles.timeline}>
                {candidate.resume.educations.map((education, index) => (
                  <li key={`${education.institution}-${index}`}>
                    <b>
                      {education.degree}
                      {education.major ? ` · ${education.major}` : ""}
                    </b>
                    <span>
                      {education.institution}
                      {education.year ? ` · ${education.year}` : ""}
                      {education.gpa ? ` · GPA ${education.gpa}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>-</p>
            )}
          </section>

          {candidate.certificates.length > 0 && (
            <section className={styles.section}>
              <h4>{L("ใบประกาศนียบัตร", "Certificates")}</h4>
              <ul className={styles.plainList}>
                {candidate.certificates.map((certificate) => (
                  <li key={certificate.title}>
                    {certificate.title}
                    {certificate.issuer ? ` – ${certificate.issuer}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {candidate.applications.length > 0 && (
            <section className={styles.section}>
              <h4>{L("การสมัครงานกับบริษัท", "Applications to your company")}</h4>
              {candidate.applications.map((application) => (
                <details key={application.id} className={styles.application}>
                  <summary>
                    {application.job.title} · {L("สมัครเมื่อ", "Applied")} {formatDate(application.appliedAt)}
                  </summary>
                  {application.answers.length ? (
                    application.answers.map((answer, index) => (
                      <div key={index} className={styles.answer}>
                        <span>
                          Q{index + 1}. {answer.question}
                        </span>
                        <p>{Array.isArray(answer.answer) ? answer.answer.join(", ") : answer.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p className={styles.muted}>{L("ไม่มีคำถามคัดกรอง", "No screening questions")}</p>
                  )}
                </details>
              ))}
            </section>
          )}

          {candidate.invitationHistory.length > 0 && (
            <section className={styles.section}>
              <h4>{L("ประวัติคำเชิญ", "Invitation history")}</h4>
              <ul className={styles.plainList}>
                {candidate.invitationHistory.map((invitation) => (
                  <li key={invitation.id}>
                    {invitation.job.title} · {relativeDay(invitation.createdAt, isEn)} ·{" "}
                    <b>{isEn ? INVITATION_LABEL[invitation.status].en : INVITATION_LABEL[invitation.status].th}</b>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
