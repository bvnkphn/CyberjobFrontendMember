"use client";

import { useRef, useState, useCallback, useEffect, Suspense, type ChangeEvent, type DragEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createApplication,
  updateResume,
  getProfile,
  findDraftApplication,
  ApiError,
  SAMPLE_JOBS,
  type MemberProfile,
} from "@/lib/member-api";
import "./apply-step1.css";

type UploadedFile = { name: string; size: number };
const ACCEPTED = ".pdf,.doc,.docx";
const MAX_SIZE = 5 * 1024 * 1024;

function IconUser() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}
function IconChevron() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>;
}
function IconDoc() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>;
}
function IconUpload() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconArrowLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>;
}

function ApplyStep1Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const inputRef = useRef<HTMLInputElement>(null);
  const [resumeSource, setResumeSource] = useState<"cyberjob" | "upload">("cyberjob");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  const job = SAMPLE_JOBS.find((j) => j.id === jobId) ?? SAMPLE_JOBS[0];

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const canProceed = resumeSource === "cyberjob" || (resumeSource === "upload" && uploadedFile !== null);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const file = Array.from(fileList)[0];
    if (!file) return;
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(ext)) {
      setFileError("รองรับเฉพาะไฟล์ PDF, DOC, DOCX เท่านั้น");
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }
    setFileError("");
    setUploadedFile({ name: file.name, size: file.size });
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const handleNext = async () => {
    if (!canProceed) return;
    setLoading(true);
    setError("");
    try {
      let appId: string;
      try {
        const app = await createApplication({
          resumeSource,
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.company,
        });
        appId = app.id;
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 409) {
          const existing = await findDraftApplication(job.id);
          if (!existing) throw new Error("ไม่พบใบสมัครฉบับร่าง");
          appId = existing.id;
        } else {
          throw err;
        }
      }
      await updateResume(appId, {
        resumeSource,
        ...(uploadedFile ? { uploadedResumeUrl: uploadedFile.name } : {}),
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("apply-app-id", appId);
        sessionStorage.setItem("apply-job-id", job.id);
        sessionStorage.setItem("apply-resume-source", resumeSource);
        if (uploadedFile) sessionStorage.setItem("apply-resume-filename", uploadedFile.name);
      }
      router.push("/apply-step2");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const completion = profile?.completion ?? 0;
  const updatedAt = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
    : "-";

  return (
    <>
      {/* ═══ Navbar ═══ */}
      <header className="s1-navbar">
        <div className="s1-navbar-inner">
          <a href="/" className="s1-nav-brand">CYBER<span>JOB</span></a>
          <button className="s1-mobile-toggle" type="button" onClick={() => setNavOpen(!navOpen)} aria-label="เปิดเมนู">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
           <nav className={`s1-nav-links ${navOpen ? "is-open" : ""}`}>
            <a href="/">หน้าแรก</a>
            <a href="/jobs">ค้นหางาน</a>
            <a href="/profile/edit">ฝากประวัติ</a>
            <a href="/articles">บทความ</a>
            <a href="/about">เกี่ยวกับเรา</a>
            <a href="/contact">ติดต่อเรา</a>
            <button className="s1-nav-lang" type="button">ภาษาไทย <IconChevron /></button>
            <div className="s1-nav-profile">
              <button className="s1-nav-avatar" type="button" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="เมนูบัญชี">
                <IconUser />
              </button>
              {dropdownOpen && (
                <nav className="s1-nav-dropdown">
                  <div className="s1-nav-dropdown-header">
                    <strong>{firstName || "ผู้ใช้"} {lastName}</strong>
                    <small>{profile?.email ?? ""}</small>
                  </div>
                  <a href="/profile"><IconUser /> โปรไฟล์</a>
                  <a href="/profile/edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h10a2 2 0 0 1 2 2v5M8 7h5M8 11h3M5 3v18h7" /><path d="m14 18 5-5 2 2-5 5-3 1z" /></svg> แก้ไขประวัติ</a>
                  <a href="/profile/preview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h11a2 2 0 0 1 2 2v5M8 7h6M8 11h3M5 3v18h8" /><path d="M13 17s2-3 5-3 5 3 5 3-2 3-5 3-5-3-5-3Z" /><circle cx="18" cy="17" r="1" /></svg> ดูตัวอย่างประวัติ</a>
                  <a href="/my-jobs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></svg> งานของฉัน</a>
                  <a href="/invitations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg> คำเชิญจากบริษัท</a>
                  <hr />
                  <a href="/" className="danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" /></svg> ออกจากระบบ</a>
                </nav>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ═══ Header / Job Card ═══ */}
      <div className="s1-header">
        <button className="s1-back" type="button" onClick={() => history.back()}>
          <IconArrowLeft /> กลับ
        </button>
        <div className="s1-job-card">
          <div className="s1-job-logo">{job.company.charAt(0)}</div>
          <div className="s1-job-text">
            <p className="s1-job-eyebrow">สมัครงานตำแหน่งนี้</p>
            <h1>{job.title}</h1>
            <p className="s1-job-company">สวัสดี {job.company}</p>
            <p className="s1-job-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {job.location}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Step Indicator ═══ */}
      <div className="s1-steps">
        <div className="s1-steps-track">
          <div className="s1-step active">
            <div className="s1-step-circle active">1</div>
            <span className="s1-step-text">เรซูเม่</span>
            <div className="s1-step-line" />
          </div>
          <div className="s1-step">
            <div className="s1-step-circle pending">2</div>
            <span className="s1-step-text">คำถาม</span>
            <div className="s1-step-line" />
          </div>
          <div className="s1-step">
            <div className="s1-step-circle pending">3</div>
            <span className="s1-step-text">ตรวจสอบ</span>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <main className="s1-main">
        <div className="s1-card">
          <h2>เลือกเรซูเม่</h2>
          <p className="s1-card-desc">เลือกเรซูเม่ที่จะใช้สมัครงานตำแหน่งนี้</p>

          {error && <p style={{ marginBottom: 12, color: "var(--red)", fontSize: 14 }}>{error}</p>}

          <div className="s1-resume-options">
            {/* ── Option 1: CyberJob ── */}
            <div
              className={`s1-resume-card ${resumeSource === "cyberjob" ? "selected" : ""}`}
              onClick={() => setResumeSource("cyberjob")}
              role="radio"
              aria-checked={resumeSource === "cyberjob"}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setResumeSource("cyberjob"); } }}
            >
              <div className="s1-resume-header">
                <div className="s1-resume-icon doc"><IconDoc /></div>
                <div className="s1-resume-header-text">
                  <strong>ใช้เรซูเม่จาก Cyber Job</strong>
                  <small>ใช้ข้อมูลโปรไฟล์ที่กรอกไว้ในระบบ</small>
                </div>
                <div className="s1-resume-check">
                  {resumeSource === "cyberjob" && <IconCheck />}
                </div>
              </div>

              {resumeSource === "cyberjob" && (
                <div className="s1-profile-inner">
                  <div className="s1-profile-avatar">{(firstName || "?").charAt(0)}</div>
                  <div className="s1-profile-info">
                    <h3>{firstName} {lastName}</h3>
                    <p>{profile?.desiredJob?.position as string || "ไม่ระบุตำแหน่ง"}</p>
                  </div>
                  <div className="s1-profile-right">
                    <div className="s1-progress-wrap">
                      <div className="s1-progress-bar">
                        <div className="s1-progress-fill" style={{ width: `${completion}%` }} />
                      </div>
                      <span className="s1-progress-pct">{completion}%</span>
                    </div>
                    <span className="s1-profile-updated">อัปเดต {updatedAt}</span>
                  </div>
                  <div className="s1-profile-actions">
                    <a href="/profile/preview" className="s1-outline-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h11a2 2 0 0 1 2 2v5M8 7h6M8 11h3M5 3v18h8" /><path d="M13 17s2-3 5-3 5 3 5 3-2 3-5 3-5-3-5-3Z" /><circle cx="18" cy="17" r="1" /></svg>
                      ดูตัวอย่างเรซูเม่
                    </a>
                    <a href="/profile/edit" className="s1-outline-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h10a2 2 0 0 1 2 2v5M8 7h5M8 11h3M5 3v18h7" /><path d="m14 18 5-5 2 2-5 5-3 1z" /></svg>
                      แก้ไขเรซูเม่
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ── Option 2: Upload ── */}
            <div
              className={`s1-resume-card ${resumeSource === "upload" ? "selected" : ""}`}
              onClick={() => setResumeSource("upload")}
              role="radio"
              aria-checked={resumeSource === "upload"}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setResumeSource("upload"); } }}
            >
              <div className="s1-resume-header">
                <div className="s1-resume-icon upload"><IconUpload /></div>
                <div className="s1-resume-header-text">
                  <strong>อัปโหลดเรซูเม่</strong>
                  <small>PDF, DOC, DOCX ขนาดไม่เกิน 5 MB</small>
                </div>
                <div className="s1-resume-check">
                  {resumeSource === "upload" && <IconCheck />}
                </div>
              </div>

              {resumeSource === "upload" && (
                <div className="s1-upload-inner">
                  <input ref={inputRef} className="s1-vh" type="file" accept={ACCEPTED} onChange={handleInputChange} />
                  <div
                    className={`s1-dropzone ${dragging ? "dragging" : ""}`}
                    onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                  >
                    <div className="s1-dropzone-icon"><IconUpload /></div>
                    <strong>ลากและวางไฟล์ที่นี่</strong>
                    <small>หรือ <span className="s1-dropzone-link">เลือกไฟล์</span></small>
                  </div>
                  {fileError && <p style={{ marginTop: 8, color: "var(--red)", fontSize: 13 }}>{fileError}</p>}
                  {uploadedFile && (
                    <div className="s1-file-row">
                      <span><i aria-hidden="true">{"\u25A4"}</i> {uploadedFile.name} ({fmtSize(uploadedFile.size)})</span>
                      <button className="s1-file-remove" type="button" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}>ลบ</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="s1-actions">
            <button className="primary-button" disabled={!canProceed || loading} onClick={handleNext}>
              {loading ? "กำลังบันทึก..." : "ถัดไป →"}
            </button>
          </div>
        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="s1-footer">
        <div className="s1-footer-main">
          <div>
            <div className="s1-footer-brand">CYBER<span>JOB</span></div>
            <p className="s1-footer-about">เว็บหางานสำหรับคนทำงานเพื่อโอกาสเติบโตในบริษัทด้วยตำแหน่งที่เหมาะกับไลฟ์สไตล์ของคุณ</p>
          </div>
          <div className="s1-footer-links">
            <div className="s1-footer-col">
              <strong>ผู้หางาน</strong>
              <a href="/jobs">ค้นหางาน</a>
              <a href="/profile">โปรไฟล์</a>
              <a href="/saved-jobs">งานที่บันทึก</a>
              <a href="/applications">ประวัติการสมัครงาน</a>
            </div>
            <div className="s1-footer-col">
              <strong>ผู้ประกอบการ</strong>
              <a href="/register/business">ลงทะเบียนฟรี</a>
              <a href="/post-job">ลงประกาศงาน</a>
            </div>
            <div className="s1-footer-col">
              <strong>เกี่ยวกับเรา</strong>
              <a href="/contact">ติดต่อเรา</a>
            </div>
          </div>
        </div>
        <div className="s1-footer-bottom">
          <span>Copyright @ 2026 CYBERJOB Co, Ltd | All Rights Reserved.</span>
          <div className="s1-footer-bottom-links">
            <a href="/terms">ข้อกำหนดและเงื่อนไข</a>
            <a href="/security">ความปลอดภัย</a>
            <a href="/privacy">ความเป็นส่วนตัว</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function ApplyStep1Page() {
  return (
    <Suspense fallback={<main className="member-route-loading">กำลังโหลด...</main>}>
      <ApplyStep1Inner />
    </Suspense>
  );
}
