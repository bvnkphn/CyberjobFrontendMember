import type { Metadata } from "next";
import "./public-site.css";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";

export const metadata: Metadata = {
  title: "CyberJob – ค้นหาอนาคตของคุณ",
  description: "แพลตฟอร์มหางานที่เชื่อมต่อคนทำงานกับองค์กรชั้นนำ ค้นหางาน ฝากประวัติ และสมัครงานได้ในที่เดียว",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
