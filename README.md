# CyberJob Frontend Member

## Profile edit UX/UI

เปิดหน้า `http://localhost:3000/profile/edit` เพื่อดูต้นแบบหน้าแก้ไขประวัติผู้สมัคร
หน้า `/` จะ redirect มายังหน้านี้โดยอัตโนมัติ

- ขอบเขตปัจจุบันเป็น UX/UI และ local interaction เท่านั้น ยังไม่เรียก Backend API
- Desktop ใช้ sidebar คู่กับฟอร์ม 2 คอลัมน์
- Tablet ย้ายการ์ดขึ้นด้านบนและเปลี่ยนเมนูหัวข้อเป็นแนวนอน
- Mobile เปลี่ยนฟอร์มเป็นคอลัมน์เดียวและทำปุ่มบันทึกเต็มความกว้าง
- จุดเชื่อม Backend ในอนาคตอยู่ในฟังก์ชัน `submit` ของ `ProfileEditor`

โครงสร้างหลัก:

```text
src/app/profile/edit/page.tsx              route และ page composition
src/components/profile/profile-editor.tsx  form state และ semantic markup
src/components/profile/profile-editor.css  responsive layout และ visual tokens
src/components/header.tsx                  navigation และ account menu
src/components/footer.tsx                  site footer
src/components/icons.tsx                   local SVG icon set
```

รันโปรเจกต์ด้วย `npm install` แล้วใช้ `npm run dev` จากนั้นตรวจ production build ด้วย `npm run build`

Next.js frontend สำหรับสมาชิก ใช้ `NEXT_PUBLIC_API_URL` เชื่อมต่อ REST API

```bash
cp .env.example .env.local
npm install
npm run dev
```

Production: `docker build -t cyberjob-frontend-member .`
