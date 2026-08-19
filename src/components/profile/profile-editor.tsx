"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "../icons";
import { DesiredJobForm } from "./desired-job-form";
import { EducationForm } from "./education-form";
import { WorkExperienceForm } from "./work-experience-form";
import { CertificateForm } from "./certificate-form";
import { LanguageForm } from "./language-form";
import { OtherSkillsForm } from "./other-skills-form";
import { ProfilePageHeading } from "./profile-page-heading";
import { formDataToObject, getProfile, saveProfileSection, type MemberProfile } from "@/lib/member-api";
import "./profile-editor.css";

type ProfileSection = {
  id: ProfileSectionId;
  icon: IconName;
  label: string;
  action?: string;
};

type ProfileSectionId = "personal" | "desired-job" | "education" | "work-experience" | "certificate" | "language" | "other-skills";

const sections: ProfileSection[] = [
  { id: "personal", icon: "user", label: "ข้อมูลส่วนบุคคล", action: "เพิ่ม" },
  { id: "desired-job", icon: "briefcase", label: "ลักษณะงานที่ต้องการ", action: "เพิ่ม" },
  { id: "education", icon: "education", label: "ประวัติการศึกษา", action: "เพิ่ม" },
  { id: "work-experience", icon: "edit", label: "ประวัติการฝึกงาน/ทำงาน", action: "เพิ่ม" },
  { id: "certificate", icon: "trophy", label: "อบรมประกาศนียบัตร", action: "เพิ่ม" },
  { id: "language", icon: "globe", label: "ความสามารถทางภาษา", action: "เพิ่ม" },
  { id: "other-skills", icon: "skills", label: "ความสามารถอื่นๆ", action: "เพิ่ม" },
];

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const apiSections: Record<ProfileSectionId, string> = {
  personal: "personal",
  "desired-job": "desiredJob",
  education: "educations",
  "work-experience": "workExperiences",
  certificate: "certificates",
  language: "languages",
  "other-skills": "otherSkills",
};

const requiredSectionFields: Partial<Record<ProfileSectionId, string[]>> = {
  personal: ["firstName", "lastName", "gender", "birthDay", "birthMonth", "birthYear", "nationality", "phone", "address"],
  "desired-job": ["desiredPosition1", "desiredJobType1", "workplacePreference", "availableStartDate"],
  education: ["education1Level", "education1Institution", "education1Faculty", "education1Major", "education1Year"],
  "work-experience": [
    "workExperience1StartMonth", "workExperience1StartYear", "workExperience1EndMonth",
    "workExperience1EndYear", "workExperience1Company", "workExperience1Position",
  ],
  certificate: ["certificate1Title", "certificate1FileName"],
  language: ["language1Name", "language1Listening", "language1Speaking", "language1Reading", "language1Writing"],
  "other-skills": ["specialty1"],
};

const completionWeights: Record<ProfileSectionId, Record<string, number>> = {
  personal: { firstName: 4, lastName: 4, gender: 3, birthDay: 3, birthMonth: 3, birthYear: 3, nationality: 3, phone: 5, address: 7 },
  "desired-job": { desiredPosition1: 8, desiredJobType1: 6, workplacePreference: 3, availableStartDate: 3 },
  education: { education1Level: 4, education1Institution: 4, education1Faculty: 2, education1Year: 3, education1Major: 2 },
  "work-experience": { workExperience1StartMonth: 1, workExperience1StartYear: 1, workExperience1EndMonth: 1, workExperience1EndYear: 1, workExperience1Company: 3, workExperience1Position: 3 },
  certificate: { certificate1Title: 2.5, certificate1FileName: 2.5 },
  language: { language1Name: 2, language1Listening: 2, language1Speaking: 2, language1Reading: 2, language1Writing: 2 },
  "other-skills": { specialty1: 3, projects: 2 },
};

function hasRequiredValues(data: unknown, fields: string[]) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const record = data as Record<string, unknown>;
  return fields.every((field) => String(record[field] ?? "").trim().length > 0);
}

function completedFromProfile(profile: MemberProfile) {
  const completed = new Set<ProfileSectionId>();
  for (const [section, fields] of Object.entries(requiredSectionFields) as [ProfileSectionId, string[]][]) {
    if (hasRequiredValues(profile[apiSections[section] as keyof MemberProfile], fields)) completed.add(section);
  }
  return completed;
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

function calculateCompletion(profile: MemberProfile | null, overrideSection?: ProfileSectionId, overrideData?: Record<string, unknown>) {
  let score = 0;
  for (const section of sections) {
    const stored = profile?.[apiSections[section.id] as keyof MemberProfile];
    const data = section.id === overrideSection
      ? overrideData
      : stored && typeof stored === "object" && !Array.isArray(stored) ? stored as Record<string, unknown> : undefined;
    for (const [field, weight] of Object.entries(completionWeights[section.id])) {
      if (data && hasValue(data[field])) score += weight;
    }
  }
  return Math.round(score);
}

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

function Field({ label, required, children, className = "" }: FieldProps) {
  return (
    <label className={`field ${className}`}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children}
    </label>
  );
}

