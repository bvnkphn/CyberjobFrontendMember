"use client";

import { usePathname, useRouter } from "next/navigation";
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
import { AUTH_API_URL, OWNER_API_URL, loginUrl } from "./config";
import type { OwnerMe } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** object → ส่งเป็น JSON · FormData → ส่งเป็น multipart */
  body?: unknown;
  query?: Record<string, string | number | undefined | null | string[]>;
};

interface OwnerContextValue {
  me: OwnerMe;
  reloadMe: () => Promise<OwnerMe | null>;
  api: <T>(path: string, options?: RequestOptions) => Promise<T>;
  /** ดาวน์โหลดไฟล์ที่ต้องแนบ token (เช่นเอกสารยืนยันบริษัท) แล้วเปิดในแท็บใหม่ */
  openFile: (path: string) => Promise<void>;
  logout: () => Promise<void>;
}

const OwnerContext = createContext<OwnerContextValue | null>(null);

export const OWNER_ROUTES = [
  "/dashboard",
  "/candidates",
  "/job-postings",
  "/company",
  "/packages",
  "/settings",
  "/support",
  "/gate-owner",
];

export const isOwnerRoute = (path: string) =>
  OWNER_ROUTES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

/** หน้าที่เข้าได้แม้ยังไม่ได้ยืนยันบริษัท */
const OPEN_BEFORE_GATE = ["/gate-owner", "/settings", "/support"];

async function readError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as { message?: string | string[]; code?: string } | null;
  const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
  return new ApiError(message ?? "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง", response.status, body?.code);
}

function buildQuery(query?: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

/**
 * session มาจาก API ฝั่ง member (refresh token อยู่ใน httpOnly cookie)
 * access token เก็บในหน่วยความจำเท่านั้น ไม่ลง localStorage
 */
export function OwnerProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useRef<string | null>(null);
  const refreshing = useRef<Promise<string | null> | null>(null);
  const [me, setMe] = useState<OwnerMe | null>(null);
  const isOwner = isOwnerRoute(pathname);

  const goLogin = useCallback(() => {
    window.location.replace(loginUrl(window.location.href));
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    refreshing.current ??= (async () => {
      try {
        const response = await fetch(`${AUTH_API_URL}/auth/refresh`, { method: "POST", credentials: "include", cache: "no-store" });
        if (!response.ok) return null;
        const body = (await response.json()) as { accessToken: string; user: { role: string } };
        if (body.user.role !== "EMPLOYER") return null;
        token.current = body.accessToken;
        return body.accessToken;
      } catch {
        return null;
      } finally {
        refreshing.current = null;
      }
    })();
    return refreshing.current;
  }, []);

  const send = useCallback(async (path: string, options: RequestOptions, retried = false): Promise<Response> => {
    if (!token.current && !(await refresh())) {
      goLogin();
      throw new ApiError("กรุณาเข้าสู่ระบบ", 401);
    }
    const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
    const response = await fetch(`${OWNER_API_URL}${path}${buildQuery(options.query)}`, {
      method: options.method ?? (options.body ? "POST" : "GET"),
      headers: {
        Authorization: `Bearer ${token.current}`,
        ...(options.body && !isForm ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? (isForm ? (options.body as FormData) : JSON.stringify(options.body)) : undefined,
      cache: "no-store",
    });

    // access token อายุสั้น – ต่ออายุแล้วลองอีกครั้งเดียว
    if (response.status === 401 && !retried) {
      token.current = null;
      if (await refresh()) return send(path, options, true);
      goLogin();
    }
    return response;
  }, [goLogin, refresh]);

  const api = useCallback(async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
    const response = await send(path, options);
    if (!response.ok) throw await readError(response);
    return (await response.json()) as T;
  }, [send]);

  const openFile = useCallback(async (path: string) => {
    const response = await send(path, {});
    if (!response.ok) throw await readError(response);
    const url = URL.createObjectURL(await response.blob());
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [send]);

  const reloadMe = useCallback(async () => {
    try {
      const next = await api<OwnerMe>("/owner/me");
      setMe(next);
      return next;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) goLogin();
      return null;
    }
  }, [api, goLogin]);

  useEffect(() => {
    if (!isOwner) return;
    void reloadMe();
  }, [isOwner, reloadMe]);

  // ยังไม่ได้ส่งข้อมูลบริษัท (หรือถูกปฏิเสธ) → ต้องไปหน้า Gate ก่อน
  const needsGate = Boolean(
    me && (!me.company || me.company.verificationStatus === "not_submitted" || me.company.verificationStatus === "rejected"),
  );
  const allowed = OPEN_BEFORE_GATE.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (!isOwner || !me) return;
    if (needsGate && !allowed) router.replace("/gate-owner");
  }, [isOwner, me, needsGate, allowed, router]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ถึงเรียกไม่สำเร็จก็ยังพาไปหน้าเข้าสู่ระบบ
    }
    token.current = null;
    window.location.replace(loginUrl());
  }, []);

  const value = useMemo(
    () => (me ? { me, reloadMe, api, openFile, logout } : null),
    [me, reloadMe, api, openFile, logout],
  );

  // สำหรับ Route ฝั่ง Member ไม่ต้องตรวจ Owner Auth
  if (!isOwner) {
    return <>{children}</>;
  }

  if (!value || (needsGate && !allowed)) {
    return <main className="owner-auth-loading">กำลังตรวจสอบบัญชีผู้ประกอบการ...</main>;
  }
  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function useOwner(): OwnerContextValue {
  const context = useContext(OwnerContext);
  if (!context) throw new Error("useOwner must be used within OwnerProvider");
  return context;
}

/** โหลดข้อมูลจาก API พร้อมสถานะ loading/error – เรียก reload() หลังแก้ไขข้อมูล */
export function useApi<T>(path: string | null, options?: RequestOptions) {
  const { api } = useOwner();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const key = path ? `${path}${buildQuery(options?.query)}` : null;
  const latest = useRef(0);

  const load = useCallback(async () => {
    if (!path) return;
    const request = ++latest.current;
    setLoading(true);
    try {
      const result = await api<T>(path, options);
      if (request === latest.current) {
        setData(result);
        setError(null);
      }
    } catch (reason) {
      if (request === latest.current) {
        setError(reason instanceof ApiError ? reason : new ApiError("ไม่สามารถโหลดข้อมูลได้", 0));
      }
    } finally {
      if (request === latest.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, key]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, loading, reload: load, setData };
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
