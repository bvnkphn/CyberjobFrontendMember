"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "th" | "en";

const translations: Array<[string, string]> = [
  ["กรอกข้อมูลสั้น ๆ เพื่อให้ CyberJob แนะนำงานที่เหมาะกับคุณได้ดียิ่งขึ้น", "Tell us a little about yourself so CyberJob can recommend better jobs"],
  ["เติมข้อมูลแต่ละส่วนให้ครบ เพื่อเพิ่มโอกาสให้ผู้ประกอบการค้นพบคุณ", "Complete each section to improve your visibility to employers"],
  ["เพิ่มข้อมูลในประวัติเพื่อเพิ่มโอกาสในการถูกคัดเลือก", "Complete your resume to improve your chances of being selected"],
  ["ประวัติของคุณพร้อมสำหรับการสมัครงานแล้ว", "Your resume is ready for job applications"],
  ["จัดการ Resume และการตั้งค่าบัญชีของคุณได้จากที่นี่", "Manage your resume and account settings here"],
  ["ข้อมูลหลักมีน้ำหนักมากกว่าข้อมูลเสริม", "Core information contributes more to your score"],
  ["ข้อมูลสำหรับ Resume ครบถ้วนแล้ว", "Your resume information is complete"],
  ["ตรวจสอบข้อมูลก่อนพิมพ์หรือบันทึกเป็น PDF", "Review your information before printing or saving as PDF"],
  ["เพิ่มข้อมูลโครงการ ผลงาน และประสบการณ์อื่น ๆ เพื่อแนะนำตัวกับผู้ประกอบการ", "Add projects, achievements, and other experience to introduce yourself to employers"],
  ["กรอกบ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด และรหัสไปรษณีย์", "Enter house number, street, district, province, and postal code"],
  ["ระบุ (บ้านเลขที่ ตึก/ห้อง แขวง/ตำบล ถนน รหัสไปรษณีย์)", "Enter house number, building/room, district, street, and postal code"],
  ["อธิบายโครงการ ผลงาน รางวัล กิจกรรม หรือประสบการณ์อื่น ๆ ที่ต้องการให้ผู้ประกอบการเห็น", "Describe projects, achievements, awards, activities, or other experience for employers"],
  ["ผู้ประกอบการสามารถค้นหาและติดต่อคุณได้", "Employers can find and contact you"],
  ["ผู้ประกอบการสามารถค้นหาโปรไฟล์ของคุณได้", "Employers can find your profile"],
  ["แสดงโปรไฟล์เฉพาะบริษัทที่คุณสมัครงาน", "Only companies you apply to can view your profile"],
  ["เมื่อลบบัญชีแล้ว คุณจะไม่สามารถกู้คืนข้อมูลประวัติและการสมัครงานได้", "Deleted resume and application data cannot be recovered"],
  ["ฉันเข้าใจและยืนยันว่าต้องการลบบัญชีนี้", "I understand and confirm that I want to delete this account"],
  ["ระบบจะส่งลิงก์ยืนยันไปยังอีเมลใหม่", "A verification link will be sent to your new email"],
  ["รองรับเฉพาะไฟล์ PDF, JPG, PNG และขนาดไม่เกิน 10 MB", "Only PDF, JPG, and PNG files up to 10 MB are supported"],
  ["ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์", "Drag and drop a file here, or click to browse"],
  ["รองรับไฟล์ PDF, JPG, PNG ขนาดสูงสุด 10 MB", "PDF, JPG, and PNG files up to 10 MB"],
  ["เว็บหางานสำหรับคนทำงานเพื่อโอกาส", "A job platform built for better career opportunities"],
  ["เติบโตในบริษัทด้วยตำแหน่งที่เหมาะ", "Find the right role and grow with the right company"],
  ["กับไลฟ์สไตล์ของคุณ", "for your lifestyle"],
  ["สร้างบัญชีแล้ว · ตั้งค่าโปรไฟล์", "Account created · Set up profile"],
  ["ตั้งค่าโปรไฟล์เริ่มต้น", "Initial profile setup"],
  ["ข้อมูลสำหรับแนะนำงาน", "Information for job recommendations"],
  ["ใช้เวลาประมาณ 2 นาที", "Takes about 2 minutes"],
  ["ใครบ้างที่สามารถเห็นโปรไฟล์ของคุณ", "Who can view your profile"],
  ["ประเภทงานที่ต้องการลำดับที่ 1", "First preferred job category"],
  ["ประเภทงานที่ต้องการลำดับที่ 2", "Second preferred job category"],
  ["ไม่เลือกประเภทงานเพิ่มเติม", "No additional job category"],
  ["เลือกได้สูงสุด 2 ประเภท", "Select up to 2 categories"],
  ["บันทึกและดำเนินการต่อ", "Save and continue"],
  ["ข้ามขั้นตอนนี้", "Skip this step"],
  ["ใกล้สำเร็จแล้ว", "Almost there"],
  ["ข้อมูลที่จำเป็น", "Required information"],
  ["บันทึกข้อมูลเรียบร้อยแล้ว", "Saved successfully"],
  ["บันทึกตัวอย่างเรียบร้อยแล้ว", "Saved successfully"],
  ["บันทึกการตั้งค่าตัวอย่างแล้ว", "Settings saved"],
  ["บันทึกข้อมูลตัวอย่างเรียบร้อยแล้ว", "Saved successfully"],
  ["ข้ามการกรอกข้อมูลตัวอย่างแล้ว", "Setup skipped"],
  ["บันทึกข้อมูลไม่สำเร็จ", "Unable to save information"],
  ["ข้ามขั้นตอนไม่สำเร็จ", "Unable to skip this step"],
  ["กำลังตรวจสอบสมาชิก...", "Checking member session..."],
  ["บัญชีของฉัน", "My account"],
  ["ความสมบูรณ์ของ Resume", "Resume completeness"],
  ["ความสมบูรณ์ของประวัติ", "Resume completeness"],
  ["ตั้งค่าความเป็นส่วนตัว", "Privacy settings"],
  ["เปลี่ยนรหัสผ่าน", "Change password"],
  ["เปลี่ยนอีเมล", "Change email"],
  ["ลบบัญชีของฉัน", "Delete my account"],
  ["การแสดงผลโปรไฟล์", "Profile visibility"],
  ["การตั้งค่าบัญชีและข้อมูล", "Account and data settings"],
  ["อนุญาตให้แนะนำงานที่เหมาะสม", "Allow personalized job recommendations"],
  ["แจ้งเตือนงานใหม่", "New job notifications"],
  ["อีเมลปัจจุบัน", "Current email"],
  ["รหัสผ่านปัจจุบัน", "Current password"],
  ["ยืนยันอีเมลใหม่", "Confirm new email"],
  ["ยืนยันรหัสผ่านใหม่", "Confirm new password"],
  ["รหัสผ่านใหม่", "New password"],
  ["อีเมลใหม่", "New email"],
  ["ลืมรหัสผ่าน?", "Forgot password?"],
  ["อย่างน้อย 8 ตัวอักษร", "At least 8 characters"],
  ["มีตัวเลขอย่างน้อย 1 ตัว", "At least 1 number"],
  ["มีสัญลักษณ์พิเศษอย่างน้อย 1 ตัว", "At least 1 special character"],
  ["แก้ไข Resume", "Edit Resume"],
  ["ดู Resume", "View Resume"],
  ["หน้าโปรไฟล์", "Profile page"],
  ["ข้อมูลส่วนบุคคล", "Personal information"],
  ["ลักษณะงานที่ต้องการ", "Job preferences"],
  ["ประวัติการฝึกงาน/ทำงาน", "Work experience"],
  ["ประวัติการฝึกงานและการทำงาน", "Work experience"],
  ["ประวัติการศึกษา", "Education"],
  ["อบรมประกาศนียบัตร", "Certificates"],
  ["ความสามารถทางภาษา", "Language proficiency"],
  ["ความสามารถอื่นๆ", "Other skills"],
  ["ความสามารถอื่น ๆ", "Other skills"],
  ["ความสามารถเฉพาะทาง", "Professional skills"],
  ["ความสามารถในการขับขี่", "Driving skills"],
  ["ความเร็วเฉลี่ยในการพิมพ์", "Average typing speed"],
  ["โครงการ ผลงาน และประสบการณ์อื่น ๆ", "Projects, achievements, and other experience"],
  ["สถานที่ปฏิบัติงานที่ต้องการ", "Preferred workplace"],
  ["วันที่สามารถเริ่มงานได้", "Available start date"],
  ["เงินเดือนที่ต้องการ", "Expected salary"],
  ["ตำแหน่งงานที่ต้องการ", "Desired position"],
  ["ประเภทงานที่ต้องการ", "Preferred job category"],
  ["งานคอมพิวเตอร์/ไอที", "Computer / IT"], ["งานออกแบบ/กราฟิก", "Design / Graphics"], ["งานการตลาด/ประชาสัมพันธ์", "Marketing / Public Relations"], ["งานบัญชี/การเงิน", "Accounting / Finance"], ["งานวิศวกรรม", "Engineering"], ["งานทรัพยากรบุคคล", "Human Resources"], ["งานขาย/บริการลูกค้า", "Sales / Customer Service"], ["งานอื่น ๆ", "Other jobs"],
  ["สถานภาพการศึกษา", "Education status"],
  ["มัธยมศึกษา", "Secondary school"], ["ประกาศนียบัตรวิชาชีพ (ปวช.)", "Vocational Certificate"], ["ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)", "High Vocational Certificate"],
  ["ปริญญาตรี", "Bachelor's degree"], ["ปริญญาโท", "Master's degree"], ["ปริญญาเอก", "Doctoral degree"],
  ["สายสามัญ", "General education"], ["สายอาชีพ", "Vocational education"], ["อุดมศึกษา", "Higher education"],
  ["วิศวกรรมศาสตร์", "Engineering"], ["วิทยาศาสตร์", "Science"], ["บริหารธุรกิจ", "Business Administration"], ["ศิลปศาสตร์", "Liberal Arts"], ["นิเทศศาสตร์", "Communication Arts"],
  ["ระดับการศึกษา", "Education level"],
  ["สถานศึกษา", "Institution"],
  ["หมวดการศึกษา", "Education category"],
  ["ชื่อปริญญา", "Degree"],
  ["ปีที่คาดว่าจะจบ (พ.ศ.)", "Expected graduation year"],
  ["ปีที่สำเร็จการศึกษา (พ.ศ.)", "Graduation year"],
  ["เกรดเฉลี่ย", "GPA"],
  ["วันที่เริ่ม", "Start date"],
  ["วันที่จบ", "End date"],
  ["ชื่อบริษัท", "Company"],
  ["ตำแหน่งงาน", "Job title"],
  ["รายละเอียดงาน", "Job description"],
  ["ประกาศนียบัตร/วุฒิบัตร", "Certificate"],
  ["ไฟล์ Certificate ทั้งหมด", "All certificate files"],
  ["ยังไม่มีไฟล์ประกาศนียบัตร", "No certificate files yet"],
  ["ชื่อประกาศนียบัตร", "Certificate name"],
  ["เลือกไฟล์", "Choose file"],
  ["เป้าหมายทางอาชีพ", "Career objective"],
  ["ทักษะเฉพาะทาง", "Professional skills"],
  ["ประสบการณ์การทำงาน", "Work experience"],
  ["ประกาศนียบัตร", "Certificates"],
  ["ข้อมูลเพิ่มเติม", "Additional information"],
  ["เกี่ยวกับฉัน", "About me"],
  ["กำลังสร้าง PDF...", "Creating PDF..."],
  ["ดาวน์โหลดเป็น PDF", "Download PDF"],
  ["กำลังโหลด Resume...", "Loading Resume..."],
  ["ยังไม่ได้ระบุตำแหน่งงาน", "No desired position provided"],
  ["ยังไม่ระบุอีเมล", "Email not provided"],
  ["ยังไม่ระบุเบอร์โทร", "Phone not provided"],
  ["ยังไม่ระบุที่อยู่", "Address not provided"],
  ["ยังไม่มีข้อมูล", "No information yet"],
  ["ความเร็วพิมพ์ไทย", "Thai typing speed"],
  ["ความเร็วพิมพ์อังกฤษ", "English typing speed"],
  ["คำ/นาที", "words/min"],
  ["กำลังแก้ไข", "Editing"],
  ["เพิ่มข้อมูลได้สูงสุด 5 ภาษา", "Add up to 5 languages"],
  ["เพิ่มข้อมูลได้สูงสุด 3 รายการ", "Add up to 3 entries"],
  ["เพิ่มได้สูงสุด 5 รายการ", "Add up to 5 entries"],
  ["เพิ่มได้สูงสุด 3 รายการ", "Add up to 3 entries"],
  ["ระบุอย่างน้อย 1 ตำแหน่ง", "Enter at least 1 position"],
  ["ระบุอย่างน้อย 1 ประเภท", "Enter at least 1 category"],
  ["เพิ่มตำแหน่ง", "Add position"],
  ["เพิ่มประเภทงาน", "Add job category"],
  ["เพิ่มความสามารถ", "Add skill"],
  ["เพิ่มภาษา", "Add language"],
  ["เลือกช่วงเงินเดือน", "Select salary range"],
  ["เลือกรูปแบบการทำงาน", "Select work arrangement"],
  ["เลือกวันที่เริ่มงาน", "Select start date"],
  ["ทำงานที่สำนักงาน", "On-site"],
  ["ทำงานแบบไฮบริด", "Hybrid"],
  ["ทำงานออนไลน์", "Remote"],
  ["เริ่มงานได้ทันที", "Immediately"],
  ["มากกว่า 30 วัน", "More than 30 days"],
  ["ภายใน 30 วัน", "Within 30 days"],
  ["ภายใน 15 วัน", "Within 15 days"],
  ["ภายใน 7 วัน", "Within 7 days"],
  ["กรอกชื่อสถานศึกษา", "Enter institution"],
  ["กรอกชื่อสาขา", "Enter major"],
  ["กรอกชื่อบริษัท", "Enter company"],
  ["กรอกเงินเดือน", "Enter salary"],
  ["กรอกความสามารถเพิ่มเติม", "Enter another skill"],
  ["กรอกจำนวนคำ", "Enter words per minute"],
  ["กรอกรหัสผ่านปัจจุบัน", "Enter current password"],
  ["กรอกรหัสผ่านใหม่อีกครั้ง", "Re-enter new password"],
  ["กรอกรหัสผ่านใหม่", "Enter new password"],
  ["กรอกรหัสผ่าน", "Enter password"],
  ["กรอกอีเมลใหม่อีกครั้ง", "Re-enter new email"],
  ["กรอกอีเมลใหม่", "Enter new email"],
  ["กรอกนามสกุล", "Enter last name"],
  ["กรอกชื่อ", "Enter first name"],
  ["เช่น", "e.g."], ["กรอก", "Enter"],
  ["ที่อยู่ปัจจุบัน", "Current address"],
  ["เบอร์โทรศัพท์", "Phone number"],
  ["สถานภาพสมรส", "Marital status"],
  ["บุคคลทุพพลภาพ", "Person with a disability"],
  ["น้ำหนัก (กิโลกรัม)", "Weight (kg)"],
  ["ส่วนสูง (เซนติเมตร)", "Height (cm)"],
  ["สัญชาติ", "Nationality"], ["ศาสนา", "Religion"], ["วันเกิด", "Date of birth"],
  ["นามสกุล", "Last name"], ["ชื่อ", "First name"], ["เพศ", "Gender"],
  ["ชาย", "Male"], ["หญิง", "Female"], ["วันที่", "Day"], ["เดือน", "Month"], ["ปี", "Year"],
  ["ภาษาไทย", "Thai"], ["ภาษาอังกฤษ", "English"], ["ภาษาจีน", "Chinese"], ["ภาษาญี่ปุ่น", "Japanese"], ["ภาษาเกาหลี", "Korean"], ["ภาษาฝรั่งเศส", "French"], ["ภาษาเยอรมัน", "German"], ["ภาษาสเปน", "Spanish"], ["ภาษาอื่น ๆ", "Other language"],
  ["การฟัง", "Listening"], ["การพูด", "Speaking"], ["การอ่าน", "Reading"], ["การเขียน", "Writing"],
  ["พื้นฐาน", "Basic"], ["พอใช้", "Fair"], ["ดีมาก", "Very good"], ["เชี่ยวชาญ", "Fluent"], ["ดี", "Good"],
  ["กำลังศึกษา", "Studying"], ["จบการศึกษา", "Graduated"], ["คณะ", "Faculty"], ["สาขา", "Major"],
  ["ฝึกงาน", "Internship"], ["งานเต็มเวลา", "Full-time"], ["งานพาร์ตไทม์", "Part-time"], ["งานสัญญาจ้าง", "Contract"],
  ["รถจักรยานยนต์", "Motorcycle"], ["รถยนต์", "Car"], ["รถบรรทุก", "Truck"],
  ["หน้าแรก", "Home"], ["ค้นหางาน", "Find jobs"], ["ฝากประวัติ", "Create Resume"], ["บทความ", "Articles"], ["เกี่ยวกับเรา", "About us"], ["ติดต่อเรา", "Contact us"],
  ["ผู้หางาน", "Job seekers"], ["ผู้ประกอบการ", "Employers"], ["งานที่บันทึก", "Saved jobs"], ["ประวัติการสมัครงาน", "Application history"], ["ลงทะเบียนฟรี", "Register free"], ["ลงประกาศงาน", "Post a job"],
  ["ข้อกำหนดและเงื่อนไข", "Terms and conditions"], ["ความปลอดภัย", "Security"], ["ความเป็นส่วนตัว", "Privacy"],
  ["โปรไฟล์", "Profile"], ["แก้ไขประวัติ", "Edit resume"], ["ดูตัวอย่างประวัติ", "Resume preview"], ["งานของฉัน", "My jobs"], ["คำเชิญจากบริษัท", "Company invitations"], ["ออกจากระบบ", "Log out"],
  ["ผู้ใช้งาน CyberJob", "CyberJob user"], ["สมาชิก CyberJob", "CyberJob member"],
  ["สาธารณะ", "Public"], ["ส่วนตัว", "Private"], ["ตั้งค่า", "Settings"], ["ลบบัญชี", "Delete account"],
  ["บันทึก", "Save"], ["ยกเลิก", "Cancel"], ["รีเซ็ต", "Reset"], ["ลบรายการ", "Delete entry"], ["ลบ", "Delete"], ["เพิ่ม", "Add"], ["เลือก", "Select"], ["ระบุ", "Enter"], ["พิมพ์", "Print"],
  ["อื่น ๆ", "Other"], ["ไม่ระบุ", "Not specified"], ["รายการ", "entries"], ["ลำดับ", "Entry"], ["ภาษา", "Language"], ["ประเภทงาน", "Job type"], ["เงินเดือน", "Salary"],
  ["มกราคม", "January"], ["กุมภาพันธ์", "February"], ["มีนาคม", "March"], ["เมษายน", "April"], ["พฤษภาคม", "May"], ["มิถุนายน", "June"], ["กรกฎาคม", "July"], ["สิงหาคม", "August"], ["กันยายน", "September"], ["ตุลาคม", "October"], ["พฤศจิกายน", "November"], ["ธันวาคม", "December"],
  ["บาท", "THB"], ["ไทย", "Thai"], ["พุทธ", "Buddhist"], ["คริสต์", "Christian"], ["อิสลาม", "Islam"], ["โสด", "Single"], ["สมรส", "Married"], ["หย่าร้าง", "Divorced"], ["หม้าย", "Widowed"],
];

