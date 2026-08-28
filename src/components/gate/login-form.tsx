"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/public-site/auth/AuthProvider";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-card">
    <h1 className="auth-title text-navy">เข้าสู่ระบบ</h1>
    <p className="auth-lead">เข้าสู่ระบบเพื่อสมัครงาน บันทึกงาน และจัดการโปรไฟล์ของคุณ</p>
    {error && <div className="error-message" role="alert">{error}</div>}
    <form onSubmit={submit}>
      <div className="input-group"><input className="auth-input" type="email" autoComplete="email" placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div className="input-group"><input className="auth-input" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="รหัสผ่าน" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" className="icon-btn" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} onClick={() => setShowPassword((v) => !v)}>{showPassword ? "ซ่อน" : "ดู"}</button></div>
      <button className="auth-btn" disabled={loading}>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
    </form>
    <div className="auth-footer"><p>ยังไม่มีบัญชี? <Link href="/gate/register" className="auth-link-bold">สมัครสมาชิก</Link></p></div>
  </div>;
}
