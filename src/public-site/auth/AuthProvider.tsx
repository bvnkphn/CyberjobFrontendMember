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
import type { AuthResult, AuthUser } from '@cyberjob/shared';
import { setAccessToken } from '@/public-site/lib/api';
import { authService, meService, type LoginStepResult } from '@/public-site/services/auth.service';

const LOCAL_BOOKMARKS_KEY = 'cyberjob.bookmarks';

interface AuthContextValue {
  user: AuthUser | null;
  /** true ระหว่างกำลังตรวจ session ตอนเปิดเว็บครั้งแรก */
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginStepResult>;
  verifyOtp: (email: string, code: string) => Promise<AuthUser>;
  resendOtp: (email: string) => Promise<{ ok: boolean; message: string }>;
  loginWithGoogle: (credential: string, role?: 'JOBSEEKER' | 'EMPLOYER') => Promise<AuthUser>;
  register: (email: string, password: string, name: string, role?: 'JOBSEEKER' | 'EMPLOYER') => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** ใช้หลังกลับมาจาก OAuth callback */
  adoptSession: (accessToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /** ย้าย bookmark ที่เก็บไว้ในเครื่องเข้าบัญชี แล้วล้างของเดิมทิ้ง */
  const mergeLocalBookmarks = useCallback(async () => {
    try {
      const raw = window.localStorage.getItem(LOCAL_BOOKMARKS_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      if (ids.length) {
        await meService.syncBookmarks(ids);
        window.localStorage.removeItem(LOCAL_BOOKMARKS_KEY);
      }
    } catch {
      /* ไม่ให้ล้มทั้งการล็อกอินเพราะเรื่องนี้ */
    }
  }, []);

  const applyResult = useCallback(
    async (result: AuthResult) => {
      setAccessToken(result.accessToken);
      setUser(result.user);
      await mergeLocalBookmarks();
      return result.user;
    },
    [mergeLocalBookmarks],
  );

  // ตอนเปิดเว็บ ลองต่ออายุ session จาก refresh cookie
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const result = await authService.refresh();
        if (!alive) return;
        setAccessToken(result.accessToken);
        setUser(result.user);
      } catch {
        if (alive) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginStepResult> => {
      const rawResult = await authService.login({ email, password });
      const result: any =
        rawResult && typeof rawResult === 'object' && 'result' in rawResult
          ? (rawResult as any).result
          : rawResult;
      if (result && 'accessToken' in result) {
        await applyResult(result);
      }
      return result;
    },
    [applyResult],
  );

  const verifyOtp = useCallback(
    async (email: string, code: string): Promise<AuthUser> => {
      const result = await authService.verifyLoginOtp({ email, code });
      return applyResult(result);
    },
    [applyResult],
  );

  const resendOtp = useCallback(
    async (email: string): Promise<{ ok: boolean; message: string }> => {
      return authService.resendLoginOtp({ email });
    },
    [],
  );

  const loginWithGoogle = useCallback(
    async (credential: string, role?: 'JOBSEEKER' | 'EMPLOYER'): Promise<AuthUser> => {
      const result = await authService.googleVerify({ credential, role });
      return applyResult(result);
    },
    [applyResult],
  );

  const register = useCallback(
    async (email: string, password: string, name: string, role: 'JOBSEEKER' | 'EMPLOYER' = 'JOBSEEKER'): Promise<AuthUser> => {
      const result = await authService.register({ email, password, name, role });
      return applyResult(result);
    },
    [applyResult],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const current = await authService.me();
    setUser(current);
  }, []);

  const adoptSession = useCallback(
    async (accessToken: string) => {
      setAccessToken(accessToken);
      const me = await authService.me();
      setUser(me);
      await mergeLocalBookmarks();
    },
    [mergeLocalBookmarks],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      verifyOtp,
      resendOtp,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
      adoptSession,
    }),
    [
      user,
      loading,
      login,
      verifyOtp,
      resendOtp,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
      adoptSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องอยู่ภายใต้ <AuthProvider>');
  return ctx;
}
