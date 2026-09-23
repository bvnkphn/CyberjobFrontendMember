"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CompanyLogo, Notice, UpgradeNotice } from "@/components/ui/ui";
import { AUTH_API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ApiError, errorMessage, useOwner } from "@/lib/owner";
import type { JobDetail, SaveJobPayload, WorkStyle } from "@/lib/types";
import ScreeningQuestionBuilder, { type ScreeningQuestion } from "./ScreeningQuestionBuilder";
import styles from "./CreateJobPostingForm.module.css";

type Category = { value: string; labelTh: string; labelEn: string };

/** ใช้เมื่อโหลดหมวดหมู่จาก API ฝั่ง member ไม่ได้ */
const FALLBACK_CATEGORIES: Category[] = [
  { value: "เทคโนโลยีสารสนเทศ", labelTh: "เทคโนโลยีสารสนเทศ", labelEn: "Information Technology" },
  { value: "การตลาดและประชาสัมพันธ์", labelTh: "การตลาดและประชาสัมพันธ์", labelEn: "Marketing & PR" },
  { value: "ศิลปะ สื่อ และการออกแบบ", labelTh: "ศิลปะ สื่อ และการออกแบบ", labelEn: "Arts, media & design" },
];

const DEPARTMENT_OPTIONS = [
  { value: "วิศวกรรม", en: "Engineering" },
  { value: "ออกแบบผลิตภัณฑ์", en: "Product Design" },
  { value: "ความปลอดภัยสารสนเทศ", en: "Information Security" },
  { value: "ไอที", en: "IT" },
  { value: "การตลาด", en: "Marketing" },
  { value: "ฝ่ายบุคคล", en: "Human Resources" },
];

/** ตามชีตสเปก: งานเต็มเวลา สัญญาจ้าง งานชั่วคราว (เอาฝึกงานออก) */
const EMPLOYMENT_TYPES = [
  { value: "fulltime", th: "งานเต็มเวลา", en: "Full-time" },
  { value: "contract", th: "สัญญาจ้าง", en: "Contract" },
  { value: "temporary", th: "งานชั่วคราว", en: "Temporary" },
] as const;

const WORK_TYPE_OPTIONS: Array<{ value: WorkStyle; th: string; en: string }> = [
  { value: "onsite", th: "ออนไซต์", en: "On-site" },
  { value: "hybrid", th: "ไฮบริด", en: "Hybrid" },
  { value: "remote", th: "ออนไลน์", en: "Remote" },
];

interface CreateJobPostingFormProps {
  /** มี = แก้ไขประกาศเดิม */
  initialData?: JobDetail;
}

