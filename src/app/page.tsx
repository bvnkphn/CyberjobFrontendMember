import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <p className="eyebrow">CYBERJOB MEMBER</p>
      <h1>หน้าตัวอย่างสำหรับทีมพัฒนา</h1>
      <p>หน้าแก้ไขประวัติถูกแยกไว้ที่ route ของตัวเอง และพร้อมเชื่อม API ภายหลัง</p>
      <Link className="primary-button" href="/profile/edit">เปิดหน้าแก้ไขประวัติ</Link>
    </main>
  );
}
