const trimSlash = (value: string) => value.replace(/\/$/, "");

/** API หลังบ้านรวม (member + owner) */
export const OWNER_API_URL = trimSlash(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api");

/** API ฝั่ง member/auth */
export const AUTH_API_URL = trimSlash(process.env.NEXT_PUBLIC_AUTH_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api");

/** เว็บ member + owner */
export const MEMBER_URL = trimSlash(process.env.NEXT_PUBLIC_MEMBER_URL ?? "");

export const loginUrl = (next?: string) =>
  `/gate/login?account=EMPLOYER${next ? `&next=${encodeURIComponent(next)}` : ""}`;
