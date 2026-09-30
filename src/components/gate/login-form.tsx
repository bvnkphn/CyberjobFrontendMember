"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { EyeIcon, EyeOffIcon } from "@/public-site/components/Icons";
import { AccountTabs, type AccountType } from "./account-tabs";
import { GoogleButton } from "./google-button";

export default function LoginForm() {
  const { login, verifyOtp, resendOtp } = useAuth();
  const router = useRouter();

  // สถานะขั้นตอน: 'credentials' (กรอกอีเมล/รหัสผ่าน) หรือ 'otp' (ยืนยัน OTP 2FA)
  const [step, setStep] = useState<"credentials" | "otp">("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("JOBSEEKER");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // กล่อง OTP 6 ช่อง
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ระบบนับถอยหลังการส่ง OTP ซ้ำ (60 วินาที)
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (step !== "otp") return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [step, countdown]);

  // เลื่อน focus ไปช่องแรกเมื่อเปลี่ยนมาหน้า OTP
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  function redirectAfterLogin(role: string) {
    const next = new URLSearchParams(window.location.search).get("next");
    if (role === "EMPLOYER") {
      window.location.assign(next || "/dashboard");
    } else {
      router.replace(next || "/");
      router.refresh();
    }
  }

  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const res = await login(email, password);

      if ("requireOtp" in res && res.requireOtp) {
        setMaskedEmail(res.maskedEmail || email);
        setStep("otp");
        setCountdown(60);
        setCanResend(false);
        setOtp(new Array(6).fill(""));
        setInfoMessage(res.message || "กรุณากรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ");
      } else if ("user" in res) {
        redirectAfterLogin(res.user.role);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  }

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // เลื่อน focus ไปยังช่องถัดไป
    if (index < 5 && value) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  async function submitOtp(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      return setError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
    }

    setLoading(true);
    try {
      const user = await verifyOtp(email, otpCode);
      redirectAfterLogin(user.role);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!canResend) return;
    setError("");
    try {
      await resendOtp(email);
      setCountdown(60);
      setCanResend(false);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setInfoMessage("ส่งรหัส OTP ใหม่เรียบร้อยแล้ว");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ไม่สามารถส่งรหัสซ้ำได้ กรุณาลองใหม่");
    }
  }

  function handleBackToLogin() {
    setStep("credentials");
    setError("");
    setInfoMessage("");
    setOtp(new Array(6).fill(""));
  }

  return (
    <div className="login-container">
      {step === "credentials" && (
        <AccountTabs value={accountType} onChange={setAccountType} />
      )}

      <div className={`auth-card ${step === "credentials" ? "has-tabs" : ""}`}>
        {step === "credentials" ? (
          <>
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

            <form onSubmit={submitCredentials}>
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

            <GoogleButton accountType={accountType} onError={setError} />

            <div className="auth-footer">
              <p>
                เป็นสมาชิก CYBERJOB?{" "}
                <Link href="/gate/register" className="auth-link-bold">
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="auth-title">
              <span className="text-navy">ยืนยันรหัส</span>{" "}
              <span className="text-blue">OTP (2FA)</span>
            </h1>

            <p className="text-center text-muted mb-6">
              ระบบได้ส่งรหัส OTP 6 หลัก ไปที่อีเมล<br />
              <strong>{maskedEmail || email}</strong>
            </p>

            {infoMessage && !error && (
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#1e40af",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                {infoMessage}
              </div>
            )}

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={submitOtp}>
              {/* กล่องกรอก OTP 6 ช่อง */}
              <div className="otp-container">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-box"
                    value={data}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="auth-btn"
                disabled={loading || otp.join("").length !== 6}
              >
                {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัสเข้าสู่ระบบ"}
              </button>
            </form>

            <div className="auth-footer mt-6" style={{ textAlign: "center" }}>
              {canResend ? (
                <p>
                  ไม่ได้รับรหัส?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-blue font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    ส่งรหัส OTP อีกครั้ง
                  </button>
                </p>
              ) : (
                <p>
                  ส่งรหัสใหม่อีกครั้งใน <strong className="text-navy">{countdown}</strong> วินาที
                </p>
              )}

              <div style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="bg-transparent border-none cursor-pointer text-muted hover:underline"
                  style={{ fontSize: "14px" }}
                >
                  ← เปลี่ยนอีเมล / ย้อนกลับ
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
