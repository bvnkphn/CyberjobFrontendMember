"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { useI18n } from "@/public-site/i18n/LanguageProvider";

export type Locale = "th" | "en";

const translations: Array<[string, string]> = [
  // --- หมวดหมู่ Login ---
  ["หางาน", "Find Job"],
  ["หาคน", "Find Candidates"],
  ["เข้าสู่ระบบสำหรับผู้สมัครงาน", "Login for Job Seekers"],
  ["เข้าสู่ระบบสำหรับผู้ประกอบการ", "Login for Employers"],
  ["หรือ", "Or"],
  ["เข้าสู่ระบบด้วยบัญชี Google", "Login with Google"],
  ["ลืมรหัสผ่าน?", "Forgot password?"],
  ["เป็นสมาชิก CYBERJOB?", "New to CYBERJOB? "],
  ["ผู้หางาน", "Job Seeker"],
  ["ผู้ประกอบการ", "Employer"],
  ["ข้อกำหนดการให้บริการ", "the term of service"],
  // --- หมวดหมู่ OTP & Success ---
  ["ยืนยันรหัส", "Verify "],
  ["ระบบได้ส่งรหัส 6 หลัก ไปที่อีเมล", "A 6-digit code has been sent to "],
  ["กรอกรหัส 6 หลัก", "Enter 6-digit code"],
  ["ยืนยันรหัส OTP", "Verify OTP"],
  ["กำลังตรวจสอบ...", "Verifying..."],
  ["ยินดีต้อนรับ! 🎉", "Welcome! 🎉"],
  ["สมัครสมาชิกเรียบร้อยแล้ว", "Registration complete"],
  ["พร้อมเริ่มเขียนเรซูเม่กันเลย", "Ready to start creating your resume"],
  ["เริ่มต้นใช้งาน", "Get Started"],
  ["กรุณากรอกรหัส OTP ให้ครบ 6 หลัก", "Please enter a 6-digit OTP code"],
  ["รหัส OTP ไม่ถูกต้อง", "Invalid OTP code"],
  // --- หมวดหมู่ Auth / สมัครสมาชิก ---
  ["สมัครสมาชิก", "Sign up"],
  ["ชื่อผู้ใช้งาน", "Username"],
  ["อีเมล", "Email"],
  ["รหัสผ่าน", "Password"],
  ["ยืนยันรหัสผ่าน", "Confirm password"],
  ["ฉันยอมรับ", "I agree "],
  ["และ", " and "],
  ["นโยบายความเป็นส่วนตัวของ CyberJob", "privacy policy of Cyber job"],
  ["มีบัญชี CyberJob อยู่แล้ว?", "Already a Cyberjob member? "],
  ["เข้าสู่ระบบ", "Login"],
  ["กำลังดำเนินการ...", "Processing..."],
  ["รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน", "Passwords do not match"],
  ["กรุณากดยอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว", "Please agree to the terms of service and privacy policy"],
  ["เกิดข้อผิดพลาดในการสมัครสมาชิก", "An error occurred during registration"],
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
  ["บริษัทชั้นนำกำลังมองหาคนที่มีความสามารถและพร้อมเติบโตไปด้วยกัน...", "A leading company is looking for talented people ready to grow together..."],
  ["รับผิดชอบการพัฒนาและดูแลระบบ ERP Microsoft Dynamics AX ตามรายละเอียด ออกแบบ พัฒนา และทดสอบฟีเจอร์ใหม่ ตลอดจนบำรุงรักษาระบบให้ทำงานได้อย่างมีประสิทธิภาพ", "Develop and maintain the Microsoft Dynamics AX ERP system, including designing, building, testing new features, and ensuring reliable performance"],
  ["ประสบการณ์พัฒนา Dynamics AX อย่างน้อย 3 ปี หรือมีประสบการณ์ ERP โดยรวม", "At least 3 years of Dynamics AX development experience or equivalent ERP experience"],
  ["ชอบเรียนรู้และสามารถทำงานร่วมกับทีมที่หลากหลายได้ดี", "Eager to learn and able to collaborate effectively with diverse teams"],
  ["ในใบสมัครของคุณประกอบด้วยคำถามต่อไปนี้:", "Your application includes the following questions:"],
  ["มีประสบการณ์ทำงานด้านระบบ ERP โดยตรงหรือไม่", "Do you have direct ERP experience?"],
  ["ยินดีเดินทางไปทำงานที่กรุงเทพฯ หรือไม่", "Are you willing to work in Bangkok?"],
  ["คุณมีวุฒิการศึกษาในสาขาใด", "What is your field of study?"],
  ["เคยใช้งาน Microsoft Office ในระดับใด", "What is your Microsoft Office proficiency?"],
  ["คุณสามารถสื่อสารภาษาอังกฤษได้หรือไม่", "Can you communicate in English?"],
  ["คำถามจากผู้ประกอบการ", "Employer questions"], ["คุณสมบัติเฉพาะ", "Qualifications"],
  ["ดูข้อมูลบริษัท", "View company details"], ["ดูข้อมูลทั้งหมดของบริษัท", "View full company profile"],
  ["งานที่แนะนำ", "Recommended jobs"], ["ดูงานทั้งหมด", "View all jobs"],
  ["ลงประกาศเมื่อ", "Posted"], ["วันที่แล้ว", "days ago"], ["สมัครแล้ว", "Applied"], ["สมัคร", "Apply"], ["บันทึกแล้ว", "Saved"],
  ["กรุงเทพมหานคร (ในเมือง)", "Bangkok (city)"], ["งานประจำ", "Full-time"], ["อัตรา", "position"], ["บาท/เดือน", "THB/month"],
  ["เลิกถูกใจงานนี้", "Unlike this job"], ["ถูกใจงานนี้", "Like this job"],
  ["โปรไฟล์บริษัท", "Company profile"], ["ประเภทธุรกิจ", "Business type"], ["เว็บไซต์", "Website"], ["ที่อยู่", "Address"],
  ["บริษัทชั้นนำด้านเทคโนโลยีและนวัตกรรม", "A leading technology and innovation company"],
  ["ข้อมูลบริษัท", "Company information"], ["ที่ตั้งบริษัท", "Company location"], ["ข้อมูลติดต่อ", "Contact information"],
  ["ตำแหน่งที่ตั้งของธุรกิจ", "Business location"], ["ตำแหน่งงานของบริษัท", "Open positions"],
  ["เกี่ยวกับ", "About"], ["งาน", "Jobs"], ["โทรศัพท์", "Phone"], ["อีเมล", "Email"],
  ["แชร์ข้อมูลบริษัท", "Share company profile"], ["บรรยากาศการทำงานของบริษัท", "Company workplace"], ["บรรยากาศบริษัท", "Company workplace"], ["ภาพบรรยากาศการทำงานด้านเทคโนโลยี", "Technology workplace"],
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
  ["คำเชิญจากบริษัท", "Company invitations"], ["รอตอบกลับ", "Awaiting response"], ["รายการคำเชิญ", "Invitation list"], ["ไม่มีคำเชิญที่รอตอบกลับ", "No invitations awaiting response"], ["ตอบรับ", "Accept"], ["ปฏิเสธ", "Decline"], ["ตอบรับแล้ว", "Accepted"], ["ปฏิเสธแล้ว", "Declined"], ["บริษัทสนใจประวัติของคุณและต้องการเชิญให้เข้าร่วมสมัครงานตำแหน่งนี้", "The company is interested in your profile and would like to invite you to apply for this position"], ["ทีมงานเห็นว่าประสบการณ์ของคุณตรงกับตำแหน่งนี้ อยากเชิญคุณพูดคุยเพิ่มเติม", "The team believes your experience matches this position and would like to speak with you"], ["ขอเชิญคุณเข้าร่วมพูดคุยเกี่ยวกับโอกาสการทำงานกับบริษัท", "We would like to invite you to discuss a career opportunity with the company"], ["เงินเดือน", "Salary"],
  ["บทความ", "Articles"], ["เคล็ดลับและความรู้เพื่อการทำงานและพัฒนาตัวเอง", "Tips and knowledge for work and self-development"], ["ทั้งหมด", "All"], ["เรซูเม่", "Resume"], ["การทำงาน", "Work"], ["สมัครงาน", "Job applications"], ["อาชีพ", "Career"], ["อ่านต่อ", "Read more"], ["ย้อนกลับ", "Previous"], ["ถัดไป", "Next"], ["หน้าบทความ", "Article pages"], ["ยังไม่มีบทความในหมวดนี้", "There are no articles in this category"], ["5 เคล็ดลับเขียนเรซูเม่ให้โดดเด่นและได้งาน", "5 tips to write a standout resume and get hired"], ["เทรนด์การทำงานแห่งอนาคต 2026", "Future of work trends in 2026"], ["เตรียมตัวสัมภาษณ์งานอย่างไรให้มั่นใจ", "How to prepare confidently for a job interview"], ["การหางานสำหรับนักศึกษาจบใหม่", "Job search tips for new graduates"], ["รวมเคล็ดลับเขียนเรซูเม่ให้โดดเด่น อ่านง่าย และช่วยเพิ่มโอกาสได้งานที่ใช่", "Tips to make your resume stand out, easy to read, and more likely to land the right job"], ["ทักษะและรูปแบบการทำงานที่กำลังเปลี่ยนโลกการทำงานของคนรุ่นใหม่", "Skills and work styles shaping the future of work"], ["แนวทางเตรียมตัวก่อนสัมภาษณ์ ตั้งแต่การค้นคว้าบริษัทจนถึงการตอบคำถาม", "A guide to preparing for interviews, from researching the company to answering questions"], ["เริ่มต้นเส้นทางอาชีพอย่างมั่นใจ พร้อมเทคนิคค้นหางานแรกที่เหมาะกับคุณ", "Start your career with confidence and find your first suitable job"],
  ["บริษัท", "Company"], ["จำกัด", "Limited"], ["บริษัท เอซีซี จำกัด", "ACC Company Limited"], ["บริษัท เอสเอส จำกัด", "SS Company Limited"], ["บริษัท คลีน จำกัด", "Clean Company Limited"], ["บริษัท เอ็นเอส จำกัด", "NS Company Limited"], ["บริษัท เอซีซี จำกัด เงินเดือน 15,000 - 20,000 บาท", "ACC Company Limited Salary 15,000 - 20,000 THB"], ["บริษัท เอสเอส จำกัด เงินเดือน 30,000 - 50,000 บาท", "SS Company Limited Salary 30,000 - 50,000 THB"], ["บริษัท คลีน จำกัด เงินเดือน 30,000 - 55,000 บาท", "Clean Company Limited Salary 30,000 - 55,000 THB"], ["บริษัท เอ็นเอส จำกัด เงินเดือน 15,000 - 20,000 บาท", "NS Company Limited Salary 15,000 - 20,000 THB"], ["52 ถูกใจ", "52 likes"], ["256 ความคิดเห็น", "256 comments"], ["158 เข้าชม", "158 views"], ["บทความล่าสุด", "Latest articles"], ["หมวดหมู่", "Categories"], ["แท็กที่เกี่ยวข้อง", "Related tags"], ["ผู้เขียน", "Author"], ["โพสต์ใกล้เคียง", "Related posts"], ["ดูโปรไฟล์", "View profile"], ["ดูบทความทั้งหมด", "View all articles"], ["แชร์", "Share"], ["ความคิดเห็น (3)", "Comments (3)"], ["ส่งความคิดเห็น", "Submit comment"], ["เขียนความคิดเห็นของคุณ...", "Write your comment..."], ["ก่อนหน้า", "Previous"], ["ถัดไป", "Next"], ["เรซูเม่", "Resume"], ["สมัครงาน", "Job applications"], ["ทีมงาน CyberJob", "CyberJob team"], ["ผู้เขียน", "Author"], ["มิ.ย.", "Jun"], ["ส.ค.", "Aug"], ["อัปเดตล่าสุด", "Last updated"],
  ["สมัครสมาชิกฟรีหรือไม่?", "Is registration free?"], ["ผู้หางานสามารถสมัครสมาชิก สร้างโปรไฟล์ ค้นหางาน และสมัครงานได้โดยไม่มีค่าใช้จ่าย", "Job seekers can register, create a profile, search for jobs, and apply at no cost"], ["บริษัทลงทะเบียนอย่างไร?", "How can a company register?"], ["ผู้ประกอบการสามารถติดต่อทีมงานเพื่อขอข้อมูลการลงทะเบียนและเริ่มต้นใช้งานได้", "Employers can contact our team for registration information and onboarding"], ["สมัครงานได้อย่างไร?", "How do I apply for a job?"], ["เลือกตำแหน่งที่สนใจ ตรวจสอบรายละเอียด แล้วกดสมัครงานหรือส่งประวัติให้บริษัทตามช่องทางที่ระบุ", "Choose a position, review the details, then apply or send your resume through the listed channel"], ["มีแอปมือถือหรือไม่?", "Is there a mobile app?"], ["ขณะนี้สามารถใช้งาน CyberJob ผ่านเว็บไซต์บนโทรศัพท์มือถือได้ และเรากำลังพัฒนาประสบการณ์ให้ดียิ่งขึ้น", "You can use CyberJob through our mobile-friendly website while we continue improving the experience"],
  // --- หน้า About ---
  ["เรื่องราวของเรา", "Our Story"],
  ["CyberJob เกิดขึ้นจากความตั้งใจที่จะเชื่อมโยงคนหางานกับนายจ้าง ให้กระบวนการหางานง่ายและตรงประเด็นมากขึ้น เราเชื่อว่าทุกคนสมควรได้รับโอกาสในการทำงานที่เหมาะสมกับทักษะและความต้องการ แพลตฟอร์มของเราออกแบบมาเพื่อช่วยให้ผู้หางานค้นพบอาชีพที่ใช่ พร้อมทั้งเป็นสะพานเชื่อมระหว่างองค์กรกับบุคลากรคุณภาพ", "CyberJob was founded to connect job seekers with employers, making the hiring process simpler and more precise. We believe everyone deserves the opportunity to work in a role fitting their skills and needs. Our platform is designed to help professionals discover the right career while bridging organisations with high-calibre talent."],
  ["พันธกิจ", "Mission"],
  ["มุ่งมั่นพัฒนาแพลตฟอร์มหางานที่เข้าถึงง่าย ปลอดภัย และตรงกับความต้องการของผู้ใช้ทุกคน", "Dedicated to developing an accessible, safe, and tailored job platform for all users."],
  ["วิสัยทัศน์", "Vision"],
  ["เป็นแพลตฟอร์มหางานอันดับหนึ่งของไทยที่ทุกคนนึกถึงเมื่อต้องการโอกาสใหม่ในอาชีพ", "To be Thailand's premier job platform everyone turns to for new career opportunities."],
  ["บริการของเรา", "Our Services"],
  ["หางานออนไลน์", "Online Job Search"],
  ["ค้นหางานที่ตรงกับความสามารถของคุณ", "Find jobs matching your skills"],
  ["สร้างเรซูเม่", "Resume Builder"],
  ["เครื่องมือสร้างเรซูเม่มืออาชีพฟรี", "Free professional resume building tool"],
  ["งานจบใหม่", "New Graduate Jobs"],
  ["โอกาสสำหรับนักศึกษาและเด็กจบใหม่", "Opportunities for students and fresh graduates"],
  ["สำหรับบริษัท", "For Employers"],
  ["ช่องทางคัดเลือกผู้สมัครที่มีคุณภาพ", "Quality candidate recruitment channel"],
  ["ทำไมต้อง CyberJob", "Why CyberJob"],
  ["ผู้ใช้มากมาย", "Vast Community"],
  ["ผู้ใช้งานที่ไว้วางใจในระบบ", "Trusted by a growing user base"],
  ["ไว้ใจได้", "Reliable & Secure"],
  ["ระบบยืนยันตัวตนที่ปลอดภัย", "Secure identity verification system"],
  ["รวดเร็ว", "Fast & Responsive"],
  ["สมัครงานได้ในไม่กี่คลิก", "Apply for jobs in just a few clicks"],
  ["ฟรีจริง", "Completely Free"],
  ["สร้างเรซูเม่และสมัครงานฟรีทั้งหมด", "Create resumes and apply for jobs 100% free"],
  ["รู้จักเรื่องราว พันธกิจ และบริการที่ CyberJob ตั้งใจสร้างเพื่อคนหางาน", "Discover the story, mission, and services CyberJob creates for job seekers."],
  // --- หน้า Contact & LINE ---
  ["มีคำถามหรือต้องการความช่วยเหลือ? ทีมงาน CyberJob พร้อมดูแลคุณ", "Have questions or need assistance? The CyberJob team is here to help."],
  ["ช่องทางที่ตอบเร็วที่สุด", "Fastest response channel"],
  ["LINE Official Account", "LINE Official Account"],
  ["แชทกับทีมงานเพื่อสอบถามเรื่องบัญชี การสมัครงาน หรือการใช้งานเว็บไซต์", "Chat with our support team regarding accounts, applications, or website guidance."],
  ["แชทกับเรา", "Chat with us"],
  ["ช่องทางติดต่ออื่น", "Other contact methods"],
  ["ตอบกลับภายใน 1 วันทำการ", "Reply within 1 business day"],
  ["จันทร์–ศุกร์ เวลา 09:00–18:00 น.", "Mon–Fri 09:00–18:00"],
  ["คำตอบสำหรับคำถามเกี่ยวกับการใช้งาน CyberJob", "Answers to common questions about using CyberJob."],
  // --- หน้า Invitations & Always Allow ---
  ["ตรวจสอบและตอบรับคำเชิญจากบริษัทที่สนใจโปรไฟล์ของคุณ", "Review and respond to invitations from companies interested in your profile."],
  ["ยังไม่มีคำเชิญจากบริษัท", "No company invitations yet"],
  ["อนุญาตให้บริษัทส่งคำเชิญเสมอ", "Always allow company invitations"],
  ["เปิดรับคำเชิญเสมอ", "Always allow invitations"],
  ["เปิดรับคำเชิญ", "Accepting invitations"],
  ["ปิดรับคำเชิญ", "Invitations paused"],
  ["อนุญาตให้บริษัทที่สนใจสามารถค้นพบโปรไฟล์และส่งคำเชิญสมัครงานถึงคุณได้โดยตรง", "Allow interested employers to discover your profile and send job invitations directly."],
  // --- มุดงาน (Hide Job) ---
  ["มุดงานนี้", "Hide this job"],
  ["มุดงาน", "Hide job"],
  ["ยกเลิกการมุด", "Unhide"],
  ["งานที่มุด", "Hidden jobs"],
  ["งานที่ซ่อนไว้", "Hidden jobs"],
  ["มุดงานเรียบร้อยแล้ว", "Job hidden successfully"],
  ["เลิกทำ", "Undo"],
  ["คุณยังไม่ได้มุดงานใดๆ", "You haven't hidden any jobs yet"],
  ["จัดการงานที่คุณเลือกซ่อนไว้จากหน้าค้นหา", "Manage jobs you have hidden from search results"],
  // --- หน้าแรก & ทั่วไป ---
  ["ค้นหาอนาคตของคุณกับ CyberJob", "Find your future with CyberJob"],
  ["แพลตฟอร์มหางานที่เชื่อมต่อคนทำงานกับองค์กรชั้นนำ เพื่อให้คุณได้พบกับโอกาสที่ใช่ในสายอาชีพที่คุณต้องการ", "A job platform that connects talent with leading organisations, so you can find the right opportunity in the career you want."],
  ["สร้างบัญชีฝากเรซูเม่ฟรี", "Create a free resume account"],
  ["สำหรับนักศึกษาจบใหม่และผู้หางานทั่วไป สร้างโปรไฟล์ของคุณให้โดดเด่นและเพิ่มโอกาสให้ถูกมองเห็นจากบริษัทชั้นนำได้ง่ายขึ้น โดยไม่มีค่าใช้จ่าย", "For graduates and job seekers alike — build a standout profile and get discovered by leading companies, at no cost."],
  ["ลงทะเบียนฝากข้อมูล", "Register and upload"],
  ["รูปแบบงาน", "Work Style"],
  ["สถานที่ทำงาน", "Location"],
  ["ค้นหางาน", "Search jobs"],
  ["ชื่อตำแหน่ง คำค้นหา", "Job title or keyword"],
  ["สาขาอาชีพ", "Job category"],
  ["งานของฉัน", "My Jobs"],
  ["จัดการงานที่บันทึกและติดตามสถานะใบสมัครของคุณ", "Manage saved jobs and track your applications."],
  ["งานที่ปักหมุด", "Saved Jobs"],
  ["งานที่สมัครแล้ว", "Applied Jobs"],
  ["งานที่บันทึก", "Saved Jobs"],
  ["งานที่สมัคร", "Applied Jobs"],
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
  // ปุ่มสลับภาษาบน Nav bar เป็นแหล่งความจริงเดียว ตัวนี้จึงเดินตามค่านั้น
  // มิฉะนั้นหน้าที่แปลด้วยการแทนที่ข้อความ (เช่น gate/login) จะไม่เปลี่ยนตามปุ่ม
  const { lang } = useI18n();

  useEffect(() => {
    setLocale(lang);
  }, [lang]);

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
          if (locale === "en") {
            const translated = translateText(original);
            if (translated !== original) {
              textNode.nodeValue = translated;
            }
          } else {
            textNode.nodeValue = original;
          }
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
          if (attribute in originals) {
            if (locale === "en") {
              const trans = translateText(originals[attribute]);
              if (trans !== originals[attribute]) element.setAttribute(attribute, trans);
            } else {
              element.setAttribute(attribute, originals[attribute]);
            }
          }
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
