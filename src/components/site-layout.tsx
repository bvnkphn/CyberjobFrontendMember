import { Navbar } from '@/public-site/components/Navbar';
import { Footer } from '@/public-site/components/Footer';

/**
 * โครงหลักเพียงจุดเดียวของ Member app
 * ทุก route จึงใช้ Navbar และ Footer instance เดียวกันโดยไม่ต้องประกอบเองใน page
 */
export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
