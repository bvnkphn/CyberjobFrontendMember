'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { DICT, type DictKey, type Lang } from './dictionary';

const STORAGE_KEY = 'cyberjob.lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** t('jobs.resultCount', { n: 12 }) */
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  /** เลือกป้ายกำกับจาก FilterOption ของ @cyberjob/shared */
  label: (option: { labelTh: string; labelEn: string }) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // เริ่มที่ 'th' เสมอ เพื่อให้ผลลัพธ์ฝั่ง server กับ client ตรงกันตอน hydrate
  const [lang, setLangState] = useState<Lang>('th');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('cyberjob_owner_language');
    if (saved === 'en' || saved === 'th') setLangState(saved);

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<Lang>;
      if (customEvent.detail === 'en' || customEvent.detail === 'th') {
        setLangState(customEvent.detail);
      } else {
        const nextSaved = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('cyberjob_owner_language');
        if (nextSaved === 'en' || nextSaved === 'th') setLangState(nextSaved);
      }
    };
    window.addEventListener('cyberjob:lang', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cyberjob:lang', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      window.localStorage.setItem('cyberjob_owner_language', next);
      window.localStorage.setItem('cyberjobLocale', next);
      window.dispatchEvent(new CustomEvent('cyberjob:lang', { detail: next }));
    } catch {
      /* โหมดส่วนตัวของเบราว์เซอร์อาจปิด storage ไว้ */
    }
  }, []);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => {
      const raw: string = DICT[lang][key] ?? DICT.th[key] ?? String(key);
      if (!vars) return raw;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
        raw,
      );
    },
    [lang],
  );

  const label = useCallback(
    (option: { labelTh: string; labelEn: string }) =>
      lang === 'en' ? option.labelEn : option.labelTh,
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, t, label }),
    [lang, setLang, t, label],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n ต้องอยู่ภายใต้ <LanguageProvider>');
  return ctx;
}

