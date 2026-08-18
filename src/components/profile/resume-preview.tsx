"use client";

import { useEffect, useState } from "react";
import { getProfile, type MemberProfile } from "@/lib/member-api";
import { Icon } from "../icons";
import { ProfilePageHeading } from "./profile-page-heading";
import "./profile-editor.css";
import "./resume-preview.css";

const text = (value: unknown, fallback = "-") => typeof value === "string" && value.trim() ? value : fallback;
const record = (value: unknown) => value && !Array.isArray(value) && typeof value === "object" ? value as Record<string, unknown> : {};

export function ResumePreview() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getProfile().then(setProfile).catch(() => undefined).finally(() => setLoading(false)); }, []);

  const personal = record(profile?.personal);
  const desired = record(profile?.desiredJob);
  const educations = record(profile?.educations);
  const experiences = record(profile?.workExperiences);
  const certificates = record(profile?.certificates);
  const languages = record(profile?.languages);
  const other = record(profile?.otherSkills);
  const fullName = `${text(profile?.firstName ?? personal.firstName, "ชื่อ")} ${text(profile?.lastName ?? personal.lastName, "นามสกุล")}`;

  const printResume = () => {
    const previousTitle = document.title;
    document.title = `Resume-${fullName}`;
    window.print();
    document.title = previousTitle;
  };

  return (
    <main className="resume-preview-page">
      <div className="resume-preview-layout">
        <ProfilePageHeading title="ดู Resume" />
        <div className="resume-toolbar">
          <button type="button" onClick={printResume}><span aria-hidden="true">⎙</span> พิมพ์</button>
          <button type="button" onClick={printResume}><span aria-hidden="true">⇩</span> ดาวน์โหลดเป็น PDF</button>
        </div>

        {loading ? <p className="resume-loading">กำลังโหลด Resume...</p> : (
        <article className="resume-paper">
          <header className="resume-header">
            <div className="resume-avatar" aria-hidden="true">{fullName.charAt(0)}</div>
            <div><h1>{fullName}</h1><p>{text(desired.desiredPosition1, "ตำแหน่งงานที่ต้องการ")}</p></div>
          </header>

          <div className="resume-contact">
            <span>{text(personal.phone, "ยังไม่ระบุเบอร์โทร")}</span>
            <span>{text(personal.lineId, "ยังไม่ระบุ LINE ID")}</span>
            <span>{text(profile?.address ?? personal.address, "ยังไม่ระบุที่อยู่")}</span>
          </div>

          <div className="resume-columns">
            <aside>
              <ResumeSection title="เป้าหมายทางอาชีพ">
                <p>{[desired.desiredPosition1, desired.desiredPosition2, desired.desiredPosition3].map((item) => text(item, "")).filter(Boolean).join(" / ") || "ยังไม่ได้ระบุตำแหน่งงาน"}</p>
                <p>เงินเดือน: {text(desired.expectedSalary)}</p>
                <p>รูปแบบงาน: {text(desired.workplacePreference)}</p>
              </ResumeSection>

              <ResumeSection title="การศึกษา">
                <ResumeRepeated data={educations} prefixes={["education1", "education2", "education3"]} primary="Institution" secondary="Level" />
              </ResumeSection>

              <ResumeSection title="ทักษะเฉพาะทาง">
                <ul>{[other.specialty1, other.specialty2, other.specialty3, other.specialty4, other.specialty5].map((skill) => text(skill, "")).filter(Boolean).map((skill) => <li key={skill}>{skill}</li>)}</ul>
              </ResumeSection>

              <ResumeSection title="ภาษา">
                <ResumeRepeated data={languages} prefixes={["language1", "language2", "language3", "language4", "language5"]} primary="Name" secondary="Speaking" />
              </ResumeSection>
            </aside>

            <section className="resume-main-column">
              <ResumeSection title="เกี่ยวกับฉัน">
                <p>{text(other.projects, "เพิ่มข้อมูลโครงการ ผลงาน และประสบการณ์อื่น ๆ เพื่อแนะนำตัวกับผู้ประกอบการ")}</p>
              </ResumeSection>

              <ResumeSection title="ประสบการณ์การทำงาน">
                <ResumeRepeated data={experiences} prefixes={["workExperience1", "workExperience2", "workExperience3"]} primary="Position" secondary="Company" description="Description" />
              </ResumeSection>

              <ResumeSection title="ประกาศนียบัตร">
                <ResumeRepeated data={certificates} prefixes={["certificate1", "certificate2", "certificate3", "certificate4", "certificate5"]} primary="Title" secondary="FileName" />
              </ResumeSection>

              <ResumeSection title="ข้อมูลเพิ่มเติม">
                <div className="resume-facts"><span>ความเร็วพิมพ์ไทย: {text(other.thaiTypingSpeed)} คำ/นาที</span><span>ความเร็วพิมพ์อังกฤษ: {text(other.englishTypingSpeed)} คำ/นาที</span></div>
              </ResumeSection>
            </section>
          </div>
        </article>
        )}
      </div>
    </main>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="resume-section"><h2>{title}</h2>{children}</section>;
}

function ResumeRepeated({ data, prefixes, primary, secondary, description }: { data: Record<string, unknown>; prefixes: string[]; primary: string; secondary: string; description?: string }) {
  const items = prefixes.map((prefix) => ({ primary: text(data[`${prefix}${primary}`], ""), secondary: text(data[`${prefix}${secondary}`], ""), description: description ? text(data[`${prefix}${description}`], "") : "" })).filter((item) => item.primary || item.secondary);
  return items.length ? <div className="resume-repeated">{items.map((item, index) => <div key={`${item.primary}-${index}`}><strong>{item.primary || item.secondary}</strong>{item.primary && item.secondary && <span>{item.secondary}</span>}{item.description && <p>{item.description}</p>}</div>)}</div> : <p>ยังไม่มีข้อมูล</p>;
}
