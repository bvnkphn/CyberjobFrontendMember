"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/public-site/auth/AuthProvider";

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", terms: false, role: "JOBSEEKER" as "JOBSEEKER" | "EMPLOYER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
    if (!form.terms) return setError("กรุณายอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว");
    setLoading(true);
    try {
      const user = await register(form.email, form.password, form.name, form.role);
      if (user.role === "EMPLOYER") {
        window.location.assign(`${process.env.NEXT_PUBLIC_OWNER_URL ?? "http://localhost:3102"}/gate`);
        return;
      }
      router.replace("/gate");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-card">
    <h1 className="auth-title"><span className="text-blue">ผู้หางาน</span> <span className="text-navy">สมัครสมาชิก</span></h1>
    <p className="auth-lead">สร้างบัญชีเพื่อสมัครงานและสร้างโปรไฟล์ CyberJob</p>
    {error && <div className="error-message" role="alert">{error}</div>}
    <form onSubmit={submit}>
      <fieldset className="account-type"><legend>สมัครในฐานะ</legend><div><label className={form.role === "JOBSEEKER" ? "selected" : ""}><input type="radio" name="role" value="JOBSEEKER" checked={form.role === "JOBSEEKER"} onChange={() => setForm({ ...form, role: "JOBSEEKER" })} /><strong>คนทั่วไป</strong><span>ค้นหาและสมัครงาน</span></label><label className={form.role === "EMPLOYER" ? "selected" : ""}><input type="radio" name="role" value="EMPLOYER" checked={form.role === "EMPLOYER"} onChange={() => setForm({ ...form, role: "EMPLOYER" })} /><strong>ผู้ประกอบการ</strong><span>ประกาศงานและค้นหาผู้สมัคร</span></label></div></fieldset>
      <div className="input-group"><input className="auth-input" placeholder="ชื่อที่แสดง" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} /></div>
      <div className="input-group"><input className="auth-input" type="email" placeholder="อีเมล" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
      <div className="input-group"><input className="auth-input" type="password" placeholder="รหัสผ่านอย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} /></div>
      <div className="input-group"><input className="auth-input" type="password" placeholder="ยืนยันรหัสผ่าน" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required /></div>
      <label className="checkbox-group"><input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} /><span>ฉันยอมรับ <Link href="/terms" className="text-blue-link">ข้อกำหนดและเงื่อนไข</Link> และ <Link href="/privacy" className="text-blue-link">นโยบายความเป็นส่วนตัว</Link></span></label>
      <button className="auth-btn" disabled={loading}>{loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}</button>
    </form>
    <div className="auth-footer">มีบัญชีแล้ว? <Link href="/gate/login" className="auth-link-bold">เข้าสู่ระบบ</Link></div>
  </div>;
}
