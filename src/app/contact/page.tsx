"use client";

import { useState } from "react";
import { PageHeading } from "@/components/page-heading";
import "./contact.css";

const faqs = [
  ["สมัครสมาชิกฟรีหรือไม่?", "ผู้หางานสามารถสมัครสมาชิก สร้างโปรไฟล์ ค้นหางาน และสมัครงานได้โดยไม่มีค่าใช้จ่าย"],
  ["บริษัทลงทะเบียนอย่างไร?", "ผู้ประกอบการสามารถติดต่อทีมงานเพื่อขอข้อมูลการลงทะเบียนและเริ่มต้นใช้งานได้"],
  ["สมัครงานได้อย่างไร?", "เลือกตำแหน่งที่สนใจ ตรวจสอบรายละเอียด แล้วกดสมัครงานหรือส่งประวัติให้บริษัทตามช่องทางที่ระบุ"],
  ["มีแอปมือถือหรือไม่?", "ขณะนี้สามารถใช้งาน CyberJob ผ่านเว็บไซต์บนโทรศัพท์มือถือได้ และเรากำลังพัฒนาประสบการณ์ให้ดียิ่งขึ้น"],
];

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
}

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3l1.6 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.6v3a1.5 1.5 0 0 1-1.7 1.5A16.5 16.5 0 0 1 3.5 5.7 1.5 1.5 0 0 1 5 4Z"/></svg>;
}

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="contact-shell">
      <main className="contact-page">
        <PageHeading title="ติดต่อเรา" description="มีคำถามหรือต้องการความช่วยเหลือ? ทีมงาน CyberJob พร้อมดูแลคุณ" eyebrow="CONTACT CYBERJOB" fallbackHref="/" className="contact-heading" />

        <section className="line-banner" aria-label="ติดต่อผ่าน LINE">
          <div className="line-mark">
            <img src="/contact/line-icon.png" alt="" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement?.classList.add("line-icon-fallback"); }} />
            <span className="line-icon-text">LINE</span>
          </div>
          <div className="line-copy">
            <span className="line-badge">ช่องทางที่ตอบเร็วที่สุด</span>
            <strong>LINE Official Account</strong>
            <p>แชทกับทีมงานเพื่อสอบถามเรื่องบัญชี การสมัครงาน หรือการใช้งานเว็บไซต์</p>
            <small>@cyberjob</small>
          </div>
          <div className="qr-code" aria-label="QR Code สำหรับติดต่อ CyberJob">
            <img src="/contact/line-qr.png" alt="QR Code สำหรับติดต่อ CyberJob" onError={(event) => { event.currentTarget.style.display = "none"; }} />
          </div>
          <button type="button" className="line-action">แชทกับเรา <span aria-hidden="true">→</span></button>
        </section>

        <section className="contact-methods" aria-label="ช่องทางติดต่ออื่น">
          <a href="mailto:support@cyberjob.th">
            <span className="contact-icon mail-icon"><MailIcon /></span>
            <span><small>อีเมล</small><strong>support@cyberjob.th</strong><em>ตอบกลับภายใน 1 วันทำการ</em></span>
          </a>
          <a href="tel:021234567">
            <span className="contact-icon phone-icon"><PhoneIcon /></span>
            <span><small>โทรศัพท์</small><strong>02-123-4567</strong><em>จันทร์–ศุกร์ เวลา 09:00–18:00 น.</em></span>
          </a>
        </section>

        <section className="faq-section">
          <div className="faq-heading"><span>HELP CENTER</span><h2>คำถามที่พบบ่อย</h2><p>คำตอบสำหรับคำถามเกี่ยวกับการใช้งาน CyberJob</p></div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}>
                <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <span>{question}</span><span className="faq-chevron" aria-hidden="true">⌄</span>
                </button>
                {openFaq === index && <p>{answer}</p>}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
