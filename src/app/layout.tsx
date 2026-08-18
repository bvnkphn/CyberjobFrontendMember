import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberJob Member",
  description: "พื้นที่สมาชิกสำหรับจัดการประวัติและสมัครงาน",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
