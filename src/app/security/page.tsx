import { LegalPage } from '@/components/legal-page';

export default function SecurityPage() {
  return (
    <LegalPage title="ความปลอดภัย">
      <p>CyberJob ใช้การยืนยันตัวตน Token ที่มีอายุจำกัด การเข้ารหัสการเชื่อมต่อ และการกำหนดสิทธิ์เพื่อปกป้องข้อมูลสมาชิก</p>
      <p>หากพบพฤติกรรมผิดปกติหรือช่องโหว่ กรุณาหยุดใช้งานส่วนที่ได้รับผลกระทบและแจ้งทีมงานผ่านหน้าติดต่อเราโดยเร็วที่สุด</p>
    </LegalPage>
  );
}
