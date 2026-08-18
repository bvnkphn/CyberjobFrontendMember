"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getProfile, login, register } from "@/lib/member-api";
import "./auth.css";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isLogin = mode === "login";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (!isLogin && password !== confirmPassword) { setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน"); return; }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        try {
          const profile = await getProfile();
          router.replace(profile.completion > 0 ? "/profile/preview" : "/profile/edit");
        } catch { router.replace("/profile/edit"); }
      } else {
        await register(email, password);
        router.replace("/gate");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ไม่สามารถดำเนินการได้ กรุณาลองใหม่");
    } finally { setSubmitting(false); }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header><span>{isLogin ? "ยินดีต้อนรับกลับ" : "เริ่มต้นใช้งาน CyberJob"}</span><h1>{isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</h1><p>{isLogin ? "เข้าสู่ระบบเพื่อจัดการ Resume และการสมัครงาน" : "สร้างบัญชีเพื่อฝากประวัติและค้นหาโอกาสงานที่เหมาะกับคุณ"}</p></header>

        <form onSubmit={submit}>
          <label><span>อีเมล</span><input name="email" type="email" autoComplete="email" placeholder="กรอกอีเมล" required /></label>
          <label><span>รหัสผ่าน</span><div className="password-input"><input name="password" type={showPassword ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} placeholder="อย่างน้อย 8 ตัวอักษร" minLength={8} required /><button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? "ซ่อน" : "แสดง"}</button></div></label>
          {!isLogin && <label><span>ยืนยันรหัสผ่าน</span><input name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="กรอกรหัสผ่านอีกครั้ง" minLength={8} required /></label>}
          {isLogin ? <div className="auth-options"><label><input type="checkbox" /> จดจำฉัน</label><Link href="/forgot-password">ลืมรหัสผ่าน?</Link></div> : <label className="auth-consent"><input type="checkbox" required /> ฉันยอมรับ <Link href="/terms">ข้อกำหนดการใช้งาน</Link> และ <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={submitting}>{submitting ? "กำลังดำเนินการ..." : isLogin ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</button>
        </form>

        <footer>{isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"} <Link href={isLogin ? "/register" : "/login"}>{isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</Link></footer>
      </section>
    </main>
  );
}
