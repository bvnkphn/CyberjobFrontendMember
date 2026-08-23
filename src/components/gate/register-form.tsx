"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/member-api"; 

export default function RegisterForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
    }
    if (!formData.termsAccepted) {
      return setError("กรุณากดยอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว");
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "USER", 
        termsAccepted: formData.termsAccepted,
      });
      router.push(`/gate/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">
        {/* 🌟 เปลี่ยนเป็นภาษาไทย */}
        <span className="text-blue">ผู้หางาน</span> <span className="text-navy">สมัครสมาชิก</span>
      </h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* 🌟 เปลี่ยน placeholder เป็นภาษาไทย */}
          <input
            type="text"
            name="username"
            placeholder="ชื่อผู้ใช้งาน"
            className="auth-input"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="อีเมล"
            className="auth-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="รหัสผ่าน"
            className="auth-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="button" className="icon-btn" onClick={() => setShowPassword(!showPassword)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>

        <div className="input-group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="ยืนยันรหัสผ่าน"
            className="auth-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="button" className="icon-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="termsAccepted"
            id="terms"
            checked={formData.termsAccepted}
            onChange={handleChange}
          />
          <label htmlFor="terms">
            {/* 🌟 เปลี่ยนข้อความเป็นภาษาไทย */}
            ฉันยอมรับ <Link href="/terms" className="text-blue-link">ข้อกำหนดและเงื่อนไข</Link> และ <Link href="/privacy" className="text-blue-link">นโยบายความเป็นส่วนตัวของ CyberJob</Link>
          </label>
        </div>

        <button type="submit" className="auth-btn" disabled={isLoading}>
          {isLoading ? "กำลังดำเนินการ..." : "สมัครสมาชิก"}
        </button>
      </form>

      <div className="auth-footer">
        มีบัญชี CyberJob อยู่แล้ว? <Link href="/gate/login" className="auth-link-bold">เข้าสู่ระบบ</Link>
      </div>
    </div>
  );
}