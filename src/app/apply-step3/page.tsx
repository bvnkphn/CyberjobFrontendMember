"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getApplicationReview,
  submitApplication,
  SAMPLE_JOBS,
  type ApplicationReview,
  type ApplicationQuestion,
} from "@/lib/member-api";
import "./apply-step3.css";

function IconChevron() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>;
}
function IconUser() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}
function IconArrowLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconDoc() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>;
}
function IconChat() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
function IconPdf() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 15h2" /><path d="M8 13h4" /></svg>;
}

function formatAnswer(q: ApplicationQuestion, answer: string | string[] | null | undefined): string {
  if (answer === null || answer === undefined || answer === "") return "";
  if (Array.isArray(answer)) return answer.length > 0 ? answer.join(", ") : "";
  if (q.questionType === "date" && answer) {
    try {
      const d = new Date(answer);
      const year = d.getFullYear() + 543;
      return `${d.getDate()} ${d.toLocaleDateString("th-TH", { month: "long" })} ${year}`;
    } catch { return answer; }
  }
  return String(answer);
}

function Footer() {
  return (
    <footer className="s3-footer">
      <div className="s3-footer-main">
        <div>
          <div className="s3-footer-brand">CYBER<span>JOB</span></div>
          <p className="s3-footer-about">เว็บหางานสำหรับคนทำงานเพื่อโอกาสเติบโตในบริษัทด้วยตำแหน่งที่เหมาะกับไลฟ์สไตล์ของคุณ</p>
        </div>
        <div className="s3-footer-links">
          <div className="s3-footer-col">
            <strong>ผู้หางาน</strong>
            <a href="/jobs">ค้นหางาน</a>
            <a href="/profile">โปรไฟล์</a>
            <a href="/saved-jobs">งานที่บันทึก</a>
            <a href="/applications">ประวัติการสมัครงาน</a>
          </div>
          <div className="s3-footer-col">
            <strong>ผู้ประกอบการ</strong>
            <a href="/register/business">ลงทะเบียนฟรี</a>
            <a href="/post-job">ลงประกาศงาน</a>
          </div>
          <div className="s3-footer-col">
            <strong>เกี่ยวกับเรา</strong>
            <a href="/contact">ติดต่อเรา</a>
          </div>
        </div>
      </div>
      <div className="s3-footer-bottom">
        <span>Copyright @ 2026 CYBERJOB Co, Ltd | All Rights Reserved.</span>
        <div className="s3-footer-bottom-links">
          <a href="/terms">ข้อกำหนดและเงื่อนไข</a>
          <a href="/security">ความปลอดภัย</a>
          <a href="/privacy">ความเป็นส่วนตัว</a>
        </div>
      </div>
    </footer>
  );
}

