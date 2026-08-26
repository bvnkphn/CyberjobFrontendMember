"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./contact.css";

const faqs = [
  ["สมัครสมาชิกฟรีหรือไม่?", "ผู้หางานสามารถสมัครสมาชิก สร้างโปรไฟล์ ค้นหางาน และสมัครงานได้โดยไม่มีค่าใช้จ่าย"],
  ["บริษัทลงทะเบียนอย่างไร?", "ผู้ประกอบการสามารถติดต่อทีมงานเพื่อขอข้อมูลการลงทะเบียนและเริ่มต้นใช้งานได้"],
  ["สมัครงานได้อย่างไร?", "เลือกตำแหน่งที่สนใจ ตรวจสอบรายละเอียด แล้วกดสมัครงานหรือส่งประวัติให้บริษัทตามช่องทางที่ระบุ"],
  ["มีแอปมือถือหรือไม่?", "ขณะนี้สามารถใช้งาน CyberJob ผ่านเว็บไซต์บนโทรศัพท์มือถือได้ และเรากำลังพัฒนาประสบการณ์ให้ดียิ่งขึ้น"],
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return <div className="contact-shell"><Header /><main className="contact-page">
    <header className="contact-heading"><h1>ข้อมูลติดต่อ</h1><p><span className="line-dot" />ช่องทางติดต่อที่รวดเร็ว <b>แชทกับเราผ่าน LINE</b></p></header>
    <section className="line-banner"><div className="line-mark"><img src="/contact/line-icon.png" alt="LINE" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement?.classList.add("line-icon-fallback"); }} /><span className="line-icon-text">LINE</span></div><div><strong>LINE Official Account</strong><span>ทีมงานพร้อมดูแลและให้คำแนะนำคุณ</span><small>@cyberjob</small></div><span className="line-badge">ตอบเร็วที่สุด</span><div className="qr-code" aria-label="QR Code"><img src="/contact/line-qr.png" alt="QR Code สำหรับติดต่อ CyberJob" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div><button type="button">แชทกับเราเลย <span>→</span></button></section>
    <section className="contact-methods"><a href="mailto:support@cyberjob.th"><span className="contact-icon mail-icon">✉</span><small>Email</small><strong>support@cyberjob.th</strong></a><a href="tel:021234567"><span className="contact-icon phone-icon">⌕</span><small>โทร</small><strong>02-123-4567</strong></a></section>
    <section className="faq-section"><h2>คำถามที่พบบ่อย</h2>{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><span className="faq-chevron">⌄</span></button>{openFaq === index && <p>{answer}</p>}</div>)}</section>
  </main><Footer /></div>;
}
