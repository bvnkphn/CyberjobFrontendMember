"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import type { MemberInvitation } from "@cyberjob/shared";
import { PageHeading } from "@/components/page-heading";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { formatSalary } from "@/public-site/lib/format";
import { meService } from "@/public-site/services/auth.service";
import "./invitations.css";

const COLORS = ["blue", "pink", "green", "gray"];

const DEMO_INVITATIONS: MemberInvitation[] = [
  {
    id: "demo-inv-1",
    status: "sent",
    message: "บริษัท CyberPay สนใจประสบการณ์การทำงานของคุณ และขอเรียนเชิญเข้าร่วมพิจารณาสัมภาษณ์ในตำแหน่ง Senior Full-Stack Developer",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    job: {
      id: "demo-job-1",
      slug: "senior-full-stack-developer",
      title: "Senior Full-Stack Developer (Node.js & React)",
      company: {
        id: "cyberpay",
        slug: "cyberpay",
        name: "CyberPay Co., Ltd.",
        legalName: "CyberPay Thailand Co., Ltd.",
        logoText: "CP",
        logoColor: "#3479ed",
        verified: true,
        businessType: "FinTech & Payments",
        about: "ผู้นำด้านโครงสร้างพื้นฐานระบบการชำระเงินดิจิทัล",
        contact: {
          email: "hr@cyberpay.asia",
          phone: "02-6861-209",
          website: "https://cyberpay.asia",
          address: "กรุงเทพมหานคร",
        },
        province: "กรุงเทพมหานคร",
      },
      category: "IT & Software",
      province: "กรุงเทพมหานคร",
      workStyle: "hybrid",
      employmentType: "fulltime",
      experienceLevel: "3-5",
      salaryMin: 65000,
      salaryMax: 95000,
      postedAt: new Date().toISOString(),
      summary: "ร่วมพัฒนาโครงสร้างพื้นฐานด้านการชำระเงินและระบบ FinTech ระดับสากล",
      description: "ร่วมพัฒนาโครงสร้างพื้นฐานด้านการชำระเงินและระบบ FinTech ระดับสากล",
      requirements: ["TypeScript", "Next.js", "NestJS", "PostgreSQL"],
      additionalQualifications: [],
      employerAnswers: [],
      benefits: ["ประกันสุขภาพกลุ่ม", "โบนัสประจำปี", "ทำงานแบบ Hybrid"],
      skills: ["React", "Node.js", "TypeScript"],
      openings: 2,
    },
  },
  {
    id: "demo-inv-2",
    status: "sent",
    message: "ฝ่ายบุคคลเห็นข้อมูลทักษะของคุณในระบบค้นหาผู้สมัครแล้วมีความเหมาะสมกับโปรเจกต์ใหม่ของบริษัท จึงขอเชิญสมัครตำแหน่งนี้เพื่อพูดคุยรายละเอียดเบื้องต้น",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    job: {
      id: "demo-job-2",
      slug: "devops-cloud-engineer",
      title: "DevOps & Cloud Engineer (AWS / Kubernetes)",
      company: {
        id: "cloudtech",
        slug: "cloudtech",
        name: "CloudTech Solutions",
        legalName: "CloudTech Solutions Co., Ltd.",
        logoText: "CT",
        logoColor: "#059669",
        verified: true,
        businessType: "Cloud & Infrastructure",
        about: "ที่ปรึกษาและผู้ให้บริการโซลูชันคลาวด์ครบวงจร",
        contact: {
          email: "careers@cloudtech.example",
          phone: "02-000-0000",
          website: "https://cloudtech.example",
          address: "กรุงเทพมหานคร",
        },
        province: "กรุงเทพมหานคร",
      },
      category: "DevOps & Cloud",
      province: "กรุงเทพมหานคร",
      workStyle: "remote",
      employmentType: "fulltime",
      experienceLevel: "3-5",
      salaryMin: 70000,
      salaryMax: 110000,
      postedAt: new Date().toISOString(),
      summary: "ดูแลระบบคลาวด์ CI/CD pipeline และความปลอดภัยของระบบ",
      description: "ดูแลระบบคลาวด์ CI/CD pipeline และความปลอดภัยของระบบ",
      requirements: ["Kubernetes", "AWS", "Docker", "Terraform"],
      additionalQualifications: [],
      employerAnswers: [],
      benefits: ["ทำงาน Remote 100%", "ค่าคอร์สเรียนและสอบใบรับรอง"],
      skills: ["AWS", "Kubernetes", "Docker"],
      openings: 1,
    },
  },
];

