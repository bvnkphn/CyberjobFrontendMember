"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import "./job-description.css";

const relatedJobs = [
  { title: "ERP Developer (Microsoft Dynamics AX)", company: "ABCDE Technology Co., Ltd" },
  { title: "ERP Developer (Microsoft Dynamics AX)", company: "ABCDE Technology Co., Ltd" },
];

export function JobDescription() {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [likedJobs, setLikedJobs] = useState<Record<number, boolean>>({});

  return <main className="job-page">
    <div className="job-layout">
      <div className="job-hero" role="img" aria-label="ภาพบรรยากาศการทำงานด้านเทคโนโลยี" />
      <article className="job-content">
        <div className="company-mark"><span>◉</span>CyberPay</div>
        <header className="job-heading">
          <h1>ERP Developer (Microsoft Dynamics AX)</h1>
          <p className="job-company">บริษัท เอซีซีดี เทคโนโลยี จำกัด <span className="verified">●</span> <span>ดูข้อมูลบริษัท</span></p>
          <div className="job-meta">
            <span>◷ กรุงเทพมหานคร (ในเมือง)</span><span>◷ งานประจำ</span>
            <span>◷ 1-5 ปี</span><span>฿ 10,000-15,000 บาท/เดือน</span>
            <span>♙ 1 อัตรา</span>
          </div>
          <small className="posted">ลงประกาศเมื่อ 13 วันที่แล้ว</small>
          <div className="job-actions">
            <button className="apply-button" type="button" onClick={() => setApplied(true)}>{applied ? "สมัครแล้ว" : "สมัคร"}</button>
            <button className={`save-button ${saved ? "is-saved" : ""}`} type="button" onClick={() => setSaved(!saved)}>{saved ? "บันทึกแล้ว" : "บันทึก"}</button>
          </div>
        </header>

        <section className="job-section"><h2>Job Description</h2><p>รับผิดชอบการพัฒนาและดูแลระบบ ERP Microsoft Dynamics AX ตามรายละเอียด ออกแบบ พัฒนา และทดสอบฟีเจอร์ใหม่ ตลอดจนบำรุงรักษาระบบให้ทำงานได้อย่างมีประสิทธิภาพ</p></section>
        <section className="job-section"><h2>Job Requirement</h2><p>ประสบการณ์พัฒนา Dynamics AX อย่างน้อย 3 ปี หรือมีประสบการณ์ ERP โดยรวม</p></section>
        <section className="job-section"><h2>คุณสมบัติเฉพาะ</h2><p>ชอบเรียนรู้และสามารถทำงานร่วมกับทีมที่หลากหลายได้ดี</p></section>
        <section className="job-section"><h2>คำถามจากผู้ประกอบการ</h2><p>ในใบสมัครของคุณประกอบด้วยคำถามต่อไปนี้:</p><ul><li>มีประสบการณ์ทำงานด้านระบบ ERP โดยตรงหรือไม่</li><li>ยินดีเดินทางไปทำงานที่กรุงเทพฯ หรือไม่</li><li>คุณมีวุฒิการศึกษาในสาขาใด</li><li>เคยใช้งาน Microsoft Office ในระดับใด</li><li>คุณสามารถสื่อสารภาษาอังกฤษได้หรือไม่</li></ul></section>

        <section className="company-profile"><h2>โปรไฟล์บริษัท</h2><div className="company-card"><div className="company-logo">CyberPay</div><div className="company-details"><strong>บริษัท เอซีซีดี เทคโนโลยี จำกัด <span className="verified">●</span></strong><span>✉ abcde-technology@gmail.com</span><span>⌕ 02-123-4567</span><p>ประเภทธุรกิจ: เทคโนโลยี<br />เว็บไซต์: www.abcde-technology.com<br />ที่อยู่: 1234 ถนนเทคโนโลยี แขวงนวัตกรรม เขตเมือง กรุงเทพฯ 10410</p><Link href="/about" className="company-link">ดูข้อมูลทั้งหมดของบริษัท <span>→</span></Link></div></div></section>

        <section className="related-section"><h2>งานที่แนะนำ</h2><div className="related-grid">{relatedJobs.map((job, index) => <article className="related-card" key={`${job.title}-${index}`}><Link href={`/jobs/related-${index + 1}`} className="related-card-link"><div className="related-top"><div className="mini-logo">CP</div><div><strong>{job.title}</strong><span>{job.company}</span></div></div><p>บริษัทชั้นนำกำลังมองหาคนที่มีความสามารถและพร้อมเติบโตไปด้วยกัน...</p></Link><footer><span>◷ 5 วันที่แล้ว</span><button className={`like-button ${likedJobs[index] ? "is-liked" : ""}`} type="button" aria-label={likedJobs[index] ? "เลิกถูกใจงานนี้" : "ถูกใจงานนี้"} aria-pressed={Boolean(likedJobs[index])} onClick={() => setLikedJobs((current) => ({ ...current, [index]: !current[index] }))}>{likedJobs[index] ? "♥" : "♡"}</button></footer></article>)}</div><Link href="/jobs" className="all-jobs-link">ดูงานทั้งหมด <span>›</span></Link></section>
      </article>
    </div>
  </main>;
}