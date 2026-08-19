const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003/api/v1";

function getAccessToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("accessToken");
}

export function hasAccessToken() { return Boolean(getAccessToken()); }

type AuthSession = { accessToken: string; user: { id: string; email: string; isDemo: boolean } };

export async function ensureDemoSession() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development" || getAccessToken() || window.sessionStorage.getItem("demoSessionDisabled") === "true") return null;
  window.localStorage.removeItem("demoSessionDisabled");
  const response = await fetch(`${API_URL}/auth/demo`, { method: "POST", headers: { "Content-Type": "application/json" } });
  if (!response.ok) return null;
  const session = await response.json() as AuthSession;
  window.localStorage.setItem("accessToken", session.accessToken);
  window.localStorage.setItem("memberEmail", session.user.email);
  return session;
}

export function logout() {
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("memberEmail");
  window.localStorage.removeItem("demoSessionDisabled");
  window.sessionStorage.setItem("demoSessionDisabled", "true");
}

export async function login(email: string, password: string) {
  const isDevelopmentDemo = process.env.NODE_ENV === "development" && email.trim().toLowerCase() === "user@test.com" && password === "usertest555";
  const response = await fetch(`${API_URL}${isDevelopmentDemo ? "/auth/demo" : "/auth/login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, ...(isDevelopmentDemo ? {} : { body: JSON.stringify({ email, password }) }) });
  if (!response.ok) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  const session = await response.json() as AuthSession;
  window.localStorage.setItem("accessToken", session.accessToken);
  window.sessionStorage.removeItem("demoSessionDisabled");
  return session;
}

export async function register(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!response.ok) throw new Error("ไม่สามารถสมัครสมาชิกได้");
  const session = await response.json() as AuthSession;
  window.localStorage.setItem("accessToken", session.accessToken);
  window.sessionStorage.removeItem("demoSessionDisabled");
  return session;
}

async function request<T>(path: string, init: RequestInit, retried = false): Promise<T> {
  if (!getAccessToken()) await ensureDemoSession();
  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401 && process.env.NODE_ENV === "development" && !retried && window.sessionStorage.getItem("demoSessionDisabled") !== "true") {
    window.localStorage.removeItem("accessToken");
    await ensureDemoSession();
    return request<T>(path, init, true);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
    throw new Error(message ?? "ไม่สามารถเชื่อมต่อระบบได้");
  }
  return response.json() as Promise<T>;
}

export function formDataToObject(form: HTMLFormElement) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of new FormData(form).entries()) {
    const normalized = value instanceof File ? { name: value.name, size: value.size, type: value.type } : value;
    const current = result[key];
    result[key] = current === undefined ? normalized : Array.isArray(current) ? [...current, normalized] : [current, normalized];
  }
  return result;
}

export function saveGate(data: Record<string, unknown>) {
  return request("/gate", { method: "POST", body: JSON.stringify(data) });
}

export function skipGate() {
  return request("/gate/skip", { method: "POST", body: JSON.stringify({ privacy: "private" }) });
}

export function saveProfileSection(section: string, data: Record<string, unknown>) {
  return request(`/profile/${section}`, { method: "PATCH", body: JSON.stringify({ data }) });
}

export type MemberProfile = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  completion: number;
  privacy: "public" | "private";
  updatedAt: string;
  address: string | null;
  desiredJobCategories: string[];
  personal: Record<string, unknown>;
  desiredJob: Record<string, unknown>;
  educations: Record<string, unknown> | unknown[];
  workExperiences: Record<string, unknown> | unknown[];
  certificates: Record<string, unknown> | unknown[];
  languages: Record<string, unknown> | unknown[];
  otherSkills: Record<string, unknown>;
};

export function getProfile() {
  return request<MemberProfile>("/profile", { method: "GET" });
}
