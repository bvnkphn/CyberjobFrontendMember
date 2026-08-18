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
  const [modal, setModal] = useState<ModalName>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { getProfile().then(setProfile).catch(() => undefined); }, []);

  const name = profile?.firstName || profile?.lastName ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() : "ผู้ใช้งาน CyberJob";
  const completion = profile?.completion ?? 0;

  const submitModal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => { setSaved(false); setModal(null); }, 900);
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        <h1>โปรไฟล์</h1>

        <section className="dashboard-user-card">
          <div className="avatar" aria-hidden="true">{name.charAt(0)}</div>
          <div><strong>{name}</strong><span>สมาชิก CyberJob</span></div>
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
          {settings.map((item) => (
            <button type="button" className={item.danger ? "danger" : ""} onClick={() => setModal(item.modal)} key={item.modal}>
              <Icon name={item.icon} /><span>{item.label}</span><b aria-hidden="true">›</b>
            </button>
          ))}
        </section>
      </div>

      {modal && <SettingsModal modal={modal} saved={saved} onClose={() => setModal(null)} onSubmit={submitModal} />}
    </main>
  );
}

function SettingsModal({ modal, saved, onClose, onSubmit }: { modal: Exclude<ModalName, null>; saved: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const titles = { privacy: "ตั้งค่าความเป็นส่วนตัว", email: "เปลี่ยนอีเมล", password: "เปลี่ยนรหัสผ่าน", delete: "ลบบัญชีถาวร" };
  return (
    <div className="settings-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header><h2 id="settings-title">{titles[modal]}</h2><button type="button" onClick={onClose} aria-label="ปิด">×</button></header>
        <form onSubmit={onSubmit}>
          {modal === "privacy" && <PrivacySettings />}
          {modal === "email" && <EmailSettings />}
          {modal === "password" && <PasswordSettings />}
          {modal === "delete" && <DeleteSettings />}
          <footer>
            <button type="button" className="modal-cancel" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className={`primary-button ${modal === "delete" ? "delete-button" : ""}`}>{modal === "delete" ? "ลบบัญชีของฉัน" : "บันทึก"}</button>
          </footer>
          {saved && <p className="modal-status" role="status">บันทึกการตั้งค่าตัวอย่างแล้ว</p>}
        </form>
      </section>
    </div>
  );
}

function PrivacySettings() {
  return <><fieldset className="modal-options"><legend>การแสดงผลโปรไฟล์</legend><label><input type="radio" name="privacy" value="public" defaultChecked /><span><strong>สาธารณะ</strong><small>ผู้ประกอบการสามารถค้นหาโปรไฟล์ของคุณได้</small></span></label><label><input type="radio" name="privacy" value="private" /><span><strong>ส่วนตัว</strong><small>แสดงเฉพาะบริษัทที่คุณสมัครงาน</small></span></label></fieldset><fieldset className="toggle-settings"><legend>การตั้งค่าบัญชีและข้อมูล</legend><label><span>อนุญาตให้แนะนำงานที่เหมาะสม</span><input type="checkbox" defaultChecked /></label><label><span>แจ้งเตือนงานใหม่</span><input type="checkbox" defaultChecked /></label></fieldset></>;
}

function EmailSettings() {
  return <div className="modal-fields"><label>อีเมลปัจจุบัน<input value="member@example.com" readOnly /></label><label>รหัสผ่านปัจจุบัน<input type="password" required placeholder="กรอกรหัสผ่าน" /></label><label>อีเมลใหม่<input type="email" required placeholder="กรอกอีเมลใหม่" /></label><label>ยืนยันอีเมลใหม่<input type="email" required placeholder="กรอกอีเมลใหม่อีกครั้ง" /></label><p className="modal-note">ระบบจะส่งลิงก์ยืนยันไปยังอีเมลใหม่</p></div>;
}

function PasswordSettings() {
  return <div className="modal-fields"><label>รหัสผ่านปัจจุบัน<input type="password" required placeholder="กรอกรหัสผ่านปัจจุบัน" /></label><label>รหัสผ่านใหม่<input type="password" required minLength={8} placeholder="กรอกรหัสผ่านใหม่" /></label><ul><li>อย่างน้อย 8 ตัวอักษร</li><li>มีตัวเลขอย่างน้อย 1 ตัว</li><li>มีสัญลักษณ์พิเศษอย่างน้อย 1 ตัว</li></ul><label>ยืนยันรหัสผ่านใหม่<input type="password" required minLength={8} placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" /></label><Link href="/forgot-password">ลืมรหัสผ่าน?</Link></div>;
}

function DeleteSettings() {
  return <div className="modal-fields delete-warning"><p>เมื่อลบบัญชีแล้ว คุณจะไม่สามารถกู้คืนข้อมูลประวัติและการสมัครงานได้</p><label>รหัสผ่านปัจจุบัน<input type="password" required placeholder="กรอกรหัสผ่าน" /></label><label className="delete-confirm"><input type="checkbox" required /> ฉันเข้าใจและยืนยันว่าต้องการลบบัญชีนี้</label></div>;
}
