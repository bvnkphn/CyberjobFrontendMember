"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { CandidateDetailModal } from "@/components/candidates/CandidateDetailModal";
import { ErrorState, Loading, Notice, PersonAvatar, ScoreBadge } from "@/components/ui/ui";
import { MEMBER_URL } from "@/lib/config";
import { relativeDay, relativeTime } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useApi, useOwner } from "@/lib/owner";
import type { CandidateList, Dashboard, OwnerNotification } from "@/lib/types";
import "./owner-dashboard.css";

type Slide = { eyebrow: string; title: [string, string]; text: [string, string]; action: [string, string]; href: string };

/** Slide Banner โปรโมทและประชาสัมพันธ์ (Feature 1) */
const SLIDES: Slide[] = [
  {
    eyebrow: "CYBERJOB FOR BUSINESS",
    title: ["ค้นพบคนที่ใช่ ให้ทีมเติบโตได้ไกลกว่า", "Find the right people to grow your team"],
    text: ["จัดการประกาศงานและผู้สมัครทุกขั้นตอนในพื้นที่เดียว", "Manage job postings and candidates in one place"],
    action: ["สร้างประกาศงาน", "Post a job"],
    href: "/job-postings/create",
  },
  {
    eyebrow: "SMART MATCHING",
    title: ["ตัดสินใจได้เร็วขึ้นด้วย Matching Score", "Decide faster with Matching Score"],
    text: ["ดูคะแนนความเข้ากันพร้อมเหตุผล เทียบทักษะ ตำแหน่ง อายุงาน และเงินเดือน", "See why each candidate fits: skills, role, experience and salary"],
    action: ["ดูผู้สมัครทั้งหมด", "Browse candidates"],
    href: "/candidates",
  },
  {
    eyebrow: "PACKAGES",
    title: ["อัปเกรดเพื่อค้นหาผู้สมัครทั้งระบบ", "Upgrade to search every candidate"],
    text: ["แพ็กเกจ GOLD และ PLATINUM ค้นหาผู้สมัครเชิงรุกและประกาศงานได้มากขึ้น", "GOLD and PLATINUM unlock talent search and more job posts"],
    action: ["ดูแพ็กเกจ", "View packages"],
    href: "/packages",
  },
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    case: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
    invite: <><path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function OwnerDashboard() {
  const { isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const router = useRouter();
  const { me } = useOwner();
  const dashboard = useApi<Dashboard>("/owner/dashboard");
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selected, setSelected] = useState<{ candidateId: string; jobId?: string } | null>(null);

  // สไลด์เปลี่ยนเองทุก 6 วินาที
  useEffect(() => {
    const timer = setInterval(() => setSlide((current) => (current + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const talentSearch = me.plan.talentSearch;
  const source = talentSearch ? "cyberjob" : "company";
  const pool = useApi<CandidateList>("/owner/candidates", {
    query: { source, q: appliedQuery, pageSize: 5, sort: "newest" },
  });

  const search = (event: FormEvent) => {
    event.preventDefault();
    setAppliedQuery(query.trim());
  };

  if (dashboard.loading && !dashboard.data) {
    return <AppShell titleKey="sidebar.dashboard"><Loading /></AppShell>;
  }
  if (dashboard.error || !dashboard.data) {
    return (
      <AppShell titleKey="sidebar.dashboard">
        <ErrorState message={dashboard.error?.message ?? ""} onRetry={dashboard.reload} />
      </AppShell>
    );
  }

  const data = dashboard.data;
  const current = SLIDES[slide];
  const maxCount = Math.max(1, ...data.applicantsByPosition.map((group) => group.count));

  const kpis = [
    { icon: "case", label: L("ตำแหน่งงานที่ประกาศ", "Job posts"), value: data.stats.jobPosts, note: L(`ทั้งหมด ${data.stats.totalJobs} ประกาศ`, `${data.stats.totalJobs} in total`), href: "/job-postings" },
    { icon: "users", label: L("ผู้สมัครทั้งหมด", "Applicants"), value: data.stats.applicants, note: L(`+${data.stats.applicantsThisWeek} สัปดาห์นี้`, `+${data.stats.applicantsThisWeek} this week`), href: "/candidates?source=company" },
    { icon: "bookmark", label: L("ผู้สมัครที่บันทึกไว้", "Bookmarked"), value: data.stats.bookmarked, note: L("ดูรายชื่อ", "View list"), href: "/candidates/bookmarks" },
    { icon: "invite", label: L("คำเชิญที่ส่ง", "Invites"), value: data.stats.invites, note: L(`รอตอบกลับ ${data.stats.invitesPending}`, `${data.stats.invitesPending} awaiting`), href: "/candidates/invitations" },
  ];

  return (
    <AppShell titleKey="sidebar.dashboard">
      <div className="owner-content">
        {data.verificationStatus === "pending" && (
          <Notice tone="warning">
            {L(
              "บริษัทของคุณอยู่ระหว่างรอตรวจสอบ (1–3 วันทำการ) ระหว่างนี้บันทึกประกาศเป็นฉบับร่างได้ แต่ยังเผยแพร่ไม่ได้",
              "Your company is under review (1–3 business days). You can save drafts but cannot publish yet.",
            )}
          </Notice>
        )}

        <section className="owner-hero">
          <span>{current.eyebrow}</span>
          <h2>{L(...current.title)}</h2>
          <p>{L(...current.text)}</p>
          <button type="button" onClick={() => router.push(current.href)}>
            {L(...current.action)}
            <Icon name="arrow" size={16} />
          </button>
          <div className="owner-hero-art"><i /><i /><i /></div>
          <div className="owner-hero-dots" aria-label={L("เลือกแบนเนอร์", "Choose banner")}>
            {SLIDES.map((_, index) => (
              <button
                aria-label={`${L("แบนเนอร์", "Banner")} ${index + 1}`}
                className={index === slide ? "active" : ""}
                type="button"
                key={index}
                onClick={() => setSlide(index)}
              />
            ))}
          </div>
        </section>

        <section className="owner-welcome">
          <span>{L("ภาพรวมวันนี้", "Today's overview")}</span>
          <h1>{L(`ยินดีต้อนรับกลับมา, ${data.company.name}`, `Welcome back, ${data.company.name}`)}</h1>
          <p>{L("ดูความเคลื่อนไหวล่าสุดและจัดการการสรรหาของคุณได้จากที่นี่", "Track the latest activity and manage your hiring here")}</p>
        </section>

        {/* 1.1 สรุปข้อมูลสำคัญของบริษัท */}
        <section className="owner-kpis" aria-label={L("สรุปข้อมูล", "Summary")}>
          {kpis.map((card, index) => (
            <Link key={card.label} href={card.href} className={`tone-${index + 1}`}>
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.note}</small>
              </div>
              <i><Icon name={card.icon} size={24} /></i>
            </Link>
          ))}
        </section>

        {/* 1.2 ค้นหาผู้สมัคร */}
        <form className="owner-search" onSubmit={search} role="search">
          <label htmlFor="applicant-search">{L("ค้นหาผู้สมัคร", "Search candidates")}</label>
          <div>
            <span><Icon name="search" /></span>
            <input
              id="applicant-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={L("ค้นหาด้วยชื่อ ทักษะ หรือตำแหน่งงาน...", "Search by name, skill or position...")}
            />
            <button type="submit">{L("ค้นหา", "Search")}</button>
          </div>
        </form>

        {/* 1.3 ผู้สมัครทั้งหมดในระบบ */}
        <section className="owner-panel owner-applicants">
          <header>
            <div>
              <h2>
                {appliedQuery
                  ? L(`ผลการค้นหา “${appliedQuery}”`, `Results for “${appliedQuery}”`)
                  : talentSearch
                    ? L("ผู้สมัครทั้งหมดใน CyberJob", "All candidates on CyberJob")
                    : L("ผู้ที่สมัครงานของบริษัท", "Your applicants")}
              </h2>
              <span>{L(`${pool.data?.total ?? 0} รายการ`, `${pool.data?.total ?? 0} results`)}</span>
            </div>
            <Link href={`/candidates?source=${source}${appliedQuery ? `&q=${encodeURIComponent(appliedQuery)}` : ""}`}>
              {L("ดูทั้งหมด", "View all")} <Icon name="arrow" size={15} />
            </Link>
          </header>
          {!talentSearch && (
            <p className="owner-plan-hint">
              {L("แพ็กเกจ FREE เห็นเฉพาะผู้ที่สมัครงานของบริษัท", "The FREE plan only shows your own applicants")} ·{" "}
              <Link href="/packages">{L("อัปเกรดเพื่อค้นหาทั้งระบบ", "Upgrade for talent search")}</Link>
            </p>
          )}
          {pool.loading && !pool.data ? (
            <Loading />
          ) : pool.data && pool.data.items.length ? (
            <div className="owner-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{L("ชื่อผู้สมัคร", "Candidate")}</th>
                    <th>{L("ตำแหน่งที่ต้องการ", "Desired position")}</th>
                    <th>{L("ทักษะเด่น", "Top skills")}</th>
                    <th>{L("เข้าสู่ระบบ CyberJob", "Joined CyberJob")}</th>
                    <th>Resume Score</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pool.data.items.map((person) => (
                    <tr key={person.id}>
                      <td>
                        <PersonAvatar name={person.name} url={person.avatarUrl} size={32} />
                        <strong>{person.name}</strong>
                      </td>
                      <td>{person.position ?? "-"}</td>
                      <td>
                        <div className="owner-skill-list">
                          {person.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
                        </div>
                      </td>
                      <td>{relativeDay(person.registeredAt, isEn)}</td>
                      <td><ScoreBadge value={person.resumeScore} /></td>
                      <td>
                        <button type="button" aria-label={L(`ดูข้อมูล ${person.name}`, `View ${person.name}`)} onClick={() => setSelected({ candidateId: person.id })}>
                          <Icon name="chevron" size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="owner-empty">
              <Icon name="search" size={30} />
              <strong>{appliedQuery ? L("ไม่พบผู้สมัครที่ตรงกับคำค้น", "No matching candidates") : L("ยังไม่มีผู้สมัคร", "No candidates yet")}</strong>
              <span>{L("ลองเปลี่ยนคำค้นหาแล้วค้นหาอีกครั้ง", "Try a different keyword")}</span>
            </div>
          )}
        </section>

        <div className="owner-insight-grid">
          {/* 1.4 ผู้สมัครแบ่งตามตำแหน่ง */}
          <section className="owner-panel owner-position">
            <header>
              <h2>{L("ผู้สมัครแบ่งตามตำแหน่ง", "Applicants by position")}</h2>
              <Link href="/job-postings">{L("ดูทั้งหมด", "View all")} <Icon name="arrow" size={14} /></Link>
            </header>
            {data.applicantsByPosition.length ? (
              <div>
                {data.applicantsByPosition.map((group) => (
                  <article key={group.job.id}>
                    <Link href={`/job-postings?job=${group.job.id}`} className="owner-position-title">{group.job.title}</Link>
                    <strong>{L(`${group.count} คน`, `${group.count} applicants`)}</strong>
                    <div><i style={{ width: `${(group.count / maxCount) * 100}%` }} /></div>
                    <ul className="owner-position-people">
                      {group.applicants.map((person) => (
                        <li key={person.applicationId}>
                          <PersonAvatar name={person.name} url={person.avatarUrl} size={30} />
                          <span>
                            <b>{person.name}</b>
                            <small>{person.position ?? "-"}</small>
                          </span>
                          <ScoreBadge value={person.resumeScore} label="Resume Score" />
                          <button type="button" onClick={() => setSelected({ candidateId: person.candidateId, jobId: person.job.id })}>
                            {L("ดูรายละเอียด", "Details")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : (
              <div className="owner-empty"><strong>{L("ยังไม่มีผู้สมัคร", "No applicants yet")}</strong></div>
            )}
          </section>

          {/* 1.5 การแจ้งเตือนล่าสุด */}
          <Notifications items={data.notifications} isEn={isEn} />
        </div>

        {/* 1.6 ผู้สมัครล่าสุด */}
        <section className="owner-panel owner-applicants">
          <header>
            <div>
              <h2>{L("ผู้สมัครล่าสุด", "Latest candidates")}</h2>
              <span>{L("เรียงตามวันและเวลาที่สมัคร", "Sorted by application date")}</span>
            </div>
            <Link href="/candidates?source=company">{L("ดูทั้งหมด", "View all")} <Icon name="arrow" size={15} /></Link>
          </header>
          {data.latestApplicants.length ? (
            <div className="owner-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{L("ชื่อผู้สมัคร", "Candidate")}</th>
                    <th>{L("ตำแหน่งที่สมัคร", "Applied for")}</th>
                    <th>{L("วันที่สมัคร", "Applied")}</th>
                    <th>Matching Score</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.latestApplicants.map((person) => (
                    <tr key={person.applicationId}>
                      <td>
                        <PersonAvatar name={person.name} url={person.avatarUrl} size={32} />
                        <strong>{person.name}</strong>
                      </td>
                      <td>{person.job.title}</td>
                      <td>{relativeDay(person.appliedAt, isEn)}</td>
                      <td><ScoreBadge value={person.matchingScore} /></td>
                      <td>
                        <button type="button" aria-label={L(`ดูข้อมูล ${person.name}`, `View ${person.name}`)} onClick={() => setSelected({ candidateId: person.candidateId, jobId: person.job.id })}>
                          <Icon name="chevron" size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="owner-empty"><strong>{L("ยังไม่มีผู้สมัคร", "No applicants yet")}</strong></div>
          )}
        </section>

        {/* 1.7 ช่วยเหลือและความเป็นส่วนตัว */}
        <section className="owner-panel owner-help">
          <header><h2><Icon name="help" size={18} /> {L("ช่วยเหลือและความเป็นส่วนตัว", "Help & privacy")}</h2></header>
          <div>
            <Link href="/support">{L("ติดต่อฝ่ายสนับสนุน", "Contact support")}</Link>
            <a href={`${MEMBER_URL}/terms`} target="_blank" rel="noreferrer">{L("ข้อตกลงการใช้บริการ", "Terms of service")}</a>
            <a href={`${MEMBER_URL}/privacy`} target="_blank" rel="noreferrer">{L("นโยบายความเป็นส่วนตัว", "Privacy policy")}</a>
          </div>
        </section>
      </div>

      {selected && (
        <CandidateDetailModal
          candidateId={selected.candidateId}
          jobId={selected.jobId}
          onClose={() => setSelected(null)}
          onChanged={dashboard.reload}
        />
      )}
    </AppShell>
  );
}

function Notifications({ items, isEn }: { items: OwnerNotification[]; isEn: boolean }) {
  const L = (th: string, en: string) => (isEn ? en : th);
  const tone = { application: ["green", "users"], invitation_accepted: ["blue", "check"], invitation_declined: ["amber", "x"] } as const;
  return (
    <section className="owner-panel owner-notifications">
      <header>
        <h2><Icon name="bell" size={18} /> {L("การแจ้งเตือนล่าสุด", "Recent notifications")}</h2>
      </header>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span className={tone[item.type][0]}><Icon name={tone[item.type][1]} size={17} /></span>
              <Link href={item.link}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <small>{relativeTime(item.createdAt, isEn)}</small>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="owner-empty"><strong>{L("ยังไม่มีการแจ้งเตือน", "No notifications yet")}</strong></div>
      )}
    </section>
  );
}
