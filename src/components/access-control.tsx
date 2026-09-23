"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/public-site/auth/AuthProvider";
import { isOwnerRoute } from "@/lib/owner";

const PUBLIC_PREFIXES = [
  "/jobs",
  "/gate/login",
  "/gate/register",
  "/terms",
  "/privacy",
  "/security",
];

export function AccessControl({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isOwner = isOwnerRoute(pathname);
  const isPublic = pathname === "/" || PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isAuthPage = pathname === "/gate/login" || pathname === "/gate/register";

  useEffect(() => {
    if (isOwner) return;
    if (loading) return;
    if (user?.role === "EMPLOYER") return;
    if (!user && !isPublic) {
      const search = typeof window === "undefined" ? "" : window.location.search;
      router.replace(`/gate/login?next=${encodeURIComponent(`${pathname}${search}`)}`);
      return;
    }
    if (user && !user.gateCompleted && pathname !== "/gate") {
      router.replace("/gate");
      return;
    }
    if (user?.gateCompleted && (pathname === "/gate" || isAuthPage)) {
      const next = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/");
    }
  }, [isAuthPage, isOwner, isPublic, loading, pathname, router, user]);

  if (isOwner) return <>{children}</>;
  if (user?.role === "EMPLOYER") return <>{children}</>;

  // หน้า Public ต้องเปิดดูได้ทันที แม้ Backend กำลังเริ่มระบบหรือใช้งานไม่ได้ชั่วคราว
  if (loading && !isPublic) return <main className="member-route-loading">กำลังตรวจสอบบัญชี...</main>;
  if ((!user && !isPublic) || (user && !user.gateCompleted && pathname !== "/gate")) return <main className="member-route-loading">กำลังนำคุณไปยังหน้าที่ถูกต้อง...</main>;
  return children;
}

