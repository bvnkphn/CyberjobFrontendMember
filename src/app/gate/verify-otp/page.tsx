import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import OtpForm from "@/components/gate/otp-form";

export default function VerifyOtpPage() {
  return (
    <div className="site-shell">
        <Header />
    <main className="auth-container">
      {/* Suspense ป้องกัน Error ตอน Build เมื่อใช้ useSearchParams */}
      <Suspense fallback={<div className="auth-card">กำลังโหลด...</div>}>
        <OtpForm />
      </Suspense>
    </main>
    <Footer />
    </div>
  );
}