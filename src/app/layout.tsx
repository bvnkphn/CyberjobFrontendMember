import type { Metadata } from "next";
import "./public-site.css";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/public-site/auth/AuthProvider";
import { LanguageProvider as PublicLanguageProvider } from "@/public-site/i18n/LanguageProvider";
import { AccessControl } from "@/components/access-control";
import { SiteLayout } from "@/components/site-layout";

export const metadata: Metadata = {
  title: "CyberJob – ค้นหาอนาคตของคุณ",
  description: "แพลตฟอร์มหางานที่เชื่อมต่อคนทำงานกับองค์กรชั้นนำ ค้นหางาน ฝากประวัติ และสมัครงานได้ในที่เดียว",
};

// Hostinger hCDN otherwise keeps prerendered HTML for up to one year.
// Render route documents per request so a deployment can never mix old HTML
// with JavaScript/CSS chunks from a newer release. Hashed static assets remain
// cacheable by Next.js as usual.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <PublicLanguageProvider>
          <AuthProvider>
            <LanguageProvider>
              <SiteLayout>
                <AccessControl>{children}</AccessControl>
              </SiteLayout>
            </LanguageProvider>
          </AuthProvider>
        </PublicLanguageProvider>
      </body>
    </html>
  );
}
