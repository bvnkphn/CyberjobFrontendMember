'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/public-site/auth/AuthProvider';
import { useI18n } from '@/public-site/i18n/LanguageProvider';

/** รับ access token จาก URL แล้วเก็บเข้า session ก่อนพากลับหน้าแรก */
export function OAuthCallback() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { adoptSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const token = params.get('accessToken');
    if (!token) {
      setError(t('auth.failed'));
      return;
    }

    adoptSession(token)
      .then(() => router.replace('/'))
      .catch(() => setError(t('auth.failed')));
  }, [params, adoptSession, router, t]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      {error ? (
        <>
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => router.replace('/gate/login')}
            className="btn-outline"
          >
            {t('auth.login')}
          </button>
        </>
      ) : (
        <>
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-slate-500">{t('auth.callback')}</p>
        </>
      )}
    </div>
  );
}
