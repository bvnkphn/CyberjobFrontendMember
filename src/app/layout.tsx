import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";

export const metadata: Metadata = {
  title: "CyberJob Member",
  description: "พื้นที่สมาชิกสำหรับจัดการประวัติและสมัครงาน",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body><LanguageProvider>{children}</LanguageProvider></body></html>;
}
