"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getProfile, type MemberProfile } from "@/lib/member-api";
import { Icon, type IconName } from "../icons";
import "./profile-editor.css";
import "./profile-dashboard.css";

type ModalName = "privacy" | "email" | "password" | "delete" | null;

const settings: { icon: IconName; label: string; modal: Exclude<ModalName, null>; danger?: boolean }[] = [
  { icon: "user", label: "ตั้งค่าความเป็นส่วนตัว", modal: "privacy" },
  { icon: "mail", label: "เปลี่ยนอีเมล", modal: "email" },
  { icon: "edit", label: "เปลี่ยนรหัสผ่าน", modal: "password" },
  { icon: "logout", label: "ลบบัญชี", modal: "delete", danger: true },
];

export function ProfileDashboard() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [expanded, setExpanded] = useState<ModalName>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { getProfile().then(setProfile).catch(() => undefined); }, []);

  const personal = profile?.personal ?? {};
  const firstName = profile?.firstName ?? (typeof personal.firstName === "string" ? personal.firstName : "");
  const lastName = profile?.lastName ?? (typeof personal.lastName === "string" ? personal.lastName : "");
  const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : "ผู้ใช้งาน CyberJob";
  const email = profile?.email ?? "สมาชิก CyberJob";
  const completion = profile?.completion ?? 0;

  const submitModal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => { setSaved(false); setExpanded(null); }, 900);
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        <header className="dashboard-heading"><span>บัญชีของฉัน</span><h1>โปรไฟล์</h1><p>จัดการ Resume และการตั้งค่าบัญชีของคุณได้จากที่นี่</p></header>

        <section className="dashboard-user-card">
          <div className="avatar" aria-hidden="true">{name.charAt(0)}</div>
          <div><strong>{name}</strong><span>{email}</span></div>
        </section>

        <section className="resume-summary">
          <h2>ความสมบูรณ์ของ Resume</h2>
          <div className="resume-summary-content">
            <div className="dashboard-ring" style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}><span>{completion}%</span></div>
            <div>
              <p>{completion < 100 ? "เพิ่มข้อมูลในประวัติเพื่อเพิ่มโอกาสในการถูกคัดเลือก" : "ประวัติของคุณพร้อมสำหรับการสมัครงานแล้ว"}</p>
              <div className="resume-actions">
                <Link className="primary-button" href="/profile/edit"><Icon name="edit" /> แก้ไข Resume</Link>
                <Link className="secondary-link-button" href="/profile/preview"><Icon name="preview" /> ดู Resume</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h2><span aria-hidden="true">⚙</span> ตั้งค่า</h2>
          {settings.map((item) => <div className="settings-item" key={item.modal}>
            <button type="button" className={item.danger ? "danger" : ""} onClick={() => setExpanded(expanded === item.modal ? null : item.modal)} aria-expanded={expanded === item.modal}>
              <Icon name={item.icon} /><span>{item.label}</span><b aria-hidden="true">{expanded === item.modal ? "⌃" : "⌄"}</b>
            </button>
            {expanded === item.modal && <SettingsDropdown setting={item.modal} email={profile?.email ?? ""} saved={saved} onCancel={() => setExpanded(null)} onSubmit={submitModal} />}
          </div>)}
        </section>
      </div>
    </main>
  );
}

function SettingsDropdown({ setting, email, saved, onCancel, onSubmit }: { setting: Exclude<ModalName, null>; email: string; saved: boolean; onCancel: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="settings-dropdown">
      <form onSubmit={onSubmit}>
        {setting === "privacy" && <PrivacySettings />}
        {setting === "email" && <EmailSettings email={email} />}
        {setting === "password" && <PasswordSettings />}
        {setting === "delete" && <DeleteSettings />}
        <footer>
          <button type="button" className="modal-cancel" onClick={onCancel}>ยกเลิก</button>
          <button type="submit" className={`primary-button ${setting === "delete" ? "delete-button" : ""}`}>{setting === "delete" ? "ลบบัญชีของฉัน" : "บันทึก"}</button>
        </footer>
        {saved && <p className="modal-status" role="status">บันทึกการตั้งค่าตัวอย่างแล้ว</p>}
      </form>
    </div>
  );
}

function PrivacySettings() {
  return <><fieldset className="modal-options"><legend>การแสดงผลโปรไฟล์</legend><label><input type="radio" name="privacy" value="public" defaultChecked /><span><strong>สาธารณะ</strong><small>ผู้ประกอบการสามารถค้นหาโปรไฟล์ของคุณได้</small></span></label><label><input type="radio" name="privacy" value="private" /><span><strong>ส่วนตัว</strong><small>แสดงเฉพาะบริษัทที่คุณสมัครงาน</small></span></label></fieldset><fieldset className="toggle-settings"><legend>การตั้งค่าบัญชีและข้อมูล</legend><label><span>อนุญาตให้แนะนำงานที่เหมาะสม</span><input type="checkbox" defaultChecked /></label><label><span>แจ้งเตือนงานใหม่</span><input type="checkbox" defaultChecked /></label></fieldset></>;
}

function EmailSettings({ email }: { email: string }) {
  return <div className="modal-fields"><label>อีเมลปัจจุบัน<input value={email} placeholder="ยังไม่มีข้อมูลอีเมล" readOnly /></label><label>รหัสผ่านปัจจุบัน<input type="password" required placeholder="กรอกรหัสผ่าน" /></label><label>อีเมลใหม่<input type="email" required placeholder="กรอกอีเมลใหม่" /></label><label>ยืนยันอีเมลใหม่<input type="email" required placeholder="กรอกอีเมลใหม่อีกครั้ง" /></label><p className="modal-note">ระบบจะส่งลิงก์ยืนยันไปยังอีเมลใหม่</p></div>;
}

function PasswordSettings() {
  return <div className="modal-fields"><label>รหัสผ่านปัจจุบัน<input type="password" required placeholder="กรอกรหัสผ่านปัจจุบัน" /></label><label>รหัสผ่านใหม่<input type="password" required minLength={8} placeholder="กรอกรหัสผ่านใหม่" /></label><ul><li>อย่างน้อย 8 ตัวอักษร</li><li>มีตัวเลขอย่างน้อย 1 ตัว</li><li>มีสัญลักษณ์พิเศษอย่างน้อย 1 ตัว</li></ul><label>ยืนยันรหัสผ่านใหม่<input type="password" required minLength={8} placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" /></label><Link href="/forgot-password">ลืมรหัสผ่าน?</Link></div>;
}

function DeleteSettings() {
  return <div className="modal-fields delete-warning"><p>เมื่อลบบัญชีแล้ว คุณจะไม่สามารถกู้คืนข้อมูลประวัติและการสมัครงานได้</p><label>รหัสผ่านปัจจุบัน<input type="password" required placeholder="กรอกรหัสผ่าน" /></label><label className="delete-confirm"><input type="checkbox" required /> ฉันเข้าใจและยืนยันว่าต้องการลบบัญชีนี้</label></div>;
}
