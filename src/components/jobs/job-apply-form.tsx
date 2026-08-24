"use client";

import { useRef, useState, useCallback, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_JOBS, type ApplicationQuestion } from "@/lib/member-api";
import { ProfilePageHeading } from "../profile/profile-page-heading";
import "./apply.css";

/* ── Mock data ───────────────────────────────────────────────────── */

const MOCK_PROFILE = {
  firstName: "สมชาย",
  lastName: "ใจดี",
  email: "somchai@cyberjob.co",
  completion: 72,
  updatedAt: "15 ส.ค. 2026",
};

type UploadedFile = { name: string; size: number; type: string };

const ACCEPTED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* ── Icon components ─────────────────────────────────────────────── */

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
function IconUpload() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}
function IconAlert() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}
function IconPreview() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 3h11a2 2 0 0 1 2 2v5M8 7h6M8 11h3M5 3v18h8" /><path d="M13 17s2-3 5-3 5 3 5 3-2 3-5 3-5-3-5-3Z" /><circle cx="18" cy="17" r="1" /></svg>;
}
function IconEdit() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 3h10a2 2 0 0 1 2 2v5M8 7h5M8 11h3M5 3v18h7" /><path d="m14 18 5-5 2 2-5 5-3 1z" /></svg>;
}
function IconPdf() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 15h2" /><path d="M8 13h4" /></svg>;
}
function IconChat() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}

/* ── Main component ─────────────────────────────────────────────── */

