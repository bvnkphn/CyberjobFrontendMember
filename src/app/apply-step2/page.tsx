"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAnswers, SAMPLE_JOBS, type ApplicationQuestion } from "@/lib/member-api";
import "./apply-step2.css";

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
function IconAlert() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}

/**
 * Maps the frontend's internal question type (used for rendering the right
 * input control) to the enum the backend's AnswerItemDto actually accepts:
 * "text" | "single_choice" | "multiple_choice".
 */
const mapQuestionType = (
  type: ApplicationQuestion["questionType"]
): "text" | "single_choice" | "multiple_choice" => {
  switch (type) {
    case "radio":
      return "single_choice";
    case "checkbox":
      return "multiple_choice";
    case "text":
    case "number":
    case "date":
    case "textarea":
    default:
      return "text";
  }
};

export default function ApplyStep2Page() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [navOpen, setNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [jobId, setJobId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobLocation, setJobLocation] = useState("");

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
    setJobLocation(job.location);
  }, [router]);

  const questions: ApplicationQuestion[] = (() => {
    if (!jobId) return [];
    const job = SAMPLE_JOBS.find((j) => j.id === jobId) ?? SAMPLE_JOBS[0];
    return job.questions;
  })();

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const toggleCheckbox = (id: string, option: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = current.includes(option) ? current.filter((v) => v !== option) : [...current, option];
      return { ...prev, [id]: next };
    });
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    for (const q of questions) {
      if (!q.required) continue;
      const val = answers[q.questionId];
      const isEmpty = val === undefined || val === "" || (Array.isArray(val) && val.length === 0);
      if (isEmpty) newErrors[q.questionId] = true;
    }
    setErrors(newErrors);

    const firstError = questions.find((q) => newErrors[q.questionId]);
    if (firstError) {
      questionRefs.current[firstError.questionId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate() || !applicationId) return;
    setLoading(true);
    setError("");
    try {
      const apiAnswers = questions.map((q) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        questionType: mapQuestionType(q.questionType),
        options: q.options,
        answer: answers[q.questionId] ?? null,
      }));
      await saveAnswers(applicationId, apiAnswers);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("apply-answers", JSON.stringify(answers));
      }
      router.push("/apply-step3");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const companyInitial = companyName ? companyName.charAt(0) : "C";

  return (
    <>
      {/* ═══ Navbar ═══ */}
      <header className="s2-navbar">
        <div className="s2-navbar-inner">
          <a href="/" className="s2-nav-brand">CYBER<span>JOB</span></a>
          <button className="s2-mobile-toggle" type="button" onClick={() => setNavOpen(!navOpen)} aria-label="เปิดเมนู">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <nav className={`s2-nav-links ${navOpen ? "is-open" : ""}`}>
            <a href="/">หน้าแรก</a>
            <a href="/jobs">ค้นหางาน</a>
            <a href="/profile/edit">ฝากประวัติ</a>
            <a href="/articles">บทความ</a>
            <a href="/about">เกี่ยวกับเรา</a>
            <a href="/contact">ติดต่อเรา</a>
            <button className="s2-nav-lang" type="button">ภาษาไทย <IconChevron /></button>
            <div className="s2-nav-profile">
              <button className="s2-nav-avatar" type="button" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="เมนูบัญชี">
                <IconUser />
              </button>
              {dropdownOpen && (
                <nav className="s2-nav-dropdown">
                  <div className="s2-nav-dropdown-header">
                    <strong>ผู้ใช้</strong>
                    <small></small>
                  </div>
                  <a href="/profile"><IconUser /> โปรไฟล์</a>
                  <a href="/profile/edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h10a2 2 0 0 1 2 2v5M8 7h5M8 11h3M5 3v18h7" /><path d="m14 18 5-5 2 2-5 5-3 1z" /></svg> แก้ไขประวัติ</a>
                  <a href="/my-jobs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></svg> งานของฉัน</a>
                  <hr />
                  <a href="/" className="danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" /></svg> ออกจากระบบ</a>
                </nav>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ═══ Header / Job Card ═══ */}
      <div className="s2-header">
        <button className="s2-back" type="button" onClick={() => history.back()}>
          <IconArrowLeft /> กลับ
        </button>
        <div className="s2-job-card">
          <div className="s2-job-logo">{companyInitial}</div>
          <div className="s2-job-text">
            <p className="s2-job-eyebrow">สมัครงานตำแหน่งนี้</p>
            <h1>{jobTitle}</h1>
            <p className="s2-job-company">สวัสดี {companyName}</p>
            <p className="s2-job-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {jobLocation}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Step Indicator ═══ */}
      <div className="s2-steps">
        <div className="s2-steps-track">
          <div className="s2-step done">
            <div className="s2-step-circle done"><IconCheck /></div>
            <span className="s2-step-label">เสร็จสิ้น</span>
            <span className="s2-step-text">เรซูเม่</span>
            <div className="s2-step-line done" />
          </div>
          <div className="s2-step active">
            <div className="s2-step-circle active">2</div>
            <span className="s2-step-label">กำลังทำ</span>
            <span className="s2-step-text">คำถาม</span>
            <div className="s2-step-line" />
          </div>
          <div className="s2-step">
            <div className="s2-step-circle pending">3</div>
            <span className="s2-step-text">ตรวจสอบ</span>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <main className="s2-main">
        <div className="s2-card">
          <h2>คำถามสำหรับผู้สมัคร</h2>
          <p className="s2-card-desc">กรุณาตอบคำถามด้านล่างให้ครบทุกข้อที่มีเครื่องหมาย *</p>

          {error && <p style={{ marginBottom: 12, color: "var(--red)", fontSize: 14 }}>{error}</p>}

          <div className="s2-question-list">
            {questions.map((q) => (
              <div
                key={q.questionId}
                ref={(el) => { questionRefs.current[q.questionId] = el; }}
                className={`s2-question ${errors[q.questionId] ? "has-error" : ""}`}
              >
                <div className="s2-question-label">
                  {q.questionText}
                  {q.required && <span className="s2-required">*</span>}
                </div>

                {/* ── Radio ── */}
                {q.questionType === "radio" && q.options && (
                  <div className="s2-radio-group">
                    {q.options.map((opt) => (
                      <div
                        key={opt}
                        className={`s2-radio-card ${answers[q.questionId] === opt ? "selected" : ""}`}
                        onClick={() => setAnswer(q.questionId, opt)}
                        role="radio"
                        aria-checked={answers[q.questionId] === opt}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAnswer(q.questionId, opt); } }}
                      >
                        <div className="s2-radio-dot" />
                        <span className="s2-radio-label">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Date ── */}
                {q.questionType === "date" && (
                  <div className="s2-date-input">
                    <input
                      type="date"
                      value={(answers[q.questionId] as string) || ""}
                      onChange={(e) => setAnswer(q.questionId, e.target.value)}
                    />
                  </div>
                )}

                {/* ── Text / Number ── */}
                {(q.questionType === "text" || q.questionType === "number") && (
                  <div className="s2-text-input">
                    <input
                      type={q.questionType === "number" ? "number" : "text"}
                      placeholder={q.placeholder || ""}
                      value={(answers[q.questionId] as string) || ""}
                      onChange={(e) => setAnswer(q.questionId, e.target.value)}
                    />
                  </div>
                )}

                {/* ── Checkbox ── */}
                {q.questionType === "checkbox" && q.options && (
                  <div className="s2-checkbox-grid">
                    {q.options.map((opt) => {
                      const selected = Array.isArray(answers[q.questionId]) && (answers[q.questionId] as string[]).includes(opt);
                      return (
                        <div
                          key={opt}
                          className={`s2-checkbox-card ${selected ? "selected" : ""}`}
                          onClick={() => toggleCheckbox(q.questionId, opt)}
                          role="checkbox"
                          aria-checked={selected}
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCheckbox(q.questionId, opt); } }}
                        >
                          <div className="s2-checkbox-box">{selected ? "✓" : ""}</div>
                          <span className="s2-checkbox-label">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Textarea ── */}
                {q.questionType === "textarea" && (
                  <div className="s2-textarea">
                    <textarea
                      placeholder={q.placeholder || ""}
                      value={(answers[q.questionId] as string) || ""}
                      onChange={(e) => setAnswer(q.questionId, e.target.value)}
                      maxLength={1000}
                    />
                    <div className="s2-textarea-footer">
                      <span className="s2-char-count">{((answers[q.questionId] as string) || "").length} ตัวอักษร</span>
                      <span className="s2-char-max">สูงสุด 1,000 ตัวอักษร</span>
                    </div>
                  </div>
                )}

                {/* ── Validation Error ── */}
                {errors[q.questionId] && (
                  <div className="s2-error-msg">
                    <IconAlert /> กรุณาตอบคำถามข้อนี้
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="s2-actions">
            <a href="/apply-step1" className="s2-outline-btn">
              <IconArrowLeft /> ย้อนกลับ
            </a>
            <button className="primary-button" type="button" onClick={handleNext} disabled={loading}>
              {loading ? "กำลังบันทึก..." : "ถัดไป →"}
            </button>
          </div>
        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="s2-footer">
        <div className="s2-footer-main">
          <div>
            <div className="s2-footer-brand">CYBER<span>JOB</span></div>
            <p className="s2-footer-about">เว็บหางานสำหรับคนทำงานเพื่อโอกาสเติบโตในบริษัทด้วยตำแหน่งที่เหมาะกับไลฟ์สไตล์ของคุณ</p>
          </div>
          <div className="s2-footer-links">
            <div className="s2-footer-col">
              <strong>ผู้หางาน</strong>
              <a href="/jobs">ค้นหางาน</a>
              <a href="/profile">โปรไฟล์</a>
              <a href="/saved-jobs">งานที่บันทึก</a>
              <a href="/applications">ประวัติการสมัครงาน</a>
            </div>
            <div className="s2-footer-col">
              <strong>ผู้ประกอบการ</strong>
              <a href="/register/business">ลงทะเบียนฟรี</a>
              <a href="/post-job">ลงประกาศงาน</a>
            </div>
            <div className="s2-footer-col">
              <strong>เกี่ยวกับเรา</strong>
              <a href="/contact">ติดต่อเรา</a>
            </div>
          </div>
        </div>
        <div className="s2-footer-bottom">
          <span>Copyright @ 2026 CYBERJOB Co, Ltd | All Rights Reserved.</span>
          <div className="s2-footer-bottom-links">
            <a href="/terms">ข้อกำหนดและเงื่อนไข</a>
            <a href="/security">ความปลอดภัย</a>
            <a href="/privacy">ความเป็นส่วนตัว</a>
          </div>
        </div>
      </footer>
    </>
  );
}