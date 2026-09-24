import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell/AdminShell";
import { AdminAuthProvider } from "@/lib/admin/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberJob Admin",
  description: "ระบบหลังบ้านสำหรับผู้ดูแลระบบ CyberJob",
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
