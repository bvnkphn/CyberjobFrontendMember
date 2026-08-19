"use client";

import { useEffect, useRef, useState } from "react";
import { getProfile, type MemberProfile } from "@/lib/member-api";
import { Icon } from "../icons";
import { ProfilePageHeading } from "./profile-page-heading";
import { useLanguage } from "../language-provider";
import "./profile-editor.css";
import "./resume-preview.css";

const text = (value: unknown, fallback = "-") => typeof value === "string" && value.trim() ? value : fallback;
const record = (value: unknown) => value && !Array.isArray(value) && typeof value === "object" ? value as Record<string, unknown> : {};

export function ResumePreview() {
  const { locale } = useLanguage();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const resumeRef = useRef<HTMLElement>(null);

  useEffect(() => { getProfile().then(setProfile).catch(() => undefined).finally(() => setLoading(false)); }, []);

  const personal = record(profile?.personal);
  const desired = record(profile?.desiredJob);
  const educations = record(profile?.educations);
  const experiences = record(profile?.workExperiences);
  const certificates = record(profile?.certificates);
  const languages = record(profile?.languages);
  const other = record(profile?.otherSkills);
  const fullName = `${text(profile?.firstName ?? personal.firstName, locale === "th" ? "ชื่อ" : "First name")} ${text(profile?.lastName ?? personal.lastName, locale === "th" ? "นามสกุล" : "Last name")}`;

  const printResume = () => {
    const previousTitle = document.title;
    document.title = `Resume-${fullName}`;
    window.print();
    document.title = previousTitle;
  };

  const downloadPdf = async () => {
    if (!resumeRef.current || downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const image = canvas.toDataURL("image/jpeg", 0.94);
      let remainingHeight = imageHeight;
      let offset = 0;

      pdf.addImage(image, "JPEG", 0, offset, pageWidth, imageHeight, undefined, "FAST");
      remainingHeight -= pageHeight;
      while (remainingHeight > 0) {
        offset -= pageHeight;
        pdf.addPage();
        pdf.addImage(image, "JPEG", 0, offset, pageWidth, imageHeight, undefined, "FAST");
        remainingHeight -= pageHeight;
      }

      const safeName = fullName.replace(/[\\/:*?"<>|]/g, "-").trim() || "CyberJob";
      pdf.save(`Resume-${safeName}.pdf`);
    } catch {
      window.alert("ไม่สามารถสร้างไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="resume-preview-page">
      <div className="resume-preview-layout">
        <ProfilePageHeading title="ดู Resume" description="ตรวจสอบข้อมูลก่อนพิมพ์หรือบันทึกเป็น PDF" />
        <div className="resume-toolbar">
          <button type="button" onClick={printResume}><span aria-hidden="true">⎙</span> พิมพ์</button>
          <button type="button" onClick={downloadPdf} disabled={loading || downloading}><span aria-hidden="true">⇩</span> {downloading ? "กำลังสร้าง PDF..." : "ดาวน์โหลดเป็น PDF"}</button>
        </div>

        {loading ? <p className="resume-loading">กำลังโหลด Resume...</p> : (
        <article className="resume-paper" ref={resumeRef}>
          <header className="resume-header">
            <div className="resume-avatar" aria-hidden="true">{fullName.charAt(0)}</div>
            <div><h1 data-no-translate>{fullName}</h1><p data-no-translate>{text(desired.desiredPosition1, locale === "th" ? "ตำแหน่งงานที่ต้องการ" : "Desired position")}</p></div>
          </header>

          <div className="resume-contact">
            <span data-no-translate>{text(profile?.email, locale === "th" ? "ยังไม่ระบุอีเมล" : "Email not provided")}</span>
            <span data-no-translate>{text(personal.phone, locale === "th" ? "ยังไม่ระบุเบอร์โทร" : "Phone not provided")}</span>
            <span data-no-translate>{text(personal.lineId, locale === "th" ? "ยังไม่ระบุ LINE ID" : "LINE ID not provided")}</span>
            <span data-no-translate>{text(profile?.address ?? personal.address, locale === "th" ? "ยังไม่ระบุที่อยู่" : "Address not provided")}</span>
          </div>

          <div className="resume-columns">
            <aside>
              <ResumeSection title="เป้าหมายทางอาชีพ">
                <p data-no-translate>{[desired.desiredPosition1, desired.desiredPosition2, desired.desiredPosition3].map((item) => text(item, "")).filter(Boolean).join(" / ") || (locale === "th" ? "ยังไม่ได้ระบุตำแหน่งงาน" : "No desired position provided")}</p>
                <p>เงินเดือน: {text(desired.expectedSalary)}</p>
                <p>รูปแบบงาน: {text(desired.workplacePreference)}</p>
              </ResumeSection>

              <ResumeSection title="การศึกษา">
                <ResumeRepeated data={educations} prefixes={["education1", "education2", "education3"]} primary="Institution" secondary="Level" />
              </ResumeSection>

              <ResumeSection title="ทักษะเฉพาะทาง">
                <ul data-no-translate>{[other.specialty1, other.specialty2, other.specialty3, other.specialty4, other.specialty5].map((skill) => text(skill, "")).filter(Boolean).map((skill) => <li key={skill}>{skill}</li>)}</ul>
              </ResumeSection>

              <ResumeSection title="ภาษา">
                <ResumeRepeated data={languages} prefixes={["language1", "language2", "language3", "language4", "language5"]} primary="Name" secondary="Speaking" />
              </ResumeSection>
            </aside>

            <section className="resume-main-column">
              <ResumeSection title="เกี่ยวกับฉัน">
                <p data-no-translate>{text(other.projects, locale === "th" ? "เพิ่มข้อมูลโครงการ ผลงาน และประสบการณ์อื่น ๆ เพื่อแนะนำตัวกับผู้ประกอบการ" : "Add projects, achievements, and other experience to introduce yourself to employers")}</p>
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
