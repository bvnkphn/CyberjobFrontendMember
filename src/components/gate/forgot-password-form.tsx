"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/member-api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message || "ระบบได้ส่งลิงก์ไปยังอีเมลของคุณแล้ว");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title text-navy">ลืมรหัสผ่าน</h1>
      
      <div className="text-center text-muted mb-6">
        <p className="font-bold mb-2 text-ink">ลืมรหัสผ่านใช่หรือไม่? ไม่มีปัญหา</p>
        <p className="text-sm">โปรดระบุอีเมลที่คุณใช้สมัครสมาชิก ระบบจะส่งลิงก์ไปยังอีเมลเพื่อให้คุณตั้งรหัสผ่านใหม่</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message p-3 bg-green-50 text-green-700 rounded-md mb-4 text-sm text-center">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="email"
            placeholder="อีเมล"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-btn" disabled={isLoading}>
          {isLoading ? "กำลังดำเนินการ..." : "ส่ง"}
        </button>
      </form>
    </div>
  );
}