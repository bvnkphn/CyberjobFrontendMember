const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003/api/v1";

function getAccessToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("accessToken");
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

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