export default function ApplyStep3Page() {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);
  const [reviewError, setReviewError] = useState("");

  const [applicationId, setApplicationId] = useState("");
  const [jobId, setJobId] = useState("");
  const [resumeSource, setResumeSource] = useState<"cyberjob" | "upload">("cyberjob");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const appId = sessionStorage.getItem("apply-app-id");
    const jid = sessionStorage.getItem("apply-job-id");
    if (!appId || !jid) {
      router.replace("/apply-step1");
      return;
    }
    setApplicationId(appId);
    setJobId(jid);

    const job = SAMPLE_JOBS.find((j) => j.id === jid) ?? SAMPLE_JOBS[0];
    setJobTitle(job.title);
    setCompanyName(job.company);

    const savedResume = sessionStorage.getItem("apply-resume-source");
    if (savedResume === "upload" || savedResume === "cyberjob") setResumeSource(savedResume);
    const fname = sessionStorage.getItem("apply-resume-filename");
    if (fname) setUploadedFileName(fname);
    const savedAnswers = sessionStorage.getItem("apply-answers");
    if (savedAnswers) {
      try { setAnswers(JSON.parse(savedAnswers)); } catch { /* ignore */ }
    }

    setLoadingReview(true);
    getApplicationReview(appId)
      .then((review) => {
        const answerMap: Record<string, string | string[]> = {};
        for (const a of review.answers) {
          answerMap[a.questionId] = a.answer ?? "";
        }
        if (Object.keys(answerMap).length > 0) setAnswers(answerMap);
      })
      .catch((err) => setReviewError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoadingReview(false));
  }, [router]);

  const questions: ApplicationQuestion[] = (() => {
    if (!jobId) return [];
    const job = SAMPLE_JOBS.find((j) => j.id === jobId) ?? SAMPLE_JOBS[0];
    return job.questions;
  })();

  const summaryRows = useMemo(() => {
    return questions.map((q) => ({
      label: q.questionText,
      value: formatAnswer(q, answers[q.questionId]),
    }));
  }, [questions, answers]);

  const handleSubmit = async () => {
    if (!consent || !applicationId) return;
    setSubmitting(true);
    try {
      await submitApplication(applicationId, true);
      sessionStorage.removeItem("apply-app-id");
      sessionStorage.removeItem("apply-job-id");
      sessionStorage.removeItem("apply-answers");
      sessionStorage.removeItem("apply-resume-source");
      sessionStorage.removeItem("apply-resume-filename");
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งใบสมัคร");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <header className="s3-navbar">
          <div className="s3-navbar-inner">
            <a href="/" className="s3-nav-brand">CYBER<span>JOB</span></a>
            <nav className="s3-nav-links"><a href="/jobs">ค้นหางาน</a></nav>
          </div>
        </header>
        <main className="s3-main s3-success-wrap">
          <div className="s3-card">
            <div className="s3-success">
              <div className="s3-success-icon"><IconCheck /></div>
              <h2>สมัครงานสำเร็จ!</h2>
              <p className="s3-success-job">คุณได้สมัครงานตำแหน่ง <strong>{jobTitle}</strong></p>
              <p>ใบสมัครของคุณถูกส่งเรียบร้อยแล้ว ทางบริษัทจะตรวจสอบและติดต่อกลับโดยเร็วที่สุด</p>
              <p style={{ fontSize: 13, color: "#aab2c0" }}>คุณสามารถตรวจสอบสถานะการสมัครได้ที่หน้า &quot;งานของฉัน&quot;</p>
              <div className="s3-success-actions">
                <a href="/my-jobs" className="primary-button">ดูสถานะการสมัคร</a>
                <a href="/jobs" className="s3-outline-btn">ค้นหางานเพิ่มเติม</a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const companyInitial = companyName ? companyName.charAt(0) : "C";

  return (
    <>
      {/* ═══ Navbar ═══ */}
      <header className="s3-navbar">
        <div className="s3-navbar-inner">
          <a href="/" className="s3-nav-brand">CYBER<span>JOB</span></a>
          <button className="s3-mobile-toggle" type="button" onClick={() => setNavOpen(!navOpen)} aria-label="เปิดเมนู">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <nav className={`s3-nav-links ${navOpen ? "is-open" : ""}`}>
            <a href="/">หน้าแรก</a>
            <a href="/jobs">ค้นหางาน</a>
            <a href="/profile/edit">ฝากประวัติ</a>
            <a href="/articles">บทความ</a>
            <a href="/about">เกี่ยวกับเรา</a>
            <a href="/contact">ติดต่อเรา</a>
            <button className="s3-nav-lang" type="button">ภาษาไทย <IconChevron /></button>
            <div className="s3-nav-profile">
              <button className="s3-nav-avatar" type="button" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="เมนูบัญชี">
                <IconUser />
              </button>
              {dropdownOpen && (
                <nav className="s3-nav-dropdown">
                  <div className="s3-nav-dropdown-header">
                    <strong>ผู้ใช้</strong>
                    <small></small>
                  </div>
                  <a href="/profile"><IconUser /> โปรไฟล์</a>
                  <a href="/profile/edit"><IconDoc /> แก้ไขประวัติ</a>
                  <hr />
                  <a href="/" className="danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" /></svg> ออกจากระบบ</a>
                </nav>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ═══ Header / Job Card ═══ */}
      <div className="s3-header">
        <button className="s3-back" type="button" onClick={() => history.back()}>
          <IconArrowLeft /> กลับ
        </button>
        <div className="s3-job-card">
          <div className="s3-job-logo">{companyInitial}</div>
          <div className="s3-job-text">
            <p className="s3-job-eyebrow">สมัครงานตำแหน่งนี้</p>
            <h1>{jobTitle}</h1>
            <p className="s3-job-company">สวัสดี {companyName}</p>
            <p className="s3-job-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {SAMPLE_JOBS.find((j) => j.id === jobId)?.location ?? ""}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Step Indicator ═══ */}
      <div className="s3-steps">
        <div className="s3-steps-track">
          <div className="s3-step done">
            <div className="s3-step-circle done"><IconCheck /></div>
            <span className="s3-step-text">1 เรซูเม่</span>
            <div className="s3-step-line done" />
          </div>
          <div className="s3-step done">
            <div className="s3-step-circle done"><IconCheck /></div>
            <span className="s3-step-text">2 คำถาม</span>
            <div className="s3-step-line done" />
          </div>
          <div className="s3-step active">
            <div className="s3-step-circle active">3</div>
            <span className="s3-step-text">3 ตรวจสอบ & ส่ง</span>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <main className="s3-main">
        <div className="s3-card">
          <h2>ตรวจสอบ & ส่ง</h2>
          <p className="s3-card-desc">กรุณาตรวจสอบข้อมูลทั้งหมดก่อนกดยืนยันการสมัคร</p>

          {loadingReview && <p style={{ textAlign: "center", color: "var(--muted)" }}>กำลังโหลดข้อมูล...</p>}
          {reviewError && <p style={{ marginBottom: 12, color: "var(--red)", fontSize: 14 }}>{reviewError}</p>}

          {/* ── การ์ดที่ 1: เรซูเม่ ── */}
          <div className="s3-section">
            <div className="s3-section-header">
              <div className="s3-section-title-row">
                <div className="s3-section-icon"><IconDoc /></div>
                <h3>เรซูเม่ที่ใช้สมัคร</h3>
              </div>
              <button className="s3-section-edit" type="button" onClick={() => router.push(`/apply-step1?jobId=${jobId}`)}>
                แก้ไข
              </button>
            </div>
            <div className="s3-resume-body">
              <div className="s3-pdf-icon"><IconPdf /></div>
              <div className="s3-resume-info">
                <strong>{resumeSource === "upload" ? (uploadedFileName || "ไฟล์ที่อัปโหลด") : "เรซูเม่จาก CyberJob"}</strong>
                <small>อัปเดตล่าสุด {new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</small>
              </div>
            </div>
          </div>

          {/* ── การ์ดที่ 2: คำตอบคำถามคัดกรอง ── */}
          <div className="s3-section">
            <div className="s3-section-header">
              <div className="s3-section-title-row">
                <div className="s3-section-icon"><IconChat /></div>
                <h3>คำตอบคำถามคัดกรอง</h3>
              </div>
              <button className="s3-section-edit" type="button" onClick={() => router.push("/apply-step2")}>
                แก้ไข
              </button>
            </div>
            <div className="s3-answer-list">
              {summaryRows.map((row) => (
                <div key={row.label} className="s3-answer-row">
                  <span className="s3-answer-label">{row.label}</span>
                  <span className={`s3-answer-value ${!row.value ? "empty" : ""}`}>{row.value || "ยังไม่ได้ตอบ"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Checkbox ยินยอม ── */}
          <div className="s3-consent-wrap">
            <label className={`s3-consent-label ${consent ? "checked" : ""}`}>
              <span className="s3-checkbox" onClick={() => setConsent(!consent)}>
                {consent && <IconCheck />}
              </span>
              <input type="checkbox" className="s3-checkbox-input" checked={consent} onChange={() => setConsent(!consent)} />
              <span className="s3-consent-text">
                ข้าพเจ้ายืนยันว่าข้อมูลทั้งหมดที่กรอกเป็นความจริง และยินยอมให้บริษัทใช้ข้อมูลเพื่อพิจารณาการสมัครงานนี้
              </span>
            </label>
          </div>

          {/* ── ปุ่มด้านล่าง ── */}
          <div className="s3-actions">
            <a href="/apply-step2" className="s3-outline-btn">
              <IconArrowLeft /> ย้อนกลับ
            </a>
            <button
              className="primary-button s3-submit-btn"
              type="button"
              disabled={!consent || submitting || loadingReview}
              onClick={handleSubmit}
            >
              {submitting ? "กำลังส่ง..." : <>ยืนยันการสมัคร →</>}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
