"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp, resendOtp } from "@/lib/member-api"; // นำเข้า resendOtp ด้วย

export default function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  // ใช้ Array เก็บค่า OTP 6 ช่อง
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ระบบนับถอยหลัง
  const [countdown, setCountdown] = useState(60); // เริ่มที่ 60 วินาที
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) router.push("/gate/register");
  }, [email, router]);

  // ตัวจับเวลา
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // จัดการเมื่อพิมพ์ตัวเลขแต่ละช่อง
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, ""); // รับเฉพาะตัวเลข
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // เอาเฉพาะตัวสุดท้ายที่พิมพ์
    setOtp(newOtp);

    // เลื่อน focus ไปช่องถัดไป
    if (index < 5 && value) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // จัดการเมื่อกดปุ่ม Backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        // ถ้าช่องปัจจุบันมีค่า ให้ลบช่องปัจจุบัน
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // ถ้าช่องปัจจุบันว่าง ให้ถอยไปลบช่องก่อนหน้า และเลื่อน focus
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // จัดการเมื่อผู้ใช้กด Paste (วางรหัส 6 หลักที่ก๊อปมา)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      // เลื่อน focus ไปช่องสุดท้ายที่มีการวาง
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setError("");
      // เรียก API ส่ง OTP ใหม่
      await resendOtp(email); 
      setCountdown(60); // รีเซ็ตเวลา
      setCanResend(false);
      setOtp(new Array(6).fill("")); // ล้างช่องกรอก
      inputRefs.current[0]?.focus(); // เด้งไปช่องแรก
    } catch (err: any) {
      setError(err.message || "ไม่สามารถส่งรหัสซ้ำได้ กรุณาลองใหม่");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join(""); // แปลง Array 6 ช่องเป็น String ติดกัน
    if (otpString.length !== 6) {
      return setError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
    }

    setIsLoading(true);
    try {
      await verifyOtp(email, otpString);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "รหัส OTP ไม่ถูกต้อง");
    } finally {
      setIsLoading(false);
    }
  };

  // หน้าต่างต้อนรับ (Success)
  if (isSuccess) {
    return (
      <div className="auth-card flex-col-center">
        <div className="success-icon-wrap">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00d477" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="success-title">ยินดีต้อนรับ! 🎉</h2>
        <p className="success-subtitle text-center">
          สมัครสมาชิกเรียบร้อยแล้ว<br />
          พร้อมเริ่มเขียนเรซูเม่กันเลย
        </p>
        <button className="auth-btn mt-6" onClick={() => router.push("/profile/edit")}>
          เริ่มต้นใช้งาน
        </button>
      </div>
    );
  }

  // หน้าต่างฟอร์มกรอก OTP
  return (
    <div className="auth-card">
      <h1 className="auth-title">
        <span className="text-navy">ยืนยันรหัส</span> <span className="text-blue">OTP</span>
      </h1>
      <p className="text-center text-muted mb-6">
        ระบบได้ส่งรหัส 6 หลัก ไปที่อีเมล<br />
        <strong>{email}</strong>
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
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
              ref={(el) => { inputRefs.current[index] = el; }} // เก็บ ref เพื่อใช้ focus
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <button type="submit" className="auth-btn" disabled={isLoading || otp.join("").length !== 6}>
          {isLoading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
        </button>
      </form>

      {/* ส่วนนับถอยหลัง / ส่งรหัสอีกครั้ง */}
      <div className="auth-footer mt-6">
        {canResend ? (
          <p>
            ไม่ได้รับรหัส?{" "}
            <button type="button" onClick={handleResend} className="text-blue font-bold hover:underline bg-transparent border-none cursor-pointer p-0">
              ส่งรหัส OTP อีกครั้ง
            </button>
          </p>
        ) : (
          <p>
            ส่งรหัสใหม่อีกครั้งใน <strong className="text-navy">{countdown}</strong> วินาที
          </p>
        )}
      </div>
    </div>
  );
}