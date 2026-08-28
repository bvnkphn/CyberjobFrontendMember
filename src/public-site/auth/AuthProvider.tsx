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
import { authService, meService } from '@/public-site/services/auth.service';

const LOCAL_BOOKMARKS_KEY = 'cyberjob.bookmarks';

interface AuthContextValue {
  user: AuthUser | null;
  /** true ระหว่างกำลังตรวจ session ตอนเปิดเว็บครั้งแรก */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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
    async (email: string, password: string) => {
      const result = await authService.login({ email, password });
      await applyResult(result);
    },
    [applyResult],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await authService.register({ email, password, name });
      await applyResult(result);
    },
    [applyResult],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
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
    () => ({ user, loading, login, register, logout, adoptSession }),
    [user, loading, login, register, logout, adoptSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องอยู่ภายใต้ <AuthProvider>');
  return ctx;
}