export function ProfileEditor() {
  const [activeSection, setActiveSection] = useState<ProfileSectionId>("personal");
  const [completedSections, setCompletedSections] = useState<Set<ProfileSectionId>>(new Set());
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [completion, setCompletion] = useState(0);
  const [gender, setGender] = useState("male");
  const [saved, setSaved] = useState(false);
  const activeDataValue = profile?.[apiSections[activeSection] as keyof MemberProfile];
  const initialData = activeDataValue && typeof activeDataValue === "object" && !Array.isArray(activeDataValue) ? activeDataValue as Record<string, unknown> : {};

  useEffect(() => {
    getProfile()
      .then((loadedProfile) => { setProfile(loadedProfile); setCompletion(loadedProfile.completion); setCompletedSections(completedFromProfile(loadedProfile)); })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!profile) return;
    const section = profile[apiSections[activeSection] as keyof MemberProfile];
    if (!section || typeof section !== "object" || Array.isArray(section)) return;
    const frame = window.requestAnimationFrame(() => {
      const form = document.querySelector<HTMLFormElement>(".profile-form-area form");
      if (!form) return;
      for (const [name, value] of Object.entries(section)) {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement) {
          if (field.type === "checkbox") field.checked = value === true || value === "on";
          else if (field.type !== "file") field.value = String(value ?? "");
        } else if (field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
          field.value = String(value ?? "");
        }
      }
      const savedGender = (section as Record<string, unknown>).gender;
      if (activeSection === "personal" && typeof savedGender === "string") setGender(savedGender);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeSection, profile]);

  const refreshActiveSectionStatus = (form: HTMLFormElement) => {
    const fields = requiredSectionFields[activeSection];
    if (!fields) return;
    const data = formDataToObject(form);
    setCompletion(calculateCompletion(profile, activeSection, data));
    setCompletedSections((current) => {
      const next = new Set(current);
      if (form.checkValidity() && hasRequiredValues(data, fields)) next.add(activeSection);
      else next.delete(activeSection);
      return next;
    });
  };

  // UX-only submit: replace this function with the profile API mutation later.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const data = formDataToObject(event.currentTarget);
      const result = await saveProfileSection(apiSections[activeSection], data) as { completion?: number; updatedAt?: string };
      setProfile((current) => current ? {
        ...current,
        [apiSections[activeSection]]: data,
        ...(activeSection === "personal" ? {
          firstName: typeof data.firstName === "string" ? data.firstName : current.firstName,
          lastName: typeof data.lastName === "string" ? data.lastName : current.lastName,
          address: typeof data.address === "string" ? data.address : current.address,
        } : {}),
        updatedAt: result.updatedAt ?? current.updatedAt,
      } : current);
      setCompletedSections((current) => new Set(current).add(activeSection));
      setCompletion(result.completion ?? calculateCompletion(profile, activeSection, data));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfilePageHeading title="แก้ไข Resume" description="เติมข้อมูลแต่ละส่วนให้ครบ เพื่อเพิ่มโอกาสให้ผู้ประกอบการค้นพบคุณ" />
        <aside className="profile-sidebar" aria-label="ส่วนของประวัติ">
          <section className="completion-card">
            <div className="completion-main">
              <div
                className="progress-ring"
                style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}
                aria-label={`ความสมบูรณ์ของประวัติ ${completion} เปอร์เซ็นต์`}
              >
                <span>{completion}%</span>
              </div>
              <Link className="profile-shortcut" href="/profile"><Icon name="user" /> หน้าโปรไฟล์</Link>
            </div>
            <p>ความสมบูรณ์ของประวัติ</p>
            <small>{completion === 100 ? "ข้อมูลสำหรับ Resume ครบถ้วนแล้ว" : "ข้อมูลหลักมีน้ำหนักมากกว่าข้อมูลเสริม"}</small>
          </section>

          <label className="mobile-section-picker">
            <span>กำลังแก้ไข</span>
            <select value={activeSection} onChange={(event) => setActiveSection(event.target.value as ProfileSectionId)}>
              {sections.map(({ id, label }) => <option value={id} key={id}>{label}</option>)}
            </select>
          </label>

          <nav className="section-nav" aria-label="หัวข้อแก้ไขประวัติ">
            {sections.map(({ id, icon, label, action }) => (
              <button
                className={activeSection === id ? "active" : ""}
                type="button"
                onClick={() => setActiveSection(id)}
                aria-current={activeSection === id ? "page" : undefined}
                key={label}
              >
                <Icon name={icon} />
                <span>{label}</span>
                {action && !completedSections.has(id) && <em>{action}</em>}
              </button>
            ))}
          </nav>
        </aside>

        <div className="profile-form-area" onInput={(event) => {
          const form = (event.target as HTMLElement).closest("form");
          if (form) refreshActiveSectionStatus(form);
        }} onChange={(event) => {
          const form = (event.target as HTMLElement).closest("form");
          if (form) refreshActiveSectionStatus(form);
        }}>
        {activeSection === "other-skills" ? (
          <OtherSkillsForm key={`other-${profile?.updatedAt ?? "new"}`} initialData={initialData} onSubmit={submit} saved={saved} />
        ) : activeSection === "language" ? (
          <LanguageForm key={`language-${profile?.updatedAt ?? "new"}`} initialData={initialData} onSubmit={submit} saved={saved} />
        ) : activeSection === "certificate" ? (
          <CertificateForm key={`certificate-${profile?.updatedAt ?? "new"}`} initialData={initialData} onSubmit={submit} saved={saved} />
        ) : activeSection === "work-experience" ? (
          <WorkExperienceForm key={`work-${profile?.updatedAt ?? "new"}`} initialData={initialData} onSubmit={submit} saved={saved} />
        ) : activeSection === "education" ? (
          <EducationForm key={`education-${profile?.updatedAt ?? "new"}`} initialData={initialData} onSubmit={submit} saved={saved} />
        ) : activeSection === "desired-job" ? (
          <DesiredJobForm key={`desired-${profile?.updatedAt ?? "new"}`} initialData={initialData} onSubmit={submit} saved={saved} />
        ) : (
        <form className="profile-form" onSubmit={submit} id="personal">
          <h1>ข้อมูลส่วนบุคคล</h1>
          <div className="form-grid">
            <Field label="ชื่อ" required>
              <input name="firstName" autoComplete="given-name" placeholder="กรอกชื่อ" required />
            </Field>
            <Field label="นามสกุล" required>
              <input name="lastName" autoComplete="family-name" placeholder="กรอกนามสกุล" required />
            </Field>

            <fieldset className="field gender-field">
              <legend>เพศ <b aria-hidden="true">*</b></legend>
              <div className="segmented">
                <button className={gender === "male" ? "selected" : ""} type="button" aria-pressed={gender === "male"} onClick={() => setGender("male")}>ชาย</button>
                <button className={gender === "female" ? "selected" : ""} type="button" aria-pressed={gender === "female"} onClick={() => setGender("female")}>หญิง</button>
              </div>
              <input type="hidden" name="gender" value={gender} />
            </fieldset>
            <div />

            <Field label="วันเกิด" required className="full">
              <div className="date-grid">
                <select name="birthDay" aria-label="วันที่" required defaultValue="">
                  <option value="" disabled>วันที่</option>
                  {Array.from({ length: 31 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}
                </select>
                <select name="birthMonth" aria-label="เดือน" required defaultValue="">
                  <option value="" disabled>เดือน</option>
                  {thaiMonths.map((month) => <option key={month}>{month}</option>)}
                </select>
                <select name="birthYear" aria-label="ปี" required defaultValue="">
                  <option value="" disabled>ปี</option>
                  {Array.from({ length: 70 }, (_, index) => <option key={2568 - index}>{2568 - index}</option>)}
                </select>
              </div>
            </Field>

            <Field label="สัญชาติ" required>
              <select name="nationality" defaultValue="" required><option value="">เลือก</option><option>ไทย</option><option>อื่น ๆ</option></select>
            </Field>
            <Field label="ศาสนา">
              <select name="religion" defaultValue=""><option value="">เลือก</option><option>พุทธ</option><option>คริสต์</option><option>อิสลาม</option><option>อื่น ๆ</option></select>
            </Field>
            <Field label="น้ำหนัก (กิโลกรัม)"><input name="weight" type="number" min="0" step="0.1" placeholder="0.00" /></Field>
            <Field label="ส่วนสูง (เซนติเมตร)"><input name="height" type="number" min="0" step="0.1" placeholder="0.00" /></Field>

            <label className="checkbox-field full"><input name="hasDisability" type="checkbox" /> บุคคลทุพพลภาพ</label>
            <Field label="สถานภาพสมรส" className="full">
              <select name="maritalStatus" defaultValue=""><option value="">เลือก</option><option>โสด</option><option>สมรส</option><option>หย่าร้าง</option><option>หม้าย</option></select>
            </Field>
            <Field label="เบอร์โทรศัพท์" required><input type="tel" name="phone" autoComplete="tel" placeholder="0XX-XXX-XXXX" required /></Field>
            <Field label="LINE ID"><input name="lineId" placeholder="ระบุ" /></Field>
            <Field label="ที่อยู่ปัจจุบัน" required className="full">
              <textarea name="address" autoComplete="street-address" placeholder="ระบุ (บ้านเลขที่ ตึก/ห้อง แขวง/ตำบล ถนน รหัสไปรษณีย์)" required />
            </Field>
          </div>

          <div className="save-row">
            <button className="primary-button save-button" type="submit">บันทึก</button>
            {saved && <p className="save-message" role="status">บันทึกตัวอย่างเรียบร้อยแล้ว</p>}
          </div>
        </form>
        )}
        </div>
      </div>
    </main>
  );
}
