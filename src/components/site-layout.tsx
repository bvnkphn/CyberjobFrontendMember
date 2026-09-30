"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from '@/public-site/components/Navbar';
import { Footer } from '@/public-site/components/Footer';
import { isOwnerRoute } from '@/lib/owner';

/**
 * โครงหลักสำหรับ Member app
 * สำหรับ Owner routes จะข้าม Navbar/Footer ของ Member เพื่อให้ Owner AppShell ทำงานสมบูรณ์
 */
export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isOwnerRoute(pathname) || isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}

