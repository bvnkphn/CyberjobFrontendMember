"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { GateForm } from "@/components/gate/gate-form";

export default function GatePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "EMPLOYER") {
      router.replace("/gate-owner");
    }
  }, [user, router]);

  if (user?.role === "EMPLOYER") {
    return <main className="owner-auth-loading">กำลังนำคุณไปยังหน้าข้อมูลผู้ประกอบการ...</main>;
  }

  return <GateForm />;
}
