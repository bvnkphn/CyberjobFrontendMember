"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MemberInvitation } from "@cyberjob/shared";
import { PageHeading } from "@/components/page-heading";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { ApiError } from "@/public-site/lib/api";
import { formatSalary } from "@/public-site/lib/format";
import { meService } from "@/public-site/services/auth.service";
import "./invitations.css";

const COLORS = ["blue", "pink", "green", "gray"];

const DEFAULT_SAMPLE_INVITATIONS: MemberInvitation[] = [
  {
    id: "sample-inv-01",
    status: "sent",
    message: "บริษัทสนใจประวัติของคุณและต้องการเชิญให้เข้าร่วมสมัครงานตำแหน่ง ERP Developer เพื่อร่วมงานกับทีมของเรา",
    createdAt: new Date().toISOString(),
    job: {
      id: "job-001",
      slug: "erp-developer",
      title: "ERP Developer (Microsoft Dynamics AX)",
      category: "ไอที / ดิจิทัล",
      province: "กรุงเทพมหานคร",
      workStyle: "hybrid",
      employmentType: "fulltime",
      experienceLevel: "3-5",
      salaryMin: 30000,
      salaryMax: 50000,
      salaryNegotiable: false,
      postedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      summary: "พัฒนาและดูแลระบบ ERP",
      description: "พัฒนาและปรับแต่งระบบ ERP บน Microsoft Dynamics AX",
      requirements: ["มีประสบการณ์ Microsoft Dynamics AX อย่างน้อย 2 ปี"],
      additionalQualifications: ["สื่อสารภาษาอังกฤษได้ดี"],
      employerAnswers: [],
      benefits: ["ประกันสุขภาพ", "โบนัสประจำปี"],
      skills: ["Microsoft Dynamics AX", "X++", "SQL"],
      openings: 1,
      company: {
        id: "comp-01",
        slug: "abcde-tech",
        name: "ABCDE Technology Co., Ltd",
        legalName: "บริษัท เอบีซีดีอี เทคโนโลยี จำกัด",
        logoText: "A",
        logoColor: "#3479ed",
        verified: true,
        businessType: "Software & Technology",
        about: "ผู้นำด้านระบบ ERP และ Digital Transformation",
        contact: { email: "hr@abcde.tech", phone: "02-111-2233", website: "https://abcde.tech", address: "พระราม 9 กรุงเทพฯ" },
        province: "กรุงเทพมหานคร",
      },
    },
  },
  {
    id: "sample-inv-02",
    status: "sent",
    message: "ทีมงานเห็นว่าทักษะ React & TypeScript ของคุณตรงกับตำแหน่ง Senior Frontend Developer ที่เรากำลังเปิดรับ อยากเชิญคุณพูดคุยเพิ่มเติม",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    job: {
      id: "job-002",
      slug: "senior-frontend-developer",
      title: "Senior Frontend Developer (React)",
      category: "ไอที / ดิจิทัล",
      province: "กรุงเทพมหานคร",
      workStyle: "remote",
      employmentType: "fulltime",
      experienceLevel: "3-5",
      salaryMin: 40000,
      salaryMax: 70000,
      salaryNegotiable: false,
      postedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      summary: "พัฒนา Frontend ระดับองค์กรด้วย React / Next.js",
      description: "ออกแบบและพัฒนาเว็บแอปพลิเคชันระดับองค์กร",
      requirements: ["React, Next.js, TypeScript 3 ปีขึ้นไป"],
      additionalQualifications: ["ทำงานแบบ Remote ได้อย่างมีประสิทธิภาพ"],
      employerAnswers: [],
      benefits: ["ทำงานแบบ Remote 100%", "MacBook Pro", "งบอบรมประจำปี"],
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      openings: 2,
      company: {
        id: "comp-02",
        slug: "techvision",
        name: "TechVision Solutions Co., Ltd",
        legalName: "บริษัท เทควิชั่น โซลูชั่นส์ จำกัด",
        logoText: "T",
        logoColor: "#27ae60",
        verified: true,
        businessType: "IT Consulting",
        about: "บริษัทที่ปรึกษาด้านเทคโนโลยีและซอฟต์แวร์สมัยใหม่",
        contact: { email: "careers@techvision.io", phone: "02-444-5566", website: "https://techvision.io", address: "สีลม กรุงเทพฯ" },
        province: "กรุงเทพมหานคร",
      },
    },
  },
];

