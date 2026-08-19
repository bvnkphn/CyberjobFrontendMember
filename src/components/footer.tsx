import Link from "next/link";
import { Brand } from "./brand";

export function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-about"><Brand inverted /><p>เว็บหางานสำหรับคนทำงานเพื่อโอกาส<br/>เติบโตในบริษัทด้วยตำแหน่งที่เหมาะ<br/>กับไลฟ์สไตล์ของคุณ</p></div><div className="footer-links"><div><strong>ผู้หางาน</strong><Link href="/jobs">ค้นหางาน</Link><Link href="/profile">โปรไฟล์</Link><Link href="/saved-jobs">งานที่บันทึก</Link><Link href="/applications">ประวัติการสมัครงาน</Link></div><div><strong>ผู้ประกอบการ</strong><Link href="/register/business">ลงทะเบียนฟรี</Link><Link href="/post-job">ลงประกาศงาน</Link></div><div><strong>เกี่ยวกับเรา</strong><Link href="/contact">ติดต่อเรา</Link></div></div></div><div className="footer-bottom"><span>Copyright @ 2026 CYBERJOB Co, Ltd | All Rights Reserved.</span><div><Link href="/terms">ข้อกำหนดและเงื่อนไข</Link><Link href="/security">ความปลอดภัย</Link><Link href="/privacy">ความเป็นส่วนตัว</Link></div></div></footer>;
}
