const trim = (url: string) => url.replace(/\/$/, "");

/** API ของหลังบ้าน admin (ชี้ไป unified backend ที่ /api หรือตาม env) */
export const ADMIN_API_URL = trim(process.env.NEXT_PUBLIC_ADMIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api");

/**
 * ล็อกอินผ่าน API ฝั่ง member ซึ่งออก access token และ refresh cookie ให้
 */
export const AUTH_API_URL = trim(process.env.NEXT_PUBLIC_AUTH_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api");
