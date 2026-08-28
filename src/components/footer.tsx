import { Footer as PublicFooter } from '@/public-site/components/Footer';
import { LanguageProvider } from '@/public-site/i18n/LanguageProvider';

/** Compatibility wrapper: ทุกหน้า Member ใช้ Footer ชุดเดียวกับหน้าแรก */
export function Footer() {
  return (
    <LanguageProvider>
      <PublicFooter />
    </LanguageProvider>
  );
}
