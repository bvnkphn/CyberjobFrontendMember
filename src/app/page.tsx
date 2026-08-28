import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SAMPLE_JOBS } from "@/lib/member-api";
import "./home.css";

export default function Home() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="member-home-hero">
          <div className="member-home-copy">
            <span className="member-home-eyebrow">CYBERJOB FOR TALENT</span>
            <h1>ค้นหางานที่ใช่<br /><em>เติบโตในแบบของคุณ</em></h1>
            <p>รวมตำแหน่งงานคุณภาพ พร้อมโปรไฟล์และ Resume ที่ช่วยให้บริษัทค้นพบคุณได้ง่ายขึ้น</p>
            <div className="member-home-actions">
              <Link className="member-home-primary" href="/jobs">ค้นหางาน</Link>
              <Link className="member-home-secondary" href="/gate/register">สร้างโปรไฟล์ฟรี</Link>
            </div>
          </div>
          <div className="member-home-visual" aria-label="โอกาสงานสำหรับสมาชิก">
            <div className="member-home-stat"><strong>5+</strong><span>ตำแหน่งแนะนำวันนี้</span></div>
            <div className="member-home-card"><span>งานแนะนำสำหรับคุณ</span><strong>Frontend Developer</strong><small>กรุงเทพฯ · Full-time</small></div>
            <div className="member-home-card member-home-card-alt"><span>โปรไฟล์ของคุณ</span><strong>พร้อมให้บริษัทค้นพบ</strong><small>อัปเดต Resume เพื่อเพิ่มโอกาส</small></div>
          </div>
        </section>

        <section className="member-home-section">
          <div className="member-home-heading"><div><span>งานมาใหม่</span><h2>ตำแหน่งที่น่าสนใจ</h2></div><Link href="/jobs">ดูงานทั้งหมด →</Link></div>
          <div className="member-home-jobs">
            {SAMPLE_JOBS.slice(0, 3).map((job) => (
              <article key={job.id}>
                <div className="member-home-logo">{job.company.charAt(0)}</div>
                <div><small>{job.company}</small><h3>{job.title}</h3><p>{job.location} · {job.type}</p><strong>{job.salary}</strong></div>
                <Link href={`/jobs/${job.id}`} aria-label={`ดูงาน ${job.title}`}>→</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="member-home-steps">
          <div><span>01</span><h3>สร้างโปรไฟล์</h3><p>กรอกข้อมูลและสร้าง Resume ในระบบ</p></div>
          <div><span>02</span><h3>ค้นหางาน</h3><p>เลือกงานตามทักษะและรูปแบบที่ต้องการ</p></div>
          <div><span>03</span><h3>สมัครได้ทันที</h3><p>ส่ง Resume และติดตามสถานะในที่เดียว</p></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