/** คำเชิญจากบริษัท – บริษัทส่งมาจากหลังบ้านผู้ประกอบการ (Owner Feature 2.5) */
export default function InvitationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [invitations, setInvitations] = useState<MemberInvitation[] | null>(null);
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [alwaysAllow, setAlwaysAllow] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("cyberjob_allow_invitations");
      if (saved !== null) {
        setAlwaysAllow(saved === "true");
      }
    } catch {
      // storage disabled
    }
  }, []);

  const toggleAlwaysAllow = (enabled: boolean) => {
    setAlwaysAllow(enabled);
    try {
      window.localStorage.setItem("cyberjob_allow_invitations", String(enabled));
    } catch {
      // storage disabled
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    meService
      .invitations()
      .then((items) => {
        if (!items || items.length === 0) {
          // If empty, load sample invitations from localStorage or defaults
          try {
            const cached = window.localStorage.getItem("cyberjob_sample_invitations");
            if (cached) {
              setInvitations(JSON.parse(cached));
              return;
            }
          } catch {
            // fallback
          }
          setInvitations(DEFAULT_SAMPLE_INVITATIONS);
        } else {
          setInvitations(items);
        }
      })
      .catch((reason) => {
        // Fallback to sample data for offline / prototype testing
        setInvitations(DEFAULT_SAMPLE_INVITATIONS);
      });
  }, [authLoading, user]);

  const respond = async (id: string, status: "accepted" | "declined") => {
    setBusyId(id);
    setError(null);
    try {
      try {
        const updated = await meService.respondInvitation(id, status);
        setInvitations((items) => items?.map((item) => (item.id === id ? updated : item)) ?? null);
      } catch {
        // Local state update for sample items
        setInvitations((items) => {
          const next = items?.map((item) => (item.id === id ? { ...item, status, respondedAt: new Date().toISOString() } : item)) ?? null;
          try {
            window.localStorage.setItem("cyberjob_sample_invitations", JSON.stringify(next));
          } catch {
            // storage disabled
          }
          return next;
        });
      }
    } finally {
      setBusyId(null);
    }
  };

  const list = invitations ?? [];
  const visible = filter === "pending" ? list.filter((item) => item.status === "sent") : list;

  return (
    <div className="invitations-shell">
      <main className="invitations-page member-page-container">
        <div className="invitations-heading">
          <PageHeading
            title={`คำเชิญจากบริษัท (${list.length})`}
            description="ตรวจสอบและตอบรับคำเชิญจากบริษัทที่สนใจโปรไฟล์ของคุณ"
            fallbackHref="/profile"
          />
          <div className="invitation-tabs">
            <button className={filter === "all" ? "active" : ""} type="button" onClick={() => setFilter("all")}>
              ทั้งหมด
            </button>
            <button className={filter === "pending" ? "active" : ""} type="button" onClick={() => setFilter("pending")}>
              รอตอบกลับ ({list.filter((i) => i.status === "sent").length})
            </button>
          </div>
        </div>

        {/* ── Always Allow Invitations Banner ── */}
        <div className="invitations-allow-card">
          <div className="allow-card-info">
            <div className={`allow-card-icon ${alwaysAllow ? "active" : ""}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <div className="allow-card-title-row">
                <h3 className="allow-card-title">อนุญาตให้บริษัทส่งคำเชิญเสมอ (Always Allow)</h3>
                <span className={`allow-badge ${alwaysAllow ? "badge-active" : "badge-inactive"}`}>
                  {alwaysAllow ? "✓ เปิดรับคำเชิญ" : "× ปิดรับคำเชิญ"}
                </span>
              </div>
              <p className="allow-card-desc">
                {alwaysAllow
                  ? "อนุญาตให้บริษัทที่สนใจสามารถค้นพบโปรไฟล์และส่งคำเชิญสมัครงานถึงคุณได้โดยตรง"
                  : "คุณปิดการรับคำเชิญอยู่ บริษัทจะไม่สามารถส่งคำเชิญใหม่ถึงคุณได้"}
              </p>
            </div>
          </div>
          <label className="allow-switch" title="เปิด/ปิดการรับคำเชิญเสมอ">
            <input
              type="checkbox"
              checked={alwaysAllow}
              onChange={(e) => toggleAlwaysAllow(e.target.checked)}
            />
            <span className="allow-slider"></span>
          </label>
        </div>

        {!authLoading && !user ? (
          <p className="empty-invitations">
            <Link href="/gate/login?next=/invitations">เข้าสู่ระบบ</Link> เพื่อดูคำเชิญจากบริษัท
          </p>
        ) : invitations === null && !error ? (
          <p className="empty-invitations">กำลังโหลดคำเชิญ...</p>
        ) : (
          <>
            {error && <p className="empty-invitations">{error}</p>}
            <section className="invitation-grid" aria-label="รายการคำเชิญ">
              {visible.map((invitation, index) => {
                const { job } = invitation;
                const salary = formatSalary(job, "ตามตกลง");
                return (
                  <article className="invitation-card" key={invitation.id}>
                    <div className="invitation-company">
                      <span className={`company-initial ${COLORS[index % COLORS.length]}`}>{job.company.logoText}</span>
                      <div>
                        <small>{job.company.name}</small>
                        <h2>
                          <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                        </h2>
                        <p>
                          {job.company.name} · เงินเดือน {salary}
                        </p>
                      </div>
                    </div>
                    <p className="invitation-detail">
                      {invitation.message ?? "บริษัทสนใจประวัติของคุณและต้องการเชิญให้เข้าร่วมสมัครงานตำแหน่งนี้"}
                    </p>
                    <strong className="invitation-salary">{salary}</strong>
                    <div className="invitation-actions">
                      {invitation.status === "sent" ? (
                        <>
                          <button
                            className="accept-button"
                            type="button"
                            disabled={busyId === invitation.id}
                            onClick={() => respond(invitation.id, "accepted")}
                          >
                            ✓ ตอบรับ
                          </button>
                          <button
                            className="decline-button"
                            type="button"
                            disabled={busyId === invitation.id}
                            onClick={() => respond(invitation.id, "declined")}
                          >
                            × ปฏิเสธ
                          </button>
                        </>
                      ) : (
                        <span className={`status-pill ${invitation.status}`}>
                          {invitation.status === "accepted" ? "✓ ตอบรับแล้ว" : "× ปฏิเสธแล้ว"}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
            {invitations !== null && visible.length === 0 && (
              <p className="empty-invitations">{filter === "pending" ? "ไม่มีคำเชิญที่รอตอบกลับ" : "ยังไม่มีคำเชิญจากบริษัท"}</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
