"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  translations,
  type Language,
  type LanguageKey,
} from "./translations";

export type { Language, LanguageKey };

type TranslateVars = Record<string, string | number>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  isEn: boolean;
  /** แทนที่ตัวยึด {name} ในข้อความได้ เช่น t("candidates.countLabel", { count: 12 }) */
  t: (key: LanguageKey, vars?: TranslateVars) => string;
}

const STORAGE_KEY = "cyberjob_owner_language";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function fill(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // เริ่มที่ "th" เสมอให้ตรงกับที่ render มาจากเซิร์ฟเวอร์ แล้วค่อยอ่านค่าที่จำไว้หลัง mount
  const [language, setLanguageState] = useState<Language>("th");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "th") setLanguageState(saved);
    } catch {
      // โหมดส่วนตัวของเบราว์เซอร์อาจปิด storage ไว้
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // เปลี่ยนภาษาได้ตามปกติ แค่จำไว้ข้ามหน้าไม่ได้
    }
  };

  const isEn = language === "en";

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      isEn,
      t: (key, vars) => fill(translations[language][key] ?? key, vars),
    }),
    [language, isEn],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
