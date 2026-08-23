"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/member-api";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginForm() {
  const router = useRouter();
  
  // สถานะ Tab: "USER" (หางาน) หรือ "COMPANY" (หาคน)
  const [activeTab, setActiveTab] = useState<"USER" | "COMPANY">("USER");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 1. ฟังก์ชันจัดการล็อกอินด้วย Email & Password แบบปกติ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push("/"); 
      router.refresh();
    } catch (err: any) {
      setError(err.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. ฟังก์ชันจัดการล็อกอินด้วย Google
  const loginWithGoogle = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
      try {
        setError("");
        setIsLoading(true);
        
        // ส่ง Token ไปให้ Backend จัดการต่อ
        // สมมติว่าใน member-api.ts ของคุณมีฟังก์ชัน loginWithGoogle API เตรียมไว้แล้ว
        // import { loginWithGoogleApi } from "@/lib/member-api"; 
        
        // await loginWithGoogleApi(tokenResponse.access_token, activeTab);
        
        // ถ้า Backend ตอบกลับว่าผ่าน ค่อยเปลี่ยนหน้าไปหน้าแรก
        router.push("/");
        router.refresh(); 

      } catch (err: any) {
        setError(err.message || "ล็อกอินด้วย Google ไม่สำเร็จ");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("ยกเลิกการเข้าสู่ระบบด้วย Google"),
  });

  return (
    <div className="login-container">
      {/* Tabs หางาน / หาคน */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${activeTab === "USER" ? "active" : ""}`}
          onClick={() => setActiveTab("USER")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          หางาน
        </button>
        <button
          type="button"
          className={`auth-tab ${activeTab === "COMPANY" ? "active" : ""}`}
          onClick={() => setActiveTab("COMPANY")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          หาคน
        </button>
      </div>

      <div className="auth-card has-tabs">
        <h1 className="auth-title text-navy">
          {activeTab === "USER" ? "เข้าสู่ระบบสำหรับผู้สมัครงาน" : "เข้าสู่ระบบสำหรับผู้ประกอบการ"}
        </h1>

        {error && <div className="error-message">{error}</div>}

        {/* ฟอร์มล็อกอินปกติ */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="อีเมล"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
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
              disabled={isLoading}
            />
            <button type="button" className="icon-btn" onClick={() => setShowPassword(!showPassword)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "กำลังดำเนินการ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="divider">
          <span>หรือ</span>
        </div>

        {/* ปุ่ม Google Login */}
        <button 
          type="button" 
          className="google-btn" 
          onClick={() => loginWithGoogle()}
          disabled={isLoading}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
          เข้าสู่ระบบด้วยบัญชี Google
        </button>

        <div className="auth-footer mt-6 flex-col-center gap-4">
          <Link href="/gate/forgot-password" className="text-muted hover:underline">
            ลืมรหัสผ่าน?
          </Link>
          <div>
            เป็นสมาชิก CYBERJOB? <Link href="/gate/register" className="auth-link-bold">สมัครสมาชิก</Link>
          </div>
        </div>
      </div>
    </div>
  );
}