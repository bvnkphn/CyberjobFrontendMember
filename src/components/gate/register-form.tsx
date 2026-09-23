"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { EyeIcon, EyeOffIcon } from "@/public-site/components/Icons";
import { AccountTabs, type AccountType } from "./account-tabs";

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
    role: "JOBSEEKER" as AccountType,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      return setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
    }
    if (!form.terms) {
      return setError("กรุณากดยอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว");
    }
    setLoading(true);
    try {
      const user = await register(form.email, form.password, form.name, form.role);
      if (user.role === "EMPLOYER") {
        window.location.assign("/gate-owner");
        return;
      }
      router.replace("/gate");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <AccountTabs value={form.role} onChange={(role) => setForm({ ...form, role })} />

      <div className="auth-card has-tabs">
        <h1 className="auth-title">
          <span className="text-blue">
            {form.role === "EMPLOYER" ? "ผู้ประกอบการ" : "ผู้หางาน"}
          </span>{" "}
          <span className="text-navy">สมัครสมาชิก</span>
        </h1>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="input-group">
            <input
              className="auth-input"
              placeholder="ชื่อผู้ใช้งาน"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
            />
          </div>

          <div className="input-group">
            <input
              className="auth-input"
              type="email"
              placeholder="อีเมล"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
            </button>
          </div>

          <div className="input-group">
            <input
              className="auth-input"
              type={showConfirm ? "text" : "password"}
              placeholder="ยืนยันรหัสผ่าน"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
              minLength={8}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={showConfirm ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
            </button>
          </div>

          <label className="checkbox-group">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.checked })}
            />
            <span>
              ฉันยอมรับ{" "}
              <Link href="/terms" className="text-blue-link">
                ข้อกำหนดการให้บริการ
              </Link>{" "}
              และ{" "}
              <Link href="/privacy" className="text-blue-link">
                นโยบายความเป็นส่วนตัวของ CyberJob
              </Link>
            </span>
          </label>

          <button className="auth-btn" disabled={loading}>
            {loading ? "กำลังดำเนินการ..." : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            มีบัญชี CyberJob อยู่แล้ว?{" "}
            <Link href="/gate/login" className="auth-link-bold">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
