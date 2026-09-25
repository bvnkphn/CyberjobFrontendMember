"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CompanyLogo, Notice, UpgradeNotice } from "@/components/ui/ui";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
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

/** ประเภทการจ้างงาน: เต็มเวลา พาร์ทไทม์ สัญญาจ้าง ชั่วคราว และฝึกงาน */
const EMPLOYMENT_TYPES = [
  { value: "fulltime", th: "งานเต็มเวลา", en: "Full-time" },
  { value: "parttime", th: "พาร์ทไทม์", en: "Part-time" },
  { value: "contract", th: "สัญญาจ้าง", en: "Contract" },
  { value: "temporary", th: "งานชั่วคราว", en: "Temporary" },
  { value: "internship", th: "ฝึกงาน (Internship)", en: "Internship" },
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
    initialData?.employmentType ?? "fulltime",
  );
  const [workStyle, setWorkStyle] = useState<WorkStyle>(initialData?.workStyle ?? "onsite");
  const [experienceYears, setExperienceYears] = useState(String(initialData?.experienceYears ?? 0));
  const [openings, setOpenings] = useState(String(initialData?.openings ?? 1));
  const [noSalary, setNoSalary] = useState(
    initialData ? (initialData.salaryMin === 0 && initialData.salaryMax === 0) : false,
  );
  const [salaryMin, setSalaryMin] = useState(initialData && initialData.salaryMin > 0 ? String(initialData.salaryMin) : "");
  const [salaryMax, setSalaryMax] = useState(initialData && initialData.salaryMax > 0 ? String(initialData.salaryMax) : "");
  const [salaryNegotiable, setSalaryNegotiable] = useState(initialData?.salaryNegotiable ?? false);
  const [isUrgent, setIsUrgent] = useState(initialData?.isUrgent ?? false);
  const [descTab, setDescTab] = useState<"write" | "preview">("write");
  const [description, setDescription] = useState(initialData?.description ?? "");
  // skills และ benefits รวมเข้าไปใน Markdown description แล้ว
  const skills: string[] = [];
  const benefits: string[] = [];
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

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("job-description") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = description.substring(start, end);
    const replacement = `${prefix}${sel}${suffix}`;
    const next = description.substring(0, start) + replacement + description.substring(end);
    setDescription(next);
    setTimeout(() => {
      textarea.focus();
      if (sel) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + sel.length);
      } else {
        const cursor = start + prefix.length;
        textarea.setSelectionRange(cursor, cursor);
      }
    }, 0);
  };

  const insertInternshipTemplate = () => {
    const template = `## หน้าที่และความรับผิดชอบ (Responsibilities)
- ร่วมศึกษา ออกแบบ และพัฒนาฟีเจอร์ของระบบเว็บแอปพลิเคชัน
- เขียนโค้ดและทดสอบการทำงาน (Coding & Testing)
- ร่วมประชุมและเสนอไอเดียใหม่ ๆ กับทีมงาน

## ทักษะที่ต้องการ (Required Skills)
- ความรู้พื้นฐานด้านการเขียนโปรแกรม เช่น Python, Java, JavaScript
- ความเข้าใจพื้นฐาน HTML/CSS, SQL หรือภาษาที่เกี่ยวข้องกับสาขา
- ความสามารถในการทำงานเป็นทีม และเรียนรู้ได้เร็ว

## คุณสมบัติผู้สมัคร (Qualifications)
- กำลังศึกษาในระดับ ปวส. หรือ ปริญญาตรี สาขาคอมพิวเตอร์ หรือสาขาที่เกี่ยวข้อง
- มีความรู้พื้นฐานด้านการเขียนโปรแกรม และกระตือรือร้นในการเรียนรู้
- สามารถฝึกงานได้ตั้งแต่ 2-4 เดือนขึ้นไป

## สวัสดิการและสิ่งที่จะได้รับ (Benefits)
- เบี้ยเลี้ยงการฝึกงาน (ตามตกลง / มีผลงาน)
- หนังสือรับรองการฝึกงาน (Certificate of Internship)
- ชั่วโมงการทำงานยืดหยุ่น (Flexible hours)
- โอกาสพิจารณาบรรจุเป็นพนักงานประจำหลังจบการศึกษา`;
    setDescription(template);
    setDescTab("preview");
  };

  const insertJobTemplate = () => {
    const template = `## หน้าที่และความรับผิดชอบ (Responsibilities)
- (ระบุหน้าที่หลักของตำแหน่งนี้)
- (ระบุงานที่ต้องทำประจำวัน)
- (ระบุผลลัพธ์ที่คาดหวัง)

## ทักษะที่ต้องการ (Required Skills)
- (ระบุทักษะและความสามารถที่จำเป็น)
- (ระบุเครื่องมือ / ซอฟต์แวร์ที่ใช้)

## คุณสมบัติผู้สมัคร (Qualifications)
- วุฒิการศึกษา ปริญญาตรี สาขาที่เกี่ยวข้อง
- ประสบการณ์ทำงาน (ระบุปี) ขึ้นไป
- (ระบุคุณสมบัติอื่น ๆ)

## สวัสดิการ (Benefits)
- ประกันสังคม / ประกันสุขภาพ
- วันหยุดพักร้อนประจำปี
- (ระบุสวัสดิการอื่น ๆ)`;
    setDescription(template);
    setDescTab("preview");
  };

  const submit = async (status: "draft" | "published") => {
    setError(null);
    if (title.trim().length < 2) return setError(new Error(L("กรุณาระบุตำแหน่งงาน", "Please enter a job title")));
    if (!category) return setError(new Error(L("กรุณาเลือกหมวดหมู่", "Please choose a category")));
    const min = noSalary ? 0 : Number(salaryMin || 0);
    const max = noSalary ? 0 : Number(salaryMax || 0);
    if (!noSalary && max < min) return setError(new Error(L("เงินเดือนสูงสุดต้องไม่น้อยกว่าต่ำสุด", "Maximum salary must be at least the minimum")));
    if (status === "published") {
      if (!noSalary && max <= 0 && employmentType !== "internship" && !salaryNegotiable) {
        return setError(new Error(L("กรุณาระบุช่วงเงินเดือน หรือเลือกแบบไม่มีเงินเดือน/ตามตกลง", "Please enter salary or choose no salary / negotiable")));
      }
      if (description.trim().length < 20) {
        return setError(new Error(L("กรุณาระบุรายละเอียดงานอย่างน้อย 20 ตัวอักษร", "Please enter job description at least 20 characters")));
      }
    }
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
      salaryNegotiable: noSalary ? true : salaryNegotiable,
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className={styles.label} htmlFor="salary-min">
                {t("create.salaryRange")} *
              </label>
              {employmentType === "internship" && (
                <span style={{ fontSize: "12px", color: "var(--color-blue)", fontWeight: 600 }}>
                  {L("ตำแหน่งฝึกงาน สามารถเลือกไม่มีเงินเดือน/มีเบี้ยเลี้ยงได้", "Internships can be unpaid or allowance-based")}
                </span>
              )}
            </div>
            <div className={styles.salaryRow}>
              <input
                id="salary-min"
                className={styles.input}
                type="number"
                min="0"
                step="1000"
                value={noSalary ? "" : salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder={noSalary ? L("ไม่มีเงินเดือน", "Unpaid") : t("create.salaryMin")}
                disabled={noSalary}
                aria-label={L("เงินเดือนต่ำสุด", "Minimum salary")}
              />
              <input
                id="salary-max"
                className={styles.input}
                type="number"
                min="0"
                step="1000"
                value={noSalary ? "" : salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder={noSalary ? L("ตามตกลง / มีเบี้ยเลี้ยง", "Negotiable / Allowance") : t("create.salaryMax")}
                disabled={noSalary}
                aria-label={L("เงินเดือนสูงสุด", "Maximum salary")}
              />
            </div>
            <div className={styles.checkRow}>
              <label style={{ fontWeight: 600, color: "var(--color-navy-900)" }}>
                <input
                  type="checkbox"
                  checked={noSalary}
                  onChange={(e) => {
                    setNoSalary(e.target.checked);
                    if (e.target.checked) setSalaryNegotiable(true);
                  }}
                />
                {L("ไม่มีเงินเดือน (แบบฝึกงาน หรือตามตกลง/มีเบี้ยเลี้ยง)", "No fixed salary (Unpaid / Internship / Allowance)")}
              </label>
              {!noSalary && (
                <label>
                  <input type="checkbox" checked={salaryNegotiable} onChange={(e) => setSalaryNegotiable(e.target.checked)} />
                  {L("เงินเดือนต่อรองได้", "Salary negotiable")}
                </label>
              )}
              <label>
                <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
                {L("รับสมัครด่วน", "Urgent hiring")}
              </label>
            </div>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <div className={styles.markdownHeader}>
              <label className={styles.label} htmlFor="job-description">
                {t("create.jobDescription")} (รองรับ Markdown) *
              </label>
              <div className={styles.markdownTabs}>
                <button
                  type="button"
                  className={`${styles.markdownTab} ${descTab === "write" ? styles.markdownTabActive : ""}`}
                  onClick={() => setDescTab("write")}
                >
                  {L("แก้ไข (Write)", "Write")}
                </button>
                <button
                  type="button"
                  className={`${styles.markdownTab} ${descTab === "preview" ? styles.markdownTabActive : ""}`}
                  onClick={() => setDescTab("preview")}
                >
                  {L("แสดงตัวอย่าง (Preview)", "Preview")}
                </button>
              </div>
            </div>

            {descTab === "write" && (
              <>
                <div className={styles.markdownToolbar}>
                  <button type="button" className={styles.toolbarBtn} onClick={() => insertMarkdown("**", "**")} title={L("ตัวหนา (**)", "Bold (**)")}>
                    <strong>B</strong>
                  </button>
                  <button type="button" className={styles.toolbarBtn} onClick={() => insertMarkdown("*", "*")} title={L("ตัวเอียง (*)", "Italic (*)")}>
                    <em>I</em>
                  </button>
                  <button type="button" className={styles.toolbarBtn} onClick={() => insertMarkdown("## ")} title={L("หัวข้อหลัก (##)", "Heading 2 (##)")}>
                    ##
                  </button>
                  <button type="button" className={styles.toolbarBtn} onClick={() => insertMarkdown("### ")} title={L("หัวข้อย่อย (###)", "Heading 3 (###)")}>
                    ###
                  </button>
                  <button type="button" className={styles.toolbarBtn} onClick={() => insertMarkdown("- ")} title={L("รายการหัวข้อย่อย (-)", "Bullet List (-)")}>
                    - {L("รายการ", "List")}
                  </button>
                  <button type="button" className={styles.toolbarBtn} onClick={() => insertMarkdown("1. ")} title={L("รายการตัวเลข (1.)", "Numbered List (1.)")}>
                    1. {L("ลำดับ", "Number")}
                  </button>
                  <button type="button" className={styles.toolbarBtn} onClick={() => insertMarkdown("> ")} title={L("ข้อความอ้างอิง (>)", "Quote (>)")}>
                    &gt; {L("อ้างอิง", "Quote")}
                  </button>
                  <button type="button" className={styles.toolbarBtn} onClick={() => insertMarkdown("```\n", "\n```")} title={L("บล็อกโค้ด (```)", "Code Block (```)")}>
                    &lt;/&gt;
                  </button>
                  {employmentType !== "internship" && (
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }}
                      onClick={insertJobTemplate}
                      title={L("ใส่เทมเพลตประกาศงานทั่วไป", "Insert Job Template")}
                    >
                      {L("เทมเพลตงาน", "Job Template")}
                    </button>
                  )}
                  {employmentType === "internship" && (
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}
                      onClick={insertInternshipTemplate}
                      title={L("ใส่เทมเพลตฝึกงานอัตโนมัติ", "Insert Internship Template")}
                    >
                      {L("เทมเพลตฝึกงาน", "Internship Template")}
                    </button>
                  )}
                </div>

                <textarea
                  id="job-description"
                  className={styles.textarea}
                  value={description}
                  maxLength={10000}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    employmentType === "internship"
                      ? L(
                          "ระบุหน้าที่การฝึกงาน ทักษะที่ต้องการ คุณสมบัติ สวัสดิการและเบี้ยเลี้ยง\nกดปุ่ม เทมเพลตฝึกงาน เพื่อใส่โครงสร้างอัตโนมัติ (รองรับ Markdown)",
                          "Describe internship duties, required skills, qualifications, and allowance. Click template. (Markdown supported)"
                        )
                      : L(
                          "ระบุหน้าที่ความรับผิดชอบ ทักษะที่ต้องการ คุณสมบัติผู้สมัคร และสวัสดิการ\nกดปุ่ม เทมเพลตงาน เพื่อใส่โครงสร้างอัตโนมัติ (รองรับ Markdown)",
                          "Describe job duties, required skills, qualifications, and benefits. Click template. (Markdown supported)"
                        )
                  }
                  required
                />
              </>
            )}

            {descTab === "preview" && (
              <div className={styles.markdownPreview}>
                {description.trim() ? (
                  <MarkdownContent content={description} />
                ) : (
                  <div className={styles.emptyPreview}>
                    {L("ยังไม่มีข้อความ กรุณาพิมพ์รายละเอียดในแท็บ 'แก้ไข (Write)' ก่อนแสดงตัวอย่าง", "No content yet. Type your description in 'Write' tab first.")}
                  </div>
                )}
              </div>
            )}

            <small className={styles.hint}>
              {L(
                "รองรับ Markdown · ใส่ทักษะ คุณสมบัติ สวัสดิการ และรายละเอียดทั้งหมดในช่องนี้ · อย่างน้อย 20 ตัวอักษรเมื่อเผยแพร่",
                "Markdown supported · Include skills, qualifications, benefits & all details here · At least 20 chars to publish"
              )} · {description.length}/10000
            </small>
          </div>
        </div>

        {/* ทักษะและสวัสดิการรวมอยู่ใน Markdown description แล้ว */}

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
