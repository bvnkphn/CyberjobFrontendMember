/**
 * ตัวห่อ fetch สำหรับเรียก NestJS API
 * ตั้งค่า NEXT_PUBLIC_API_URL ใน .env.local เพื่อชี้ไป backend ตัวจริง
 *
 * access token เก็บไว้ในหน่วยความจำ (และสำรองใน localStorage เพื่อให้รอด refresh หน้า)
 * ส่วน refresh token อยู่ใน httpOnly cookie ที่ JavaScript อ่านไม่ได้
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api';

const TOKEN_KEY = 'cyberjob.accessToken';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* โหมดส่วนตัวของเบราว์เซอร์อาจปิด storage ไว้ */
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window === 'undefined') return null;
  try {
    accessToken = window.localStorage.getItem(TOKEN_KEY);
  } catch {
    accessToken = null;
  }
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** ดึงข้อความ error ที่อ่านรู้เรื่องออกมาจาก response ของ Nest */
async function toApiError(res: Response, path: string): Promise<ApiError> {
  let message = `เรียก ${path} ไม่สำเร็จ (${res.status})`;
  let details: unknown;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    details = body;
    if (Array.isArray(body.message)) message = body.message[0];
    else if (typeof body.message === 'string') message = body.message;
  } catch {
    /* body ไม่ใช่ JSON */
  }
  return new ApiError(message, res.status, details);
}

let refreshing: Promise<boolean> | null = null;

const REQUEST_TIMEOUT_MS = 8_000;

/** ป้องกันหน้าเว็บค้างเมื่อ API ปลายทางหยุดทำงานหรือยังไม่พร้อม */
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  if (init.signal?.aborted) controller.abort();
  else init.signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener('abort', abortFromCaller);
  }
}

/** ขอ access token ใหม่ด้วย refresh cookie – ยิงพร้อมกันหลายครั้งก็ทำงานรอบเดียว */
async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { accessToken: string };
        setAccessToken(data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

interface RequestOptions extends RequestInit {
  /** ข้ามการต่ออายุ token อัตโนมัติ (ใช้กับ endpoint ของ auth เอง) */
  skipRefresh?: boolean;
}

async function request<T>(
  path: string,
  init: RequestOptions = {},
): Promise<T> {
  const { skipRefresh, ...rest } = init;

  const send = () => {
    const token = getAccessToken();
    return fetchWithTimeout(`${API_BASE}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(rest.headers ?? {}),
      },
      cache: 'no-store',
    });
  };

  let res = await send();

  // access token หมดอายุ → ต่ออายุแล้วลองใหม่หนึ่งครั้ง
  if (res.status === 401 && !skipRefresh && getAccessToken()) {
    const ok = await refreshAccessToken();
    if (ok) res = await send();
    else setAccessToken(null);
  }

  if (!res.ok) throw await toApiError(res, path);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function apiGet<T>(path: string, init?: RequestOptions): Promise<T> {
  return request<T>(path, init);
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  init?: RequestOptions,
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string, init?: RequestOptions): Promise<T> {
  return request<T>(path, { ...init, method: 'DELETE' });
}
