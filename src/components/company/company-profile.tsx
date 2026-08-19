"use client";

import { useState } from "react";
import Link from "next/link";
import "./company-profile.css";

const galleryImages = [
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=320&q=80",
];

export function CompanyProfile() {
  const [activeTab, setActiveTab] = useState<"about" | "jobs">("about");

  return <main className="company-page">
    <div className="company-page-layout">
      <div className="company-cover" role="img" aria-label="บรรยากาศการทำงานของบริษัท" />
      <section className="company-summary">
        <div className="company-avatar">◉<span>CyberPay</span></div>
        <div className="company-summary-text"><h1>บริษัท เอซีซีดี เทคโนโลยี จำกัด <b>●</b></h1><span>บริษัทชั้นนำด้านเทคโนโลยีและนวัตกรรม</span></div>
        <button className="share-company" type="button" aria-label="แชร์ข้อมูลบริษัท">♧</button>
      </section>
      <div className="company-tabs" role="tablist" aria-label="ข้อมูลบริษัท"><button className={activeTab === "about" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "about"} onClick={() => setActiveTab("about")}>เกี่ยวกับ</button><button className={activeTab === "jobs" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "jobs"} onClick={() => setActiveTab("jobs")}>งาน <span>1</span></button></div>

      {activeTab === "about" ? <section className="company-about"><h2>ข้อมูลบริษัท</h2><dl><div><dt>เว็บไซต์</dt><dd>www.abcde-technology.com</dd></div><div><dt>ประเภทธุรกิจ</dt><dd>Information Technology Services</dd></div><div><dt>ที่ตั้งบริษัท</dt><dd>กรุงเทพมหานคร, สีลม</dd></div></dl><p>ABCDE Technology Co., Ltd เป็นบริษัทชั้นนำด้านเทคโนโลยีและนวัตกรรม<br />อย่างสร้างสรรค์ มุ่งเน้นการพัฒนาและสร้างสรรค์ผลิตภัณฑ์ที่ทันสมัยและมีคุณภาพสูง<br />บริษัทของเราก่อตั้งขึ้นในปี พ.ศ. 2550 โดยทีมงานผู้เชี่ยวชาญที่มีประสบการณ์และความรู้<br />ความชำนาญในด้านเทคโนโลยีสารสนเทศและการสื่อสาร</p><h3>ข้อมูลติดต่อ</h3><p>ABCDE Technology Co., Ltd<br />ที่อยู่: 1234 ถนนเทคโนโลยี แขวงนวัตกรรม เขตพัฒนาการ กรุงเทพฯ 10110<br />โทรศัพท์: 02-123-4567<br />อีเมล: abcde-technology@gmail.com</p><div className="map-card"><strong>ตำแหน่งที่ตั้งของธุรกิจ</strong><div className="map-placeholder"><span className="map-pin">●</span><span className="map-label">วัดศรีครี<br />บ้านคลองหนอง</span></div></div><div className="company-gallery">{galleryImages.map((image) => <img src={image} alt="บรรยากาศบริษัท" key={image} />)}</div></section> : <section className="company-jobs"><h2>ตำแหน่งงานของบริษัท</h2><Link href="/jobs/erp-developer" className="company-job-card"><strong>ERP Developer (Microsoft Dynamics AX)</strong><span>กรุงเทพมหานคร · งานประจำ</span></Link></section>}
      <Link href="/jobs" className="company-jobs-button">ดูงานทั้งหมด <span>›</span></Link>
    </div>
  </main>;
}