function TagInput({
  id,
  values,
  onChange,
  placeholder,
}: {
  id: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const { isEn } = useLanguage();
  const [input, setInput] = useState("");
  const add = () => {
    const value = input.trim();
    if (value && !values.some((item) => item.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
    setInput("");
  };
  return (
    <div className={styles.skillInputWrap}>
      {values.map((value) => (
        <span key={value} className={styles.skillTag}>
          {value}
          <button
            type="button"
            className={styles.skillRemove}
            onClick={() => onChange(values.filter((item) => item !== value))}
            aria-label={isEn ? `Remove ${value}` : `ลบ ${value}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        className={styles.skillInput}
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
      />
    </div>
  );
}

/** สร้าง / แก้ไขประกาศรับสมัครงาน (Owner Feature 4.2) */
export default function CreateJobPostingForm({ initialData }: CreateJobPostingFormProps) {
  const { t, isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const router = useRouter();
  const { me, api } = useOwner();
  const isEdit = Boolean(initialData);
  const company = me.company;

  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [department, setDepartment] = useState(initialData?.department ?? "");
  const [employmentType, setEmploymentType] = useState<SaveJobPayload["employmentType"]>(
    initialData && ["fulltime", "contract", "temporary"].includes(initialData.employmentType)
      ? (initialData.employmentType as SaveJobPayload["employmentType"])
      : "fulltime",
  );
  const [workStyle, setWorkStyle] = useState<WorkStyle>(initialData?.workStyle ?? "onsite");
  const [experienceYears, setExperienceYears] = useState(String(initialData?.experienceYears ?? 0));
  const [openings, setOpenings] = useState(String(initialData?.openings ?? 1));
  const [salaryMin, setSalaryMin] = useState(initialData ? String(initialData.salaryMin) : "");
  const [salaryMax, setSalaryMax] = useState(initialData ? String(initialData.salaryMax) : "");
  const [salaryNegotiable, setSalaryNegotiable] = useState(initialData?.salaryNegotiable ?? false);
  const [isUrgent, setIsUrgent] = useState(initialData?.isUrgent ?? false);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [skills, setSkills] = useState<string[]>(initialData?.skills ?? []);
  const [benefits, setBenefits] = useState<string[]>(initialData?.benefits ?? []);
  const [questions, setQuestions] = useState<ScreeningQuestion[]>(
    (initialData?.questions ?? []).map((question, index) => ({ ...question, uid: index + 1 })),
  );
  const [nextUid, setNextUid] = useState((initialData?.questions.length ?? 0) + 1);
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);

  // หมวดหมู่ชุดเดียวกับตัวกรองบนหน้าเว็บผู้หางาน
  useEffect(() => {
    fetch(`${AUTH_API_URL}/meta/categories`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((tree: Category[]) => {
        if (Array.isArray(tree) && tree.length) setCategories(tree);
      })
      .catch(() => undefined);
  }, []);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { uid: nextUid, type: "short", text: "", options: [], required: true }]);
    setNextUid((value) => value + 1);
  };

  const submit = async (status: "draft" | "published") => {
    setError(null);
    if (title.trim().length < 2) return setError(new Error(L("กรุณาระบุตำแหน่งงาน", "Please enter a job title")));
    if (!category) return setError(new Error(L("กรุณาเลือกหมวดหมู่", "Please choose a category")));
    const min = Number(salaryMin || 0);
    const max = Number(salaryMax || 0);
    if (max < min) return setError(new Error(L("เงินเดือนสูงสุดต้องไม่น้อยกว่าต่ำสุด", "Maximum salary must be at least the minimum")));
    const emptyQuestion = questions.find((question) => !question.text.trim());
    if (emptyQuestion) return setError(new Error(L("กรุณาระบุข้อความของทุกคำถาม หรือลบคำถามที่ว่างออก", "Fill in or remove empty questions")));

    const payload: SaveJobPayload = {
      title: title.trim(),
      category,
      department: department || undefined,
      workStyle,
      employmentType,
      experienceYears: Number(experienceYears || 0),
      openings: Math.max(1, Number(openings || 1)),
      salaryMin: min,
      salaryMax: max,
      salaryNegotiable,
      isUrgent,
      description,
      skills,
      benefits,
      questions: questions.map(({ uid: _uid, ...question }) => question),
      status,
    };

    setSaving(status);
    try {
      const saved = await api<JobDetail>(isEdit ? `/owner/jobs/${initialData!.id}` : "/owner/jobs", {
        method: isEdit ? "PUT" : "POST",
        body: payload,
      });
      router.push(`/job-postings?job=${saved.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error(errorMessage(reason)));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(null);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit("published");
  };

  const planCode = error instanceof ApiError ? error.code : undefined;
  // ประกาศที่ปิดรับไปแล้วแก้ไขได้แต่คงสถานะปิดไว้
  const isClosed = initialData?.status === "closed";
  const isPublished = initialData?.status === "published";

  return (
    <div>
      <Link href="/job-postings" className={styles.backButton}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{t("footer.myJobPostings")}</span>
      </Link>

      <div className={styles.pageHeading}>
        <h1 className={styles.pageTitle}>{isEdit ? t("edit.title") : t("create.title")}</h1>
        <p className={styles.pageSubtitle}>{isEdit ? t("edit.subtitle") : t("create.subtitle")}</p>
      </div>

      {company?.verificationStatus !== "approved" && (
        <Notice tone="warning">
          {L(
            "บริษัทยังไม่ผ่านการยืนยัน บันทึกเป็นฉบับร่างได้ และเผยแพร่ได้หลังทีมงานตรวจสอบเสร็จ",
            "Your company is not verified yet. Save as draft and publish after review.",
          )}
        </Notice>
      )}
      {error && (planCode === "PLAN_LIMIT" ? <UpgradeNotice message={error.message} /> : <Notice tone="error">{error.message}</Notice>)}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {/* ข้อมูลบริษัท (แสดงอย่างเดียว) */}
        {company && (
          <div className={styles.companyCard}>
            <CompanyLogo company={company} size={48} />
            <div className={styles.companyInfo}>
              <span className={styles.companyLabel}>{t("create.company")}</span>
              <span className={styles.companyName}>{company.name}</span>
              <span className={styles.companyLabel}>
                {company.businessType} · {company.province}
              </span>
            </div>
          </div>
        )}

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="job-title">
              {t("create.jobTitleField")} *
            </label>
            <input
              id="job-title"
              className={styles.input}
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("create.jobTitlePlaceholder")}
              required
            />
          </div>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="category">
              {t("create.category")} *
            </label>
            <select id="category" className={styles.input} value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="" disabled>
                {t("create.categoryPlaceholder")}
              </option>
              {categories.map((option) => (
                <option key={option.value} value={option.value}>
                  {isEn ? option.labelEn : option.labelTh}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="department">
              {L("แผนก", "Department")}
            </label>
            <select id="department" className={styles.input} value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">{L("ไม่ระบุ", "Not specified")}</option>
              {DEPARTMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {isEn ? option.en : option.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.fieldGroup}>
            <span className={styles.label}>{L("สถานที่ทำงาน", "Workplace")}</span>
            <div className={styles.segmented}>
              {WORK_TYPE_OPTIONS.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  aria-pressed={workStyle === type.value}
                  className={`${styles.segment} ${workStyle === type.value ? styles.segmentActive : ""}`}
                  onClick={() => setWorkStyle(type.value)}
                >
                  {isEn ? type.en : type.th}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="employment-type">
              {t("create.employmentType")}
            </label>
            <select
              id="employment-type"
              className={styles.input}
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as SaveJobPayload["employmentType"])}
            >
              {EMPLOYMENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {isEn ? option.en : option.th}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="experience">
              {t("create.requiredExperience")}
            </label>
            <input
              id="experience"
              className={styles.input}
              type="number"
              min="0"
              max="50"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="openings">
              {L("จำนวนที่เปิดรับ (อัตรา)", "Openings")}
            </label>
            <input
              id="openings"
              className={styles.input}
              type="number"
              min="1"
              max="999"
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="salary-min">
              {t("create.salaryRange")} *
            </label>
            <div className={styles.salaryRow}>
              <input
                id="salary-min"
                className={styles.input}
                type="number"
                min="0"
                step="1000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder={t("create.salaryMin")}
                aria-label={L("เงินเดือนต่ำสุด", "Minimum salary")}
              />
              <input
                id="salary-max"
                className={styles.input}
                type="number"
                min="0"
                step="1000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder={t("create.salaryMax")}
                aria-label={L("เงินเดือนสูงสุด", "Maximum salary")}
              />
            </div>
            <div className={styles.checkRow}>
              <label>
                <input type="checkbox" checked={salaryNegotiable} onChange={(e) => setSalaryNegotiable(e.target.checked)} />
                {L("เงินเดือนต่อรองได้", "Salary negotiable")}
              </label>
              <label>
                <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
                {L("รับสมัครด่วน", "Urgent hiring")}
              </label>
            </div>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="job-description">
              {t("create.jobDescription")} *
            </label>
            <textarea
              id="job-description"
              className={styles.textarea}
              value={description}
              maxLength={10000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("create.jobDescriptionPlaceholder")}
              required
            />
            <small className={styles.hint}>
              {L("อย่างน้อย 20 ตัวอักษรเมื่อเผยแพร่", "At least 20 characters to publish")} · {description.length}/10000
            </small>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="skills">
              {t("create.requiredSkills")}
            </label>
            <TagInput id="skills" values={skills} onChange={setSkills} placeholder={t("create.skillsPlaceholder")} />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="benefits">
              {L("สวัสดิการ", "Benefits")}
            </label>
            <TagInput id="benefits" values={benefits} onChange={setBenefits} placeholder={L("พิมพ์สวัสดิการแล้วกด Enter", "Type a benefit and press Enter")} />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <span className={styles.label}>{t("create.screeningQuestions")}</span>
            {questions.length === 0 && (
              <small className={styles.hint}>{L("ยังไม่มีคำถาม – ผู้สมัครจะสมัครได้ทันที", "No questions – candidates can apply right away")}</small>
            )}
            <div className={styles.questionList}>
              {questions.map((question, index) => (
                <ScreeningQuestionBuilder
                  key={question.uid}
                  question={question}
                  index={index}
                  onChange={(next) => setQuestions((prev) => prev.map((item) => (item.uid === next.uid ? next : item)))}
                  onRemove={() => setQuestions((prev) => prev.filter((item) => item.uid !== question.uid))}
                />
              ))}
            </div>
            {questions.length < 20 && (
              <button type="button" className={styles.addQuestionButton} onClick={addQuestion}>
                {t("create.addQuestion")}
              </button>
            )}
          </div>
        </div>

        <div className={styles.footerActions}>
          {isEdit && (
            <Link href="/job-postings" className={styles.saveButton}>
              {L("ยกเลิก", "Cancel")}
            </Link>
          )}
          {!isPublished && !isClosed && (
            <button type="button" className={styles.saveButton} disabled={saving !== null} onClick={() => submit("draft")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {saving === "draft" ? L("กำลังบันทึก...", "Saving...") : t("create.saveDraft")}
            </button>
          )}
          <button type="submit" className={styles.publishButton} disabled={saving !== null}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            {saving === "published"
              ? L("กำลังบันทึก...", "Saving...")
              : isPublished || isClosed
                ? t("edit.saveChanges")
                : t("create.publish")}
          </button>
        </div>
      </form>
    </div>
  );
}
