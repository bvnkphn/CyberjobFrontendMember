"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ADMIN_API_URL, AUTH_API_URL } from "./config";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResult {
  accessToken: string;
  user: AdminUser;
}

type Status = "checking" | "signed-out" | "signed-in";

interface AuthContextValue {
  status: Status;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  /** เรียก API ของ admin พร้อมแนบ token และต่ออายุให้เองหนึ่งครั้งเมื่อได้ 401 */
  adminFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** อ่านข้อความ error ของ NestJS (message เป็น string หรือ string[]) */
export async function readError(response: Response, fallback: string): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
  return new ApiError(message ?? fallback, response.status);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [user, setUser] = useState<AdminUser | null>(null);
  const tokenRef = useRef<string | null>(null);

  const accept = useCallback((result: AuthResult) => {
    if (result.user.role !== "ADMIN") {
      tokenRef.current = null;
      setUser(null);
      setStatus("signed-out");
      throw new ApiError("บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ", 403);
    }
    tokenRef.current = result.accessToken;
    setUser(result.user);
    setStatus("signed-in");
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) return false;
      accept((await response.json()) as AuthResult);
      return true;
    } catch {
      return false;
    }
  }, [accept]);

  // เปิดหน้าแล้วลองต่อ session เดิมจาก refresh cookie ก่อน
  useEffect(() => {
    void refresh().then((ok) => {
      if (!ok) setStatus("signed-out");
    });
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch(`${AUTH_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw await readError(response, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      accept((await response.json()) as AuthResult);
    },
    [accept],
  );

  const adminFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const send = () =>
        fetch(`${ADMIN_API_URL}${path}`, {
          ...init,
          cache: "no-store",
          headers: {
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
            ...init.headers,
          },
        });

      let response = await send();
      // access token อายุสั้น (15 นาที) ต่ออายุแล้วลองใหม่หนึ่งครั้ง
      if (response.status === 401 && (await refresh())) {
        response = await send();
      }
      if (response.status === 401) setStatus("signed-out");
      return response;
    },
    [refresh],
  );

  const value = useMemo(() => ({ status, user, login, adminFetch }), [status, user, login, adminFetch]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
