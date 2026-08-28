'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { ChevronDownIcon, GlobeIcon } from './Icons';

/** ปุ่มสลับภาษาบน Nav bar – ภาษาไทย / English */
export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const options: { value: 'th' | 'en'; label: string }[] = [
    { value: 'th', label: t('lang.th') },
    { value: 'en', label: t('lang.en') },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
          dark
            ? 'text-white/90 hover:bg-white/10'
            : 'text-slate-600 hover:bg-slate-100 hover:text-brand-700'
        }`}
      >
        <GlobeIcon width={18} height={18} />
        <span>{t('lang.current')}</span>
        <ChevronDownIcon
          width={16}
          height={16}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-pop"
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={lang === opt.value}
                onClick={() => {
                  setLang(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors ${
                  lang === opt.value
                    ? 'bg-brand-50 font-semibold text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

