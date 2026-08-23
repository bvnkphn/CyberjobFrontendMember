"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/member-api";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("ลิงก์กู้คืนรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("รหัสผ่านไม่ตรงกัน");
    }

    // Regex เช็คความปลอดภัย (ตัวพิมพ์ใหญ่ เล็ก และตัวเลข ยาว 8 ตัว)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError("รหัสผ่านต้องมีความยาว 8 อักษรและมีทั้งพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข");
    }

    setIsLoading(true);
    try {
      await resetPassword(token, formData.password);
      setSuccess(true);
      setTimeout(() => router.push("/gate/login"), 3000);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-card text-center">
        <h2 className="text-xl font-bold text-navy mb-4">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
        <p className="text-muted">ระบบกำลังพากลับไปยังหน้าเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title text-navy">ตั้งค่ารหัสผ่านใหม่</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group-with-helper">
          <div className="input-group mb-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่านใหม่ *"
              className="auth-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={!token}
            />
            <button type="button" className="icon-btn" onClick={() => setShowPassword(!showPassword)}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <p className="input-helper">กรุณาระบุรหัสผ่านใหม่ที่ต้องการ</p>
        </div>

        <div className="input-group-with-helper">
          <div className="input-group mb-1">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="ยืนยันรหัสผ่าน *"
              className="auth-input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={!token}
            />
            <button type="button" className="icon-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <p className="input-helper">รหัสของคุณต้องมีความยาว 8 อักษรและมีทั้งพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข</p>
        </div>

        <button type="submit" className="auth-btn mt-6" disabled={isLoading || !token}>
          {isLoading ? "กำลังดำเนินการ..." : "ยืนยัน"}
        </button>
      </form>
    </div>
  );
}