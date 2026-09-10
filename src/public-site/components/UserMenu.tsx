'use client';

import Link from 'next/link';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { useDropdown } from '@/public-site/lib/useDropdown';
import { BriefcaseIcon, EyeIcon, MailIcon, PencilIcon, UserIcon } from './Icons';
import { useAuth } from '@/public-site/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { open, toggle, setOpen, ref } = useDropdown();
  const items = [
    { key: 'user.profile', href: '/profile', icon: UserIcon },
    { key: 'user.editProfile', href: '/profile/edit', icon: PencilIcon },
    { key: 'user.previewResume', href: '/profile/preview', icon: EyeIcon },
    { key: 'user.myJobs', href: '/my-jobs', icon: BriefcaseIcon },
    { key: 'user.invitations', href: '/invitations', icon: MailIcon },
  ] as const;

  if (loading) return <span className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />;
  // ผู้ที่ยังไม่ล็อกอินเห็นเฉพาะปุ่มเข้าสู่ระบบ – ลิงก์สมัครสมาชิกอยู่ในหน้าเข้าสู่ระบบแล้ว
  if (!user) return <Link href="/gate/login" className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700">{t('auth.login')}</Link>;

  return (
    <div ref={ref} className="relative">
      {/* แสดงเฉพาะไอคอน – ชื่อเมนูอยู่ใน aria-label เพื่อให้ screen reader ยังอ่านได้ */}
      <button type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-label={t('user.account')} title={t('user.account')} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50">
        <UserIcon width={20} height={20} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-pop">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-brand-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          {items.map(({ key, href, icon: Icon }) => (
            <Link key={key} href={href} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50">
              <Icon width={18} height={18} className="text-slate-400" />
              {t(key)}
            </Link>
          ))}
          <button type="button" role="menuitem" onClick={async () => { setOpen(false); await logout(); router.replace('/'); router.refresh(); }} className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">{t('user.logout')}</button>
        </div>
      )}
    </div>
  );
}
