import type { Metadata } from "next";
import "./public-site.css";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  title: "CyberJob – ค้นหาอนาคตของคุณ",
  description: "แพลตฟอร์มหางานที่เชื่อมต่อคนทำงานกับองค์กรชั้นนำ ค้นหางาน ฝากประวัติ และสมัครงานได้ในที่เดียว",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <GoogleOAuthProvider clientId="157609580604-j0rkn61h4av0i49osj0ml9edn32be9el.apps.googleusercontent.com">
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
