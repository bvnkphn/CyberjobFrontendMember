import { Navbar } from '@/public-site/components/Navbar';
import { LanguageProvider } from '@/public-site/i18n/LanguageProvider';

/** Compatibility wrapper: ทุกหน้า Member ใช้ Navbar ชุดเดียวกัน */
export function Header() {
  return (
    <LanguageProvider>
      <Navbar />
    </LanguageProvider>
  );
}
