import "./about.css";

export default function AboutPage() {
  return (
    <div className="site-shell">
      <main className="about-page">
        <h1 className="about-title">เกี่ยวกับเรา</h1>

        {/* Section 1: เรื่องราวของเรา + พันธกิจ/วิสัยทัศน์ */}
        <section className="about-grid">
          <div className="about-story-card">
            <h2>เรื่องราวของเรา</h2>
            <p>
              CyberJob เกิดขึ้นจากความตั้งใจที่จะเชื่อมโยงคนหางานกับนายจ้าง
              ให้กระบวนการหางานง่ายและตรงประเด็นมากขึ้น
              เราเชื่อว่าทุกคนสมควรได้รับโอกาสในการทำงานที่เหมาะสมกับทักษะและความต้องการ
              แพลตฟอร์มของเราออกแบบมาเพื่อช่วยให้ผู้หางานค้นพบอาชีพที่ใช่
              พร้อมทั้งเป็นสะพานเชื่อมระหว่างองค์กรกับบุคลากรคุณภาพ
            </p>
          </div>
          <div className="about-side-cards">
            <div className="about-card about-mission-card">
              <div className="about-card-icon about-icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3>พันธกิจ</h3>
              <p>มุ่งมั่นพัฒนาแพลตฟอร์มหางานที่เข้าถึงง่าย ปลอดภัย และตรงกับความต้องการของผู้ใช้ทุกคน</p>
            </div>
            <div className="about-card about-vision-card">
              <div className="about-card-icon about-icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3>วิสัยทัศน์</h3>
              <p>เป็นแพลตฟอร์มหางานอันดับหนึ่งของไทยที่ทุกคนนึกถึงเมื่อต้องการโอกาสใหม่ในอาชีพ</p>
            </div>
          </div>
        </section>

        {/* Section 2: บริการของเรา */}
        <section className="about-section">
          <h2 className="about-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="about-section-icon" aria-hidden="true">
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
            บริการของเรา
          </h2>
          <div className="about-services-grid">
            <div className="about-card about-service-card">
              <h3>หางานออนไลน์</h3>
              <p>ค้นหางานที่ตรงกับความสามารถของคุณ</p>
            </div>
            <div className="about-card about-service-card">
              <h3>สร้างเรซูเม่</h3>
              <p>เครื่องมือสร้างเรซูเม่มืออาชีพฟรี</p>
            </div>
            <div className="about-card about-service-card">
              <h3>งานจบใหม่</h3>
              <p>โอกาสสำหรับนักศึกษาและเด็กจบใหม่</p>
            </div>
            <div className="about-card about-service-card">
              <h3>สำหรับบริษัท</h3>
              <p>ช่องทางคัดเลือกผู้สมัครที่มีคุณภาพ</p>
            </div>
          </div>
        </section>

        {/* Section 3: ทำไมต้อง CyberJob */}
        <section className="about-section">
          <h2 className="about-section-title about-section-title-lg">ทำไมต้อง CyberJob</h2>
          <div className="about-why-grid">
            <div className="about-card about-why-card">
              <div className="about-card-icon-circle about-circle-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>ผู้ใช้มากมาย</h3>
              <p>ผู้ใช้งานที่ไว้วางใจในระบบ</p>
            </div>
            <div className="about-card about-why-card">
              <div className="about-card-icon-circle about-circle-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <h3>ไว้ใจได้</h3>
              <p>ระบบยืนยันตัวตนที่ปลอดภัย</p>
            </div>
            <div className="about-card about-why-card">
              <div className="about-card-icon-circle about-circle-yellow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>รวดเร็ว</h3>
              <p>สมัครงานได้ในไม่กี่คลิก</p>
            </div>
            <div className="about-card about-why-card">
              <div className="about-card-icon-circle about-circle-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <h3>ฟรีจริง</h3>
              <p>สร้างเรซูเม่และสมัครงานฟรีทั้งหมด</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