/** คำเชิญจากบริษัท – เชื่อมต่อ API จริง (/api/me/invitations) พร้อมระบบรองรับผู้ประกอบการ (Owner Waiting System) */
export default function InvitationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [invitations, setInvitations] = useState<MemberInvitation[] | null>(null);
  const [demoList, setDemoList] = useState<MemberInvitation[]>(DEMO_INVITATIONS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [alwaysAllow, setAlwaysAllow] = useState<boolean>(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

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

  const fetchInvitations = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const items = await meService.invitations();
      setInvitations(items ?? []);
    } catch (err) {
      console.warn("Could not fetch invitations from API:", err);
      setError("ไม่สามารถโหลดคำเชิญจากเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      setInvitations([]);
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchInvitations();
  }, [authLoading, user, fetchInvitations]);

  const respond = async (id: string, status: "accepted" | "declined") => {
    setBusyId(id);
    setError(null);

    // If currently exploring in Demo Preview mode
    if (isDemoMode) {
      setTimeout(() => {
        setDemoList((items) =>
          items.map((item) =>
            item.id === id
              ? { ...item, status, respondedAt: new Date().toISOString() }
              : item
          )
        );
        setBusyId(null);
        setFeedbackToast(status === "accepted" ? "ตอบรับคำเชิญตัวอย่างแล้ว" : "ปฏิเสธคำเชิญตัวอย่างแล้ว");
        setTimeout(() => setFeedbackToast(null), 3000);
      }, 400);
      return;
    }

    // Live API mode
    try {
      const updated = await meService.respondInvitation(id, status);
      setInvitations((items) => items?.map((item) => (item.id === id ? updated : item)) ?? null);
      setFeedbackToast(status === "accepted" ? "ตอบรับคำเชิญจากบริษัทเรียบร้อยแล้ว" : "ปฏิเสธคำเชิญเรียบร้อยแล้ว");
      setTimeout(() => setFeedbackToast(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการตอบรับคำเชิญ");
    } finally {
      setBusyId(null);
    }
  };

  const currentList = isDemoMode ? demoList : (invitations ?? []);
  const visible = filter === "pending" ? currentList.filter((item) => item.status === "sent") : currentList;
  const pendingCount = currentList.filter((i) => i.status === "sent").length;

  return (
    <div className="invitations-shell">
      <main className="invitations-page member-page-container">
        {/* Toast Feedback */}
        {feedbackToast && (
          <div className="invitations-toast" role="status">
            <span>✓</span> {feedbackToast}
          </div>
        )}

        {/* ── Heading & Filter ── */}
        <div className="invitations-heading">
          <PageHeading
            title={`คำเชิญจากบริษัท (${currentList.length})`}
            description="ตรวจสอบและตอบรับคำเชิญจากบริษัทหรือผู้ประกอบการที่สนใจโปรไฟล์ของคุณ"
            fallbackHref="/profile"
          />
          <div className="invitations-heading-actions">
            <div className="invitation-tabs">
              <button
                className={filter === "all" ? "active" : ""}
                type="button"
                onClick={() => setFilter("all")}
              >
                ทั้งหมด ({currentList.length})
              </button>
              <button
                className={filter === "pending" ? "active" : ""}
                type="button"
                onClick={() => setFilter("pending")}
              >
                รอตอบกลับ ({pendingCount})
              </button>
            </div>

            {user && (
              <button
                type="button"
                className={`refresh-api-btn ${isRefreshing ? "spinning" : ""}`}
                onClick={fetchInvitations}
                disabled={isRefreshing}
                title="รีเฟรชตรวจสอบคำเชิญจากระบบ API"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>{isRefreshing ? "กำลังตรวจสอบ..." : "รีเฟรช"}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── API Status Bar ── */}
        <div className="invitations-api-bar">
          <div className="api-bar-left">
            <span className="api-live-dot" />
            <span className="api-bar-text">
              ระบบเชื่อมต่อ API: <strong>/api/me/invitations</strong>
            </span>
            <span className="api-status-chip">ออนไลน์ (Active)</span>
          </div>
        </div>

        {/* ── Demo Mode Active Banner ── */}
        {isDemoMode && (
          <div className="demo-banner">
            <div className="demo-banner-content">
              <strong>✨ โหมดตัวอย่างคำเชิญ (Demo Preview Mode):</strong>
              <span>
                กำลังแสดงรูปแบบคำเชิญที่ผู้ประกอบการ (Owner) ส่งถึงผู้สมัคร คุณสามารถทดสอบกด &quot;ตอบรับ&quot; หรือ &quot;ปฏิเสธ&quot; ได้เสมือนจริง
              </span>
            </div>
            <button
              type="button"
              className="demo-close-btn"
              onClick={() => setIsDemoMode(false)}
            >
              ปิดโหมดตัวอย่าง
            </button>
          </div>
        )}

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
                <h3 className="allow-card-title">อนุญาตให้ผู้ประกอบการส่งคำเชิญเสมอ (Always Allow)</h3>
                <span className={`allow-badge ${alwaysAllow ? "badge-active" : "badge-inactive"}`}>
                  {alwaysAllow ? "✓ เปิดรับคำเชิญ" : "× ปิดรับคำเชิญ"}
                </span>
              </div>
              <p className="allow-card-desc">
                {alwaysAllow
                  ? "เปิดให้ผู้ประกอบการหรือ HR ที่ค้นพบโปรไฟล์ของคุณผ่านระบบค้นหาผู้สมัคร (Owner) สามารถส่งข้อเสนอและคำเชิญสัมภาษณ์ถึงคุณได้โดยตรง"
                  : "คุณปิดการรับคำเชิญอยู่ บริษัทจะไม่สามารถค้นพบและส่งคำเชิญใหม่ถึงคุณได้"}
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

        {/* ── Authentication & Main Content ── */}
        {!authLoading && !user ? (
          <div className="invitations-login-card">
            <div className="login-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h3>กรุณาเข้าสู่ระบบเพื่อดูคำเชิญจากบริษัท</h3>
            <p>เข้าสู่ระบบสมาชิก CyberJob เพื่อตรวจสอบคำเชิญและข้อเสนองานที่ส่งถึงคุณโดยตรง</p>
            <Link className="primary-login-btn" href="/gate/login?next=/invitations">
              เข้าสู่ระบบตอนนี้
            </Link>
          </div>
        ) : invitations === null && !error && !isDemoMode ? (
          <div className="invitations-loading">
            <div className="loading-spinner" />
            <p>กำลังเชื่อมต่อระบบและดึงข้อมูลคำเชิญล่าสุด...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="invitations-error-banner">
                <span>⚠️ {error}</span>
                <button type="button" onClick={fetchInvitations}>
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            )}

            {/* If there are invitations (either Real or Demo) */}
            {visible.length > 0 ? (
              <section className="invitation-grid" aria-label="รายการคำเชิญ">
                {visible.map((invitation, index) => {
                  const { job } = invitation;
                  const salary = formatSalary(job, "ตามตกลง");
                  return (
                    <article className="invitation-card" key={invitation.id}>
                      <div className="invitation-card-top">
                        <div className="invitation-company">
                          <span className={`company-initial ${COLORS[index % COLORS.length]}`}>
                            {job.company.logoText}
                          </span>
                          <div className="company-text-meta">
                            <div className="company-name-row">
                              <small>{job.company.name}</small>
                              {job.company.verified && (
                                <span className="verified-badge" title="องค์กรยืนยันตัวตนแล้ว">✓</span>
                              )}
                            </div>
                            <h2>
                              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                            </h2>
                            <p>
                              {job.company.name} · {job.province ?? "ไม่ระบุพื้นที่"}
                            </p>
                          </div>
                        </div>

                        <span className={`invitation-type-tag ${job.workStyle ?? "hybrid"}`}>
                          {job.workStyle === "remote" ? "Remote" : job.workStyle === "onsite" ? "Onsite" : "Hybrid"}
                        </span>
                      </div>

                      <div className="invitation-body">
                        <div className="invitation-quote">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" opacity="0.25">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                          </svg>
                          <p>
                            {invitation.message ??
                              "บริษัทสนใจประวัติของคุณและต้องการเชิญให้เข้าร่วมสมัครงานหรือพูดคุยสัมภาษณ์ตำแหน่งนี้"}
                          </p>
                        </div>
                      </div>

                      <div className="invitation-card-footer">
                        <div className="salary-block">
                          <span className="salary-label">ข้อเสนอเงินเดือน</span>
                          <strong className="invitation-salary">{salary}</strong>
                        </div>

                        <div className="invitation-actions">
                          {invitation.status === "sent" ? (
                            <>
                              <button
                                className="accept-button"
                                type="button"
                                disabled={busyId === invitation.id}
                                onClick={() => respond(invitation.id, "accepted")}
                              >
                                {busyId === invitation.id ? "กำลังบันทึก..." : "✓ ตอบรับ"}
                              </button>
                              <button
                                className="decline-button"
                                type="button"
                                disabled={busyId === invitation.id}
                                onClick={() => respond(invitation.id, "declined")}
                              >
                                {busyId === invitation.id ? "..." : "× ปฏิเสธ"}
                              </button>
                            </>
                          ) : (
                            <span className={`status-pill ${invitation.status}`}>
                              {invitation.status === "accepted" ? "✓ ตอบรับแล้ว" : "× ปฏิเสธแล้ว"}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : (
              /* ── ระบบรอรับคำเชิญจากผู้ประกอบการ (Owner Waiting System) ── */
              <div className="owner-waiting-card">
                <h3 className="waiting-title">
                  {filter === "pending"
                    ? "ไม่มีคำเชิญที่รอการตอบกลับ"
                    : "ระบบกำลังรอรับคำเชิญจากผู้ประกอบการ (Owner)"}
                </h3>

                <p className="waiting-desc">
                  เมื่อฝ่ายบุคคลหรือผู้ประกอบการในระบบ <strong>CyberJob Owner</strong> ค้นพบโปรไฟล์ของคุณผ่านระบบค้นหาผู้สมัคร (Candidate Pool) และสนใจทักษะหรือเรซูเม่ คำเชิญสมัครงานและข้อเสนอสัมภาษณ์จะถูกส่งมายังกล่องนี้โดยตรง
                </p>

                {/* Readiness Step Cards */}
                <div className="waiting-steps-grid">
                  <div className="step-card">
                    <div className="step-num">1</div>
                    <div className="step-info">
                      <h4>เพิ่มความสมบูรณ์ของเรซูเม่</h4>
                      <p>ผู้ประกอบการจะคัดกรองจากทักษะ ประสบการณ์ทำงาน และผลงานที่ใส่ไว้ในระบบ</p>
                      <Link href="/profile" className="step-link">
                        จัดการเรซูเม่ &gt;
                      </Link>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-num">2</div>
                    <div className="step-info">
                      <h4>เปิดรับคำเชิญ Always Allow</h4>
                      <p>ตรวจสอบให้แน่ใจว่าสวิตช์ &quot;เปิดรับคำเชิญ&quot; ด้านบนเปิดอยู่เพื่อให้บริษัทค้นพบ</p>
                      <span className="step-status">สถานะ: เปิดรับอยู่</span>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-num">3</div>
                    <div className="step-info">
                      <h4>ค้นหาและสมัครงานทันที</h4>
                      <p>ระหว่างรอคำเชิญ คุณสามารถค้นหาตำแหน่งงานแนะนำและส่งใบสมัครได้โดยตรง</p>
                      <Link href="/jobs" className="step-link">
                        ค้นหาตำแหน่งงาน &gt;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
