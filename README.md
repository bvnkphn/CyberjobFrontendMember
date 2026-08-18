# CyberJob Frontend Member

## Profile edit UX/UI

เปิดหน้า `http://localhost:3000/profile/edit` เพื่อดูต้นแบบหน้าแก้ไขประวัติผู้สมัคร
หน้า `/` จะ redirect มายังหน้านี้โดยอัตโนมัติ

- ขอบเขตปัจจุบันเป็น UX/UI และ local interaction เท่านั้น ยังไม่เรียก Backend API
- Sidebar สลับใช้งานข้อมูลประวัติครบทุกส่วนได้โดยไม่เปลี่ยน route
- Desktop ใช้ sidebar คู่กับฟอร์ม 2 คอลัมน์
- Tablet ย้ายการ์ดขึ้นด้านบนและเปลี่ยนเมนูหัวข้อเป็นแนวนอน
- Mobile เปลี่ยนฟอร์มเป็นคอลัมน์เดียวและทำปุ่มบันทึกเต็มความกว้าง
- จุดเชื่อม Backend ในอนาคตอยู่ในฟังก์ชัน `submit` ของ `ProfileEditor`

โครงสร้างหลัก:

```text
src/app/profile/edit/page.tsx              route และ page composition
src/components/profile/profile-editor.tsx  form state และ semantic markup
src/components/profile/desired-job-form.tsx ฟอร์มลักษณะงานที่ต้องการ
src/components/profile/education-form.tsx   ฟอร์มประวัติการศึกษาแบบเพิ่มได้สูงสุด 3 รายการ
src/components/profile/work-experience-form.tsx ฟอร์มประวัติฝึกงาน/ทำงานแบบเพิ่มได้สูงสุด 3 รายการ
src/components/profile/certificate-form.tsx ฟอร์มอัปโหลดและจัดการประกาศนียบัตร
src/components/profile/language-form.tsx    ฟอร์มภาษาและระดับทักษะ เพิ่มได้สูงสุด 5 ภาษา
src/components/profile/other-skills-form.tsx ฟอร์มทักษะ การขับขี่ ความเร็วพิมพ์ และผลงาน
src/components/profile/profile-editor.css  responsive layout และ visual tokens
src/components/header.tsx                  navigation และ account menu
src/components/footer.tsx                  site footer
src/components/icons.tsx                   local SVG icon set
```

รันโปรเจกต์ด้วย `npm install` แล้วใช้ `npm run dev` จากนั้นตรวจ production build ด้วย `npm run build`

หน้า Gate สำหรับ onboarding หลังสมัครสมาชิกอยู่ที่ `http://localhost:3000/gate` และเป็น UX/UI mock ที่พร้อมเชื่อม API ภายหลัง

หน้า Profile dashboard และการตั้งค่าบัญชีอยู่ที่ `http://localhost:3000/profile`

หน้าตัวอย่าง Resume และการพิมพ์/บันทึก PDF อยู่ที่ `http://localhost:3000/profile/preview`

Next.js frontend สำหรับสมาชิก ใช้ `NEXT_PUBLIC_API_URL` เชื่อมต่อ REST API

```bash
cp .env.example .env.local
npm install
npm run dev
```

Production: `docker build -t cyberjob-frontend-member .`