const orderedTranslations = [...translations].sort((a, b) => b[0].length - a[0].length);
const textOriginal = new WeakMap<Text, string>();
const attributeOriginal = new WeakMap<Element, Record<string, string>>();

function translateText(value: string) {
  return orderedTranslations.reduce((result, [thai, english]) => result.split(thai).join(english), value);
}

type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void; toggleLocale: () => void };
const LanguageContext = createContext<LanguageContextValue>({ locale: "th", setLocale: () => undefined, toggleLocale: () => undefined });

export function useLanguage() { return useContext(LanguageContext); }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("th");

  useEffect(() => {
    const saved = window.localStorage.getItem("cyberjobLocale");
    if (saved === "en") setLocale("en");
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("cyberjobLocale", locale);
    let translating = false;

    const apply = (root: ParentNode) => {
      if (translating) return;
      translating = true;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const textNode = node as Text;
        const parent = textNode.parentElement;
        if (parent && !parent.closest("script, style") && !parent.closest("[data-no-translate]")) {
          if (!textOriginal.has(textNode)) textOriginal.set(textNode, textNode.nodeValue ?? "");
          const original = textOriginal.get(textNode) ?? "";
          textNode.nodeValue = locale === "en" ? translateText(original) : original;
        }
        node = walker.nextNode();
      }
      const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from(root.querySelectorAll("*"));
      for (const element of elements) {
        if (element.closest("[data-no-translate]")) continue;
        if (element instanceof HTMLOptionElement && !element.hasAttribute("value")) element.setAttribute("value", element.textContent ?? "");
        const originals = attributeOriginal.get(element) ?? {};
        for (const attribute of ["placeholder", "aria-label", "title"]) {
          const value = element.getAttribute(attribute);
          if (value !== null && !(attribute in originals)) originals[attribute] = value;
          if (attribute in originals) element.setAttribute(attribute, locale === "en" ? translateText(originals[attribute]) : originals[attribute]);
        }
        attributeOriginal.set(element, originals);
      }
      translating = false;
    };

    apply(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) for (const node of Array.from(mutation.addedNodes)) {
        if (node instanceof Element || node instanceof DocumentFragment) apply(node);
        else if (node instanceof Text && node.parentNode) apply(node.parentNode);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, toggleLocale: () => setLocale((current) => current === "th" ? "en" : "th") }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
