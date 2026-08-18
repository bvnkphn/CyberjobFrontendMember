"use client";

import { FormEvent, useState } from "react";
import { Icon, type IconName } from "../icons";
import "./profile-editor.css";

type ProfileSection = {
  icon: IconName;
  label: string;
  action?: string;
};

const sections: ProfileSection[] = [
  { icon: "user", label: "ข้อมูลส่วนบุคคล" },
  { icon: "briefcase", label: "ลักษณะงานที่ต้องการ" },
  { icon: "education", label: "ประวัติการศึกษา", action: "เพิ่ม" },
  { icon: "edit", label: "ประวัติการฝึกงาน/ทำงาน", action: "เพิ่ม" },
  { icon: "trophy", label: "อบรมประกาศนียบัตร", action: "เพิ่ม" },
  { icon: "globe", label: "ความสามารถทางภาษา", action: "เพิ่ม" },
  { icon: "skills", label: "ความสามารถอื่นๆ" },
];

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

function Field({ label, required, children, className = "" }: FieldProps) {
  return (
    <label className={`field ${className}`}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children}
    </label>
  );
}

export function ProfileEditor() {
  const [gender, setGender] = useState("male");
  const [saved, setSaved] = useState(false);

  // UX-only submit: replace this function with the profile API mutation later.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <aside className="profile-sidebar" aria-label="ส่วนของประวัติ">
          <section className="completion-card">
            <div className="progress-ring" aria-label="ความสมบูรณ์ของประวัติ 70 เปอร์เซ็นต์">
              <span>70%</span>
            </div>
            <p>ความสมบูรณ์ของประวัติ</p>
            <small>ผ่านการตรวจสอบแล้ว</small>
          </section>

          <section className="update-card">
            <p>อัปเดตประวัติ เพื่อเพิ่มโอกาสให้บริษัทได้พบประวัติคุณก่อนใคร</p>
            <button className="primary-button" type="button">อัปเดต</button>
          </section>

          <nav className="section-nav" aria-label="หัวข้อแก้ไขประวัติ">
            {sections.map(({ icon, label, action }, index) => (
              <a className={index === 0 ? "active" : ""} href={index === 0 ? "#personal" : "#coming-soon"} key={label}>
                <Icon name={icon} />
                <span>{label}</span>
                {action && <em>{action}</em>}
              </a>
            ))}
          </nav>
        </aside>

        <form className="profile-form" onSubmit={submit} id="personal">
          <h1>ข้อมูลส่วนบุคคล</h1>
          <div className="form-grid">
            <Field label="ชื่อ" required>
              <input name="firstName" autoComplete="given-name" placeholder="your name" required />
            </Field>
            <Field label="นามสกุล" required>
              <input name="lastName" autoComplete="family-name" placeholder="your surname" required />
            </Field>

            <fieldset className="field gender-field">
              <legend>เพศ <b aria-hidden="true">*</b></legend>
              <div className="segmented">
                <button className={gender === "male" ? "selected" : ""} type="button" aria-pressed={gender === "male"} onClick={() => setGender("male")}>ชาย</button>
                <button className={gender === "female" ? "selected" : ""} type="button" aria-pressed={gender === "female"} onClick={() => setGender("female")}>หญิง</button>
              </div>
              <input type="hidden" name="gender" value={gender} />
            </fieldset>
            <div />

            <Field label="วันเกิด" required className="full">
              <div className="date-grid">
                <select name="birthDay" aria-label="วันที่" required defaultValue="">
                  <option value="" disabled>วันที่</option>
                  {Array.from({ length: 31 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}
                </select>
                <select name="birthMonth" aria-label="เดือน" required defaultValue="">
                  <option value="" disabled>เดือน</option>
                  {thaiMonths.map((month) => <option key={month}>{month}</option>)}
                </select>
                <select name="birthYear" aria-label="ปี" required defaultValue="">
                  <option value="" disabled>ปี</option>
                  {Array.from({ length: 70 }, (_, index) => <option key={2568 - index}>{2568 - index}</option>)}
                </select>
              </div>
            </Field>

            <Field label="สัญชาติ">
              <select name="nationality" defaultValue=""><option value="">เลือก</option><option>ไทย</option><option>อื่น ๆ</option></select>
            </Field>
            <Field label="ศาสนา">
              <select name="religion" defaultValue=""><option value="">เลือก</option><option>พุทธ</option><option>คริสต์</option><option>อิสลาม</option><option>อื่น ๆ</option></select>
            </Field>
            <Field label="น้ำหนัก (กิโลกรัม)"><input name="weight" type="number" min="0" step="0.1" placeholder="0.00" /></Field>
            <Field label="ส่วนสูง (เซนติเมตร)"><input name="height" type="number" min="0" step="0.1" placeholder="0.00" /></Field>

            <label className="checkbox-field full"><input name="hasDisability" type="checkbox" /> บุคคลทุพพลภาพ</label>
            <Field label="สถานภาพสมรส" className="full">
              <select name="maritalStatus" defaultValue=""><option value="">เลือก</option><option>โสด</option><option>สมรส</option><option>หย่าร้าง</option><option>หม้าย</option></select>
            </Field>
            <Field label="เบอร์โทรศัพท์" required><input type="tel" name="phone" autoComplete="tel" placeholder="0XX-XXX-XXXX" required /></Field>
            <Field label="LINE ID"><input name="lineId" placeholder="ระบุ" /></Field>
            <Field label="ที่อยู่ปัจจุบัน" required className="full">
              <textarea name="address" autoComplete="street-address" placeholder="ระบุ (บ้านเลขที่ ตึก/ห้อง แขวง/ตำบล ถนน รหัสไปรษณีย์)" required />
            </Field>
          </div>

          <div className="save-row">
            <button className="primary-button save-button" type="submit">บันทึก</button>
            {saved && <p className="save-message" role="status">บันทึกตัวอย่างเรียบร้อยแล้ว</p>}
          </div>
        </form>
      </div>
    </main>
  );
}
