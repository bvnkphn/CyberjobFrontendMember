'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/public-site/auth/AuthProvider';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { authService } from '@/public-site/services/auth.service';
import { ApiError } from '@/public-site/lib/api';
import { Logo } from '@/public-site/components/Logo';

/** ฟอร์มเข้าสู่ระบบ / สมัครสมาชิก (ใช้ร่วมกันสองหน้า) */
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { user, login, register } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // AccessControl และปุ่มสมัครงานส่งปลายทางมาใน `next`;
  // รองรับ `redirect` เดิมไว้เพื่อไม่ทำให้ลิงก์เก่าเสีย
  const redirectTo = params.get('next') || params.get('redirect') || '/';

  // ล็อกอินอยู่แล้วก็ไม่ต้องเห็นหน้านี้
  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, redirectTo, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        const res = await login(form.email, form.password);
        if ('requireOtp' in res) {
          router.replace(`/gate/login?email=${encodeURIComponent(form.email)}`);
          return;
        }
      } else {
        await register(form.email, form.password, form.name);
      }
      router.replace(redirectTo);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t('auth.failed'),
      );
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <div className="bg-slate-50">
      <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
          <div className="mb-6 text-center">
            <Logo className="justify-center" />
            <h1 className="mt-4 text-xl font-bold">
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  {t('auth.name')}
                </span>
                <input
                  required
                  minLength={2}
                  autoComplete="name"
                  className="field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                {t('auth.email')}
              </span>
              <input
                required
                type="email"
                autoComplete="email"
                className="field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                {t('auth.password')}
              </span>
              <input
                required
                type="password"
                minLength={isLogin ? 1 : 8}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {!isLogin && (
                <span className="mt-1 block text-[11px] text-slate-400">
                  {t('auth.passwordHint')}
                </span>
              )}
            </label>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-brand w-full">
              {busy
                ? t('auth.working')
                : isLogin
                  ? t('auth.submitLogin')
                  : t('auth.submitRegister')}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            {t('auth.or')}
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {/* OAuth 2.0 – ให้ backend เป็นคนพาไป Google */}
          <a href={authService.googleAuthUrl()} className="btn-outline w-full">
            <GoogleMark />
            {t('auth.google')}
          </a>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <Link
              href={isLogin ? '/gate/register' : '/gate/login'}
              className="font-semibold text-brand-600 hover:underline"
            >
              {isLogin ? t('auth.register') : t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 6.9l7.1 5.5c4.2-3.8 6.6-9.5 6.6-16.2z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.8 2.1-6.4 0-11.7-3.7-13.6-9.2l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}
