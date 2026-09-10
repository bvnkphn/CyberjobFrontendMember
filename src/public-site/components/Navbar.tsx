'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import type { DictKey } from '@/public-site/i18n/dictionary';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { CloseIcon } from './Icons';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/public-site/auth/AuthProvider';

/** เมนูหลักตาม Feature 3.4 – มีอยู่ทุกหน้า */
const NAV_ITEMS: { key: DictKey; href: string; activePrefixes?: string[]; requiresAuth?: boolean }[] = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.jobs', href: '/jobs', activePrefixes: ['/jobs'] },
  { key: 'nav.resume', href: '/profile/edit', activePrefixes: ['/profile'], requiresAuth: true },
  { key: 'nav.articles', href: '/articles', activePrefixes: ['/articles'], requiresAuth: true },
  { key: 'nav.about', href: '/about', activePrefixes: ['/about'], requiresAuth: true },
  { key: 'nav.contact', href: '/contact', activePrefixes: ['/contact'], requiresAuth: true },
];

export function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleItems = loading ? [] : NAV_ITEMS.filter((item) => !item.requiresAuth || user);

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.href === '/' ? pathname === '/' : (item.activePrefixes ?? [item.href]).some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    // ข้อความใน Nav bar มาจากพจนานุกรมของ public-site อยู่แล้ว
    // จึงกันไม่ให้ตัวแปลแบบแทนที่ข้อความเข้ามาแปลซ้ำจนคำเพี้ยน
    // (เช่น aria-label ของปุ่มภาษาเคยกลายเป็น "สลับLanguage Thai / อังกฤษ")
    <header data-no-translate className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center gap-4">
        <Logo />

        {/* ดันเมนูไปชิดขวาให้อยู่ติดกับปุ่มเปลี่ยนภาษา */}
        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item) ? 'page' : undefined}
                className={`relative block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item)
                    ? 'text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'
                }`}
              >
                {t(item.key)}
                {/* ขีดใต้เป็น absolute เพื่อไม่ให้ดันข้อความของเมนูที่เลือกอยู่ให้สูงกว่าตัวอื่น */}
                {isActive(item) && (
                  <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-accent-500" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            aria-label={t('nav.menu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {mobileOpen ? (
              <CloseIcon width={22} height={22} />
            ) : (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
          <UserMenu />
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <ul className="container-page flex flex-col py-2">
            {visibleItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item) ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(item)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <li className="px-1 pt-2 sm:hidden">
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
