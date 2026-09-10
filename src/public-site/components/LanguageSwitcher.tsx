'use client';

import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { GlobeIcon } from './Icons';

/**
 * ปุ่มสลับภาษาบน Nav bar – ไทย / English
 * มีสองภาษาจึงเป็นปุ่มกดเดียว กดครั้งเดียวสลับได้ทันทีโดยไม่ต้องเปิดเมนู
 */
export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang, t } = useI18n();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
      aria-label={t('lang.toggle')}
      title={t('lang.toggle')}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
        dark
          ? 'text-white/90 hover:bg-white/10'
          : 'text-slate-600 hover:bg-slate-100 hover:text-brand-700'
      }`}
    >
      <GlobeIcon width={18} height={18} />
      <span>{t('lang.current')}</span>
    </button>
  );
}
