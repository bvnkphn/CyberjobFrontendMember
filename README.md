# CyberJob — Frontend (Next.js Application)

> **เทคโนโลยีหลัก:** Next.js 14+ (App Router), React 18+, TypeScript, Lucide Icons, Google Identity Services (GIS)  
> **ที่อยู่โปรเจกต์:** [frontend/](file:///d:/CyberJob_/frontend)  
> **Production Domain:** [https://cyberjob.asia](https://cyberjob.asia)  
> **GitLab Repository:** `cyberjobfrontendmember/cyberjobfrontendmember.git` (Branch: `main`)

---

## 1. ภาพรวมโปรเจกต์

โปรเจกต์นี้เป็น Frontend หลักที่รวมทั้ง 3 ส่วนของแพลตฟอร์ม CyberJob ไว้ด้วยกันแบบ Single Next.js Application:
1. **Public Site & Member Portal (ผู้หางาน):** หน้าแรก, การค้นหางาน, สมัครงาน 3 ขั้นตอน, จัดการเรซูเม่, และระบบมุดงาน (Hide Job)
2. **Business Owner Portal (ผู้ประกอบการ):** แดชบอร์ดสถิติ, สร้างประกาศงานด้วย Markdown Editor & Preview, ค้นหาผู้สมัครด้วย Matching Score, จัดการแพ็กเกจ
3. **Admin Shell (ผู้ดูแลระบบ):** ศูนย์ควบคุมหลังบ้านสำหรับอนุมัติบริษัท ตรวจสอบงาน และจัดการผู้ใช้

---

## 2. โครงสร้างเส้นทาง (Routing Structure)

```text
src/app/
├── page.tsx                           # หน้าแรก (Hero, Search, Featured Jobs, Articles)
├── jobs/
│   ├── page.tsx                       # หน้ารวมตำแหน่งงานพร้อมตัวกรอง (Experience, Category, Salary)
│   └── [id]/page.tsx                  # หน้ารายละเอียดงานแบบเจาะลึก
├── apply-step1/page.tsx               # ขั้นตอนสมัครงานที่ 1: ตรวจสอบข้อมูลและเรซูเม่
├── apply-step2/page.tsx               # ขั้นตอนสมัครงานที่ 2: ทักษะและคำถามคัดกรอง
├── apply-step3/page.tsx               # ขั้นตอนสมัครงานที่ 3: ตรวจสอบและส่งใบสมัคร
├── profile/
│   ├── page.tsx                       # ข้อมูลส่วนตัว เรซูเม่ และการตั้งค่าความเป็นส่วนตัว (มุดงาน)
│   ├── edit/page.tsx                  # แก้ไขประวัติการทำงาน การศึกษา และใบ Certificate
│   └── preview/page.tsx               # หน้าพรีวิวเรซูเม่ดิจิทัลสำหรับพิมพ์/ดาวน์โหลด PDF
├── my-jobs/page.tsx                   # รายการงานที่ยื่นสมัครแล้ว และสถานะการพิจารณา
├── articles/                          # บทความสาระน่ารู้ด้านความมั่นคงไซเบอร์
├── contact/page.tsx                   # หน้าติดต่อเราและช่องทาง LINE OA
├── gate/
│   ├── login/page.tsx                 # หน้าเข้าสู่ระบบ (อีเมล/รหัสผ่าน + OTP 2FA + Google GIS)
│   └── register/page.tsx              # หน้าสมัครสมาชิกใหม่ (แยกประเภท Jobseeker / Employer)
├── dashboard/page.tsx                 # แดชบอร์ดภาพรวมของผู้ประกอบการ (Active Jobs, Candidates)
├── job-postings/
│   ├── page.tsx                       # รายการประกาศงานของบริษัท
│   └── create/page.tsx                # สร้างประกาศงานใหม่ (Markdown Editor + Real-time Preview)
├── candidates/
│   ├── page.tsx                       # ระบบค้นหาผู้สมัครพร้อมคะแนน Matching Score
│   └── responses/page.tsx             # ตรวจสอบคำตอบจากคำถามคัดกรอง
├── packages/page.tsx                  # หน้าเลือกแพ็กเกจ Starter / Gold / Platinum และแจ้งชำระเงิน
├── company/page.tsx                   # หน้าข้อมูลบริษัทและการแนบเอกสารเพื่อขอยืนยันตัวตน
├── support/
│   ├── page.tsx                       # ศูนย์ช่วยเหลือและคำถามที่พบบ่อย (FAQs)
│   └── tutorials/page.tsx             # วิดีโอแนะนำการใช้งาน (YouTube Embed)
└── admin/
    ├── page.tsx                       # หน้าแรกแดชบอร์ดผู้ดูแลระบบ
    ├── companies/page.tsx             # ตรวจสอบและอนุมัติเอกสารบริษัท
    ├── jobs/page.tsx                  # ตรวจสอบและกำกับดูแลประกาศงาน
    ├── users/page.tsx                 # จัดการผู้ใช้งานและเปลี่ยนบทบาท (Role)
    ├── packages/page.tsx              # ตรวจสอบสลิปการโอนเงินและอนุมัติแพ็กเกจ
    ├── synonyms/page.tsx              # จัดการพจนานุกรมคำศัพท์และทักษะไซเบอร์
    └── settings/page.tsx              # ตั้งค่าระบบและลิงก์วิดีโอ YouTube
```

---

## 3. คอมโพเนนต์สำคัญ (Key Components)

- **`src/components/gate/login-form.tsx`:** ฟอร์มล็อกอิน 2 ขั้นตอน (Step 1: รหัสผ่าน, Step 2: กรอกรหัส OTP 6 ช่องแบบ Auto-focus และนับถอยหลัง 60 วินาที) พร้อม Role-based Redirection
- **`src/components/gate/google-button.tsx`:** คอมโพเนนต์โหลด Google Identity Services SDK พร้อมรองรับ One-Tap และ Button Render
- **`src/components/job-postings/JobPostingForm.tsx`:** ฟอร์มสร้างประกาศงานพร้อมกล่องเขียน Markdown, ตัวช่วยสัญลักษณ์ `##`, และหน้าจอพรีวิวแบบเรียลไทม์
- **`src/components/admin/shell/AdminShell.tsx`:** โครงสร้างหน้าเว็บและ Sidebar ของผู้ดูแลระบบ
- **`src/public-site/auth/AuthProvider.tsx`:** Context บริหารจัดการ State การล็อกอิน, Token, และฟังก์ชัน verifyOtp / resendOtp

---

## 4. การรันและทดสอบในเครื่อง (Local Setup)

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. กำหนดค่า Environment Variables ในไฟล์ `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

3. รัน Development Server:
   ```bash
   npm run dev
   ```
   เข้าใช้งานได้ที่: `http://localhost:3000`

4. ตรวจสอบการ Build ก่อน Deploy:
   ```bash
   npm run build
   ```

---

## 5. การรันบน Production (Hostinger Passenger)

บนเซิร์ฟเวอร์ Hostinger โปรเจกต์นี้ทำงานผ่าน custom entry point:
- **`server.cjs`:** ไฟล์ Node.js wrapper ที่ส่งค่า `dir: __dirname` ให้กับ Next.js เพื่อป้องกันปัญหา Passenger รันจาก root directory แล้วหาโฟลเดอร์ `.next` ไม่พบ
- จัดการกระบวนการ Restart อัตโนมัติด้วยคำสั่ง `mkdir -p tmp && touch tmp/restart.txt`
