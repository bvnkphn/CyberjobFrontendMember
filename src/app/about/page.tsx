import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./about.css";

const services = [
  ["หางานออนไลน์", "ค้นหางานที่ตรงกับความสามารถและเป้าหมายของคุณ"],
  ["สร้างเรซูเม่", "เครื่องมือสร้างเรซูเม่มืออาชีพโดยไม่มีค่าใช้จ่าย"],
  ["งานสำหรับคนรุ่นใหม่", "โอกาสสำหรับนักศึกษา เด็กฝึกงาน และผู้จบใหม่"],
  ["สำหรับบริษัท", "ช่องทางค้นหาและคัดเลือกผู้สมัครที่ตรงความต้องการ"],
];

const reasons = [
  ["users", "ผู้ใช้มากมาย", "ชุมชนผู้หางานและบริษัทที่ไว้วางใจในระบบ"],
  ["shield", "ไว้ใจได้", "ดูแลข้อมูลและยืนยันตัวตนอย่างปลอดภัย"],
  ["bolt", "รวดเร็ว", "ค้นหา บันทึก และสมัครงานได้ในไม่กี่ขั้นตอน"],
  ["check", "ฟรีจริง", "สร้างเรซูเม่และสมัครงานได้โดยไม่มีค่าใช้จ่าย"],
];

function Icon({ name }: { name: string }) {
  if (name === "users") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (name === "shield") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if (name === "bolt") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
}

export default function AboutPage() {
  return (
    <div className="site-shell">
      <Header />
      <main className="about-page">
        <header className="about-heading">
          <span>CYBERJOB</span>
          <h1>เกี่ยวกับเรา</h1>
          <p>เราเชื่อมโยงคนเก่งกับโอกาสที่เหมาะสม เพื่อให้ทุกการเติบโตเริ่มต้นได้ง่ายขึ้น</p>
        </header>
        <section className="about-grid" aria-label="เรื่องราว พันธกิจ และวิสัยทัศน์">
          <article className="about-story-card"><h2>เรื่องราวของเรา</h2><p>CyberJob เกิดขึ้นจากความตั้งใจที่จะเชื่อมโยงคนหางานกับนายจ้าง ให้กระบวนการหางานง่ายและตรงประเด็นมากขึ้น เราเชื่อว่าทุกคนสมควรได้รับโอกาสในการทำงานที่เหมาะสมกับทักษะและความต้องการ แพลตฟอร์มของเราจึงออกแบบมาเพื่อช่วยให้ผู้หางานค้นพบอาชีพที่ใช่ พร้อมเป็นสะพานเชื่อมระหว่างองค์กรกับบุคลากรคุณภาพ</p></article>
          <div className="about-side-cards">
            <article className="about-card about-mission-card"><span className="about-card-icon">◎</span><h2>พันธกิจ</h2><p>พัฒนาแพลตฟอร์มหางานที่เข้าถึงง่าย ปลอดภัย และตอบโจทย์ผู้ใช้ทุกคน</p></article>
            <article className="about-card about-vision-card"><span className="about-card-icon">◉</span><h2>วิสัยทัศน์</h2><p>เป็นแพลตฟอร์มหางานที่ทุกคนนึกถึงเมื่อต้องการเริ่มต้นโอกาสใหม่ในอาชีพ</p></article>
          </div>
        </section>
        <section className="about-section"><h2 className="about-section-title">บริการของเรา</h2><div className="about-services-grid">{services.map(([title, detail]) => <article className="about-card about-service-card" key={title}><h3>{title}</h3><p>{detail}</p></article>)}</div></section>
        <section className="about-section"><h2 className="about-section-title about-section-title-lg">ทำไมต้อง CyberJob</h2><div className="about-why-grid">{reasons.map(([icon, title, detail]) => <article className="about-card about-why-card" key={title}><span className={`about-reason-icon about-reason-${icon}`}><Icon name={icon}/></span><h3>{title}</h3><p>{detail}</p></article>)}</div></section>
      </main>
      <Footer />
    </div>
  );
}
