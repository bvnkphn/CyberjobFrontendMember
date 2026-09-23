"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { EyeIcon, EyeOffIcon } from "@/public-site/components/Icons";
import { AccountTabs, type AccountType } from "./account-tabs";
import { GoogleButton } from "./google-button";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("JOBSEEKER");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "EMPLOYER") {
        const next = new URLSearchParams(window.location.search).get("next");
        window.location.assign(next || "/dashboard");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <AccountTabs value={accountType} onChange={setAccountType} />

      <div className="auth-card has-tabs">
        <h1 className="auth-title">
          <span className="text-blue">
            {accountType === "EMPLOYER" ? "ผู้ประกอบการ" : "ผู้หางาน"}
          </span>{" "}
          <span className="text-navy">เข้าสู่ระบบ</span>
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
              type="email"
              autoComplete="email"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          <button className="auth-btn" disabled={loading}>
            {loading ? "กำลังดำเนินการ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <GoogleButton />

        <div className="auth-footer">
          <p>
            เป็นสมาชิก CYBERJOB?{" "}
            <Link href="/gate/register" className="auth-link-bold">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
