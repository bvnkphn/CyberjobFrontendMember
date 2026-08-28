'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/public-site/auth/AuthProvider';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { useDropdown } from '@/public-site/lib/useDropdown';
import {
  BriefcaseIcon,
  EyeIcon,
  LogoutIcon,
  MailIcon,
  PencilIcon,
  UserIcon,
} from './Icons';

/** เมนูผู้ใช้บน Nav bar (ตาม Frame 9441 ในไฟล์ Figma) */
export function UserMenu() {
  const { t } = useI18n();
  const { user, loading, logout } = useAuth();
  const { open, toggle, setOpen, ref } = useDropdown();
  const router = useRouter();
  const pathname = usePathname();

  // ยังไม่ล็อกอิน → ปุ่มเข้าสู่ระบบ
  if (!loading && !user) {
    return (
      <Link
        href={`/gate/login?redirect=${encodeURIComponent(pathname)}`}
        className="btn-outline px-4 py-2 text-sm"
      >
        <UserIcon width={17} height={17} />
        <span className="hidden sm:inline">{t('auth.login')}</span>
      </Link>
    );
  }

  const items = [
    { key: 'user.profile', href: '/profile', icon: UserIcon },
    { key: 'user.editProfile', href: '/profile/edit', icon: PencilIcon },
    { key: 'user.previewResume', href: '/profile/preview', icon: EyeIcon },
    { key: 'user.myJobs', href: '/my-jobs', icon: BriefcaseIcon },
    { key: 'user.invitations', href: '/invitations', icon: MailIcon },
  ] as const;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('user.account')}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
      >
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserIcon width={20} height={20} />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-pop"
        >
          {user && (
            <div className="border-b border-slate-100 px-4 pb-2.5 pt-1.5">
              <p className="truncate text-sm font-semibold text-brand-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          )}

          {items.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Icon width={18} height={18} className="text-slate-400" />
              {t(key)}
            </Link>
          ))}

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              router.push('/');
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogoutIcon width={18} height={18} />
            {t('user.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
