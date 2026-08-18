"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureDemoSession, hasAccessToken } from "@/lib/member-api";

export function MemberRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureDemoSession().finally(() => {
      if (hasAccessToken()) setReady(true);
      else router.replace("/register");
    });
  }, [router]);

  if (!ready) return <main className="member-route-loading" aria-live="polite">กำลังตรวจสอบสมาชิก...</main>;
  return children;
}