export function JobApplyForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const job = SAMPLE_JOBS.find((j) => j.id === jobId);

  const [step, setStep] = useState<Step>(1);
  const [resumeSource, setResumeSource] = useState<ResumeSource>("cyberjob");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!job) {
    return (
      <main className="apply-page">
        <div className="apply-layout">
          <ProfilePageHeading title="ไม่พบงาน" description="ตำแหน่งงานนี้อาจถูกลบไปแล้ว" fallbackHref="/jobs" />
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <>
        <main className="apply-page">
          <div className="apply-layout apply-success-wrap">
            <div className="apply-form-card">
              <div className="apply-success">
                <div className="apply-success-icon"><IconCheck /></div>
                <h2>สมัครงานสำเร็จ!</h2>
                <p className="apply-success-job">คุณได้สมัครงานตำแหน่ง <strong>{job.title}</strong></p>
                <p>ใบสมัครของคุณถูกส่งเรียบร้อยแล้ว ทางบริษัทจะตรวจสอบและติดต่อกลับโดยเร็วที่สุด</p>
                <p style={{ fontSize: 13, color: "#aab2c0" }}>คุณสามารถตรวจสอบสถานะการสมัครได้ที่หน้า &quot;งานของฉัน&quot;</p>
                <div className="apply-success-actions">
                  <button className="primary-button" onClick={() => router.push("/jobs")}>ดูสถานะการสมัคร</button>
                  <button className="apply-secondary-button" onClick={() => router.push("/jobs")}>ค้นหางานเพิ่มเติม</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <main className="apply-page">
      <div className="apply-layout">
        {/* ── Back button ── */}
        <button className="apply-back" type="button" onClick={() => step === 1 ? router.push("/jobs") : setStep(step === 3 ? 2 : 1)}>
          <IconArrowLeft /> กลับ
        </button>

        {/* ── Job card ── */}
        <div className="apply-job-card">
          <div className="apply-job-logo">{job.company.charAt(0)}</div>
          <div className="apply-job-info">
            <p className="apply-job-eyebrow">สมัครงานตำแหน่งนี้</p>
            <h2>{job.title}</h2>
            <p className="apply-job-company">สวัสดี {job.company}</p>
          </div>
        </div>

        {/* ── Step indicator ── */}
        <StepIndicator current={step} />

        {step === 1 && (
          <StepOne
            job={job}
            resumeSource={resumeSource}
            uploadedFile={uploadedFile}
            onSelectSource={setResumeSource}
            onUploadFile={setUploadedFile}
            onRemoveFile={() => setUploadedFile(null)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepTwo
            questions={job.questions}
            answers={answers}
            errors={questionErrors}
            onChangeAnswers={setAnswers}
            onChangeErrors={setQuestionErrors}
            onBack={() => setStep(1)}
            onNext={() => {
              const errs = validateAnswers(job.questions, answers);
              setQuestionErrors(errs);
              if (Object.keys(errs).length > 0) {
                const firstErrorId = job.questions.find((q) => errs[q.questionId])?.questionId;
                if (firstErrorId) {
                  const el = document.getElementById(`q-${firstErrorId}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                return;
              }
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <StepThree
            job={job}
            resumeSource={resumeSource}
            uploadedFile={uploadedFile}
            answers={answers}
            consentGiven={consentGiven}
            onToggleConsent={setConsentGiven}
            onEditResume={() => setStep(1)}
            onEditAnswers={() => setStep(2)}
            onBack={() => setStep(2)}
            onSubmit={() => setSubmitted(true)}
          />
        )}
      </div>
    </main>
  );
}

/* ── Step indicator ─────────────────────────────────────────────── */

type Step = 1 | 2 | 3;
type ResumeSource = "cyberjob" | "upload";

const STEP_TITLES = ["เรซูเม่", "คำถาม", "ตรวจสอบ & ส่ง"];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="step-indicator">
      {STEP_TITLES.map((title, i) => {
        const num = (i + 1) as Step;
        const state = num < current ? "done" : num === current ? "active" : "pending";
        return (
          <div className={`step-node ${state}`} key={title}>
            {num < 3 && <div className={`step-line ${num < current ? "done" : ""}`} />}
            <div className={`step-circle ${state}`}>{num < current ? <IconCheck /> : num}</div>
            <span className="step-label">{title}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Resume ─────────────────────────────────────────────── */

function StepOne({
  job,
  resumeSource,
  uploadedFile,
  onSelectSource,
  onUploadFile,
  onRemoveFile,
  onNext,
}: {
  job: { title: string; company: string };
  resumeSource: ResumeSource;
  uploadedFile: UploadedFile | null;
  onSelectSource: (s: ResumeSource) => void;
  onUploadFile: (f: UploadedFile) => void;
  onRemoveFile: () => void;
  onNext: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const canProceed = resumeSource === "cyberjob" || (resumeSource === "upload" && uploadedFile !== null);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const file = Array.from(fileList)[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("รองรับเฉพาะไฟล์ PDF, DOC, DOCX เท่านั้น");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("ขนาดไฟล์ต้องไม่เกิน 10 MB");
      return;
    }
    setFileError("");
    onUploadFile({ name: file.name, size: file.size, type: file.type });
  }, [onUploadFile]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="apply-form-card">
      <h1>เลือกเรซูเม่</h1>
      <p className="section-desc">เลือกเรซูเม่ที่จะใช้สมัครงานตำแหน่งนี้</p>

      <div className="resume-choice">
        {/* Option 1: CyberJob profile */}
        <div
          className={`resume-radio ${resumeSource === "cyberjob" ? "selected" : ""}`}
          onClick={() => onSelectSource("cyberjob")}
          role="radio"
          aria-checked={resumeSource === "cyberjob"}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectSource("cyberjob"); } }}
        >
          <div className="resume-radio-header">
            <div className="resume-radio-icon doc"><IconDoc /></div>
            <div className="resume-radio-text">
              <strong>ใช้เรซูเม่จาก Cyber Job</strong>
              <small>ใช้ข้อมูลโปรไฟล์ที่กรอกไว้ในระบบ</small>
            </div>
            <div className="resume-radio-check">
              {resumeSource === "cyberjob" && <IconCheck />}
            </div>
          </div>

          {resumeSource === "cyberjob" && (
            <div className="apply-profile-card">
              <div className="apply-profile-avatar">{MOCK_PROFILE.firstName.charAt(0)}</div>
              <div className="apply-profile-text">
                <h3>{MOCK_PROFILE.firstName} {MOCK_PROFILE.lastName}</h3>
                <p>{MOCK_PROFILE.email}</p>
              </div>
              <div className="apply-profile-completion">
                <div className="apply-progress-wrap">
                  <div className="apply-profile-bar">
                    <div className="apply-profile-bar-fill" style={{ width: `${MOCK_PROFILE.completion}%` }} />
                  </div>
                  <span className="apply-profile-pct">{MOCK_PROFILE.completion}%</span>
                </div>
                <span className="apply-profile-date">อัปเดต {MOCK_PROFILE.updatedAt}</span>
              </div>
              <div className="apply-profile-actions">
                <button type="button" className="apply-outline-btn" onClick={() => router.push("/profile/preview")}>
                  <IconPreview /> ดูตัวอย่างเรซูเม่
                </button>
                <button type="button" className="apply-outline-btn" onClick={() => router.push("/profile/edit")}>
                  <IconEdit /> แก้ไขเรซูเม่
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Option 2: Upload */}
        <div
          className={`resume-radio ${resumeSource === "upload" ? "selected" : ""}`}
          onClick={() => onSelectSource("upload")}
          role="radio"
          aria-checked={resumeSource === "upload"}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectSource("upload"); } }}
        >
          <div className="resume-radio-header">
            <div className="resume-radio-icon upload"><IconUpload /></div>
            <div className="resume-radio-text">
              <strong>อัปโหลดเรซูเม่</strong>
              <small>PDF, DOC, DOCX ขนาดไม่เกิน 5 MB</small>
            </div>
            <div className="resume-radio-check">
              {resumeSource === "upload" && <IconCheck />}
            </div>
          </div>

          {resumeSource === "upload" && (
            <div className="apply-upload-inner">
              <input ref={inputRef} className="apply-vh" type="file" accept={ACCEPTED_EXTENSIONS} onChange={handleInputChange} />
              <div
                className={`apply-dropzone ${dragging ? "dragging" : ""}`}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <div className="apply-dropzone-icon"><IconUpload /></div>
                <strong>ลากและวางไฟล์ที่นี่</strong>
                <small>หรือ <span className="apply-dropzone-link">เลือกไฟล์</span></small>
              </div>
              {fileError && <p style={{ marginTop: 8, color: "var(--red)", fontSize: 13 }}>{fileError}</p>}
              {uploadedFile && (
                <div className="apply-file-info">
                  <span><i aria-hidden="true">{"\u25A4"}</i> {uploadedFile.name} ({formatSize(uploadedFile.size)})</span>
                  <button className="apply-file-remove" type="button" onClick={(e) => { e.stopPropagation(); onRemoveFile(); }}>ลบ</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="apply-actions">
        <div />
        <button className="primary-button" onClick={onNext} disabled={!canProceed}>ถัดไป →</button>
      </div>
    </div>
  );
}

/* ── Step 2: Questions ──────────────────────────────────────────── */

function StepTwo({
  questions,
  answers,
  errors,
  onChangeAnswers,
  onChangeErrors,
  onBack,
  onNext,
}: {
  questions: ApplicationQuestion[];
  answers: Record<string, string | string[]>;
  errors: Record<string, string>;
  onChangeAnswers: (a: Record<string, string | string[]>) => void;
  onChangeErrors: (e: Record<string, string>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const update = (qId: string, value: string | string[]) => {
    onChangeAnswers({ ...answers, [qId]: value });
    if (errors[qId]) {
      const next = { ...errors };
      delete next[qId];
      onChangeErrors(next);
    }
  };

  const toggleCheckbox = (qId: string, option: string) => {
    const current = (answers[qId] ?? []) as string[];
    const next = current.includes(option) ? current.filter((v) => v !== option) : [...current, option];
    update(qId, next);
  };

  return (
    <div className="apply-form-card">
      <h1>คำถาม</h1>
      <p className="section-desc">บริษัทต้องการทราบข้อมูลเพิ่มเติมจากคุณ กรุณาตอบให้ครบถ้วน</p>

      <div className="apply-questions">
        {questions.map((q, i) => (
          <div
            className={`apply-question ${errors[q.questionId] ? "has-error" : ""}`}
            key={q.questionId}
            id={`q-${q.questionId}`}
          >
            <div className="apply-question-label">
              <span className="q-num">{i + 1}</span>
              <span>{q.questionText}{q.required && <b> *</b>}</span>
            </div>

            {q.questionType === "radio" && q.options && (
              <div className="apply-radio-group">
                {q.options.map((opt) => (
                  <div
                    key={opt}
                    className={`apply-radio-option ${(answers[q.questionId] ?? "") === opt ? "selected" : ""}`}
                    onClick={() => update(q.questionId, opt)}
                    role="radio"
                    aria-checked={(answers[q.questionId] ?? "") === opt}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); update(q.questionId, opt); } }}
                  >
                    <div className="apply-radio-dot" />
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            )}

            {q.questionType === "date" && (
              <div className="apply-date-input">
                <input
                  type="date"
                  value={(answers[q.questionId] as string) || ""}
                  onChange={(e) => update(q.questionId, e.target.value)}
                />
              </div>
            )}

            {(q.questionType === "text" || q.questionType === "number") && (
              <input
                type={q.questionType === "number" ? "number" : "text"}
                className={`apply-question-input ${errors[q.questionId] ? "has-error" : ""}`}
                placeholder={q.placeholder || "เช่น 25,000"}
                value={(answers[q.questionId] as string) || ""}
                onChange={(e) => update(q.questionId, e.target.value)}
              />
            )}

            {q.questionType === "checkbox" && q.options && (
              <div className="apply-checkbox-group">
                {q.options.map((opt) => {
                  const selected = ((answers[q.questionId] ?? []) as string[]).includes(opt);
                  return (
                    <div
                      key={opt}
                      className={`apply-checkbox-option ${selected ? "selected" : ""}`}
                      onClick={() => toggleCheckbox(q.questionId, opt)}
                      role="checkbox"
                      aria-checked={selected}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCheckbox(q.questionId, opt); } }}
                    >
                      <div className="apply-checkbox-box">{selected ? "✓" : ""}</div>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {q.questionType === "textarea" && (
              <textarea
                className={`apply-question-textarea ${errors[q.questionId] ? "has-error" : ""}`}
                placeholder={q.placeholder || "เขียนคำอธิบายของคุณที่นี่..."}
                value={(answers[q.questionId] as string) || ""}
                onChange={(e) => update(q.questionId, e.target.value)}
                maxLength={1000}
              />
            )}

            {errors[q.questionId] && (
              <p className="apply-question-error" role="alert"><IconAlert /> {errors[q.questionId]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="apply-actions">
        <button className="apply-secondary-button" onClick={onBack}><IconArrowLeft /> ย้อนกลับ</button>
        <button className="primary-button" onClick={onNext}>ถัดไป →</button>
      </div>
    </div>
  );
}

/* ── Step 3: Review & Submit ────────────────────────────────────── */

function StepThree({
  job,
  resumeSource,
  uploadedFile,
  answers,
  consentGiven,
  onToggleConsent,
  onEditResume,
  onEditAnswers,
  onBack,
  onSubmit,
}: {
  job: { title: string; company: string; questions: ApplicationQuestion[] };
  resumeSource: ResumeSource;
  uploadedFile: UploadedFile | null;
  answers: Record<string, string | string[]>;
  consentGiven: boolean;
  onToggleConsent: (v: boolean) => void;
  onEditResume: () => void;
  onEditAnswers: () => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const resumeLabel = resumeSource === "cyberjob"
    ? `เรซูเม่จาก CyberJob — ${MOCK_PROFILE.firstName} ${MOCK_PROFILE.lastName}`
    : uploadedFile
      ? `${uploadedFile.name} (${formatSize(uploadedFile.size)})`
      : "ยังไม่ได้เลือก";

  return (
    <div className="apply-form-card">
      <h1>ตรวจสอบ & ส่ง</h1>
      <p className="section-desc">กรุณาตรวจสอบข้อมูลทั้งหมดก่อนกดยืนยันการสมัคร</p>

      {/* ── Resume summary ── */}
      <div className="apply-review-section">
        <div className="apply-review-header">
          <h3><IconDoc /> เรซูเม่ที่ใช้สมัคร</h3>
          <button className="apply-edit-button" onClick={onEditResume}>แก้ไข</button>
        </div>
        <div className="apply-review-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--blue-soft)", color: "var(--blue)", display: "grid", placeItems: "center", flexShrink: 0 }}><IconPdf /></div>
          <div>
            <p style={{ fontWeight: 600 }}>{resumeSource === "cyberjob" ? "เรซูเม่จาก CyberJob" : uploadedFile?.name || "ไม่มีไฟล์"}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>อัปเดต {MOCK_PROFILE.updatedAt}</p>
          </div>
        </div>
      </div>

      {/* ── Answers summary ── */}
      <div className="apply-review-section">
        <div className="apply-review-header">
          <h3><IconChat /> คำตอบคำถามคัดกรอง</h3>
          <button className="apply-edit-button" onClick={onEditAnswers}>แก้ไข</button>
        </div>
        <div className="apply-review-card">
          <dl className="apply-answer-list">
            {job.questions.map((q) => {
              const ans = answers[q.questionId];
              let display = "ยังไม่ได้ตอบ";
              let isEmpty = true;
              if (q.questionType === "checkbox" && Array.isArray(ans)) {
                isEmpty = ans.length === 0;
                display = isEmpty ? "ยังไม่ได้ตอบ" : ans.join(", ");
              } else if (typeof ans === "string" && ans.trim()) {
                isEmpty = false;
                display = ans;
              }
              return (
                <div className="apply-answer-row" key={q.questionId}>
                  <dt>{q.questionText}</dt>
                  <dd className={isEmpty ? "empty" : ""}>{display}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      {/* ── Consent ── */}
      <label className={`apply-consent ${consentGiven ? "checked" : ""}`}>
        <input type="checkbox" checked={consentGiven} onChange={(e) => onToggleConsent(e.target.checked)} />
        <span>ข้าพเจ้ายืนยันว่าข้อมูลทั้งหมดที่กรอกเป็นความจริง และยินยอมให้บริษัทใช้ข้อมูลเพื่อพิจารณาการสมัครงานนี้</span>
      </label>

      <div className="apply-actions">
        <button className="apply-secondary-button" onClick={onBack}><IconArrowLeft /> ย้อนกลับ</button>
        <button className="primary-button" onClick={onSubmit} disabled={!consentGiven}>สำเร็จ →</button>
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */

function validateAnswers(questions: ApplicationQuestion[], answers: Record<string, string | string[]>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of questions) {
    if (!q.required) continue;
    const ans = answers[q.questionId];
    if (q.questionType === "checkbox") {
      if (!Array.isArray(ans) || ans.length === 0) errors[q.questionId] = "กรุณาเลือกอย่างน้อย 1 ตัวเลือก";
    } else {
      if (!ans || (typeof ans === "string" && !ans.trim())) errors[q.questionId] = "กรุณาตอบคำถามข้อนี้";
    }
  }
  return errors;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
