"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/public-site/auth/AuthProvider";
import type { AccountType } from "./account-tabs";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function GoogleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 48 48" aria-hidden focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.77 24c0-1.6.27-3.15.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}

interface GoogleButtonProps {
  accountType?: AccountType;
  onError?: (msg: string) => void;
}

export function GoogleButton({ accountType = "JOBSEEKER", onError }: GoogleButtonProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    // โหลด Google Identity Services script ถ้ายังไม่มี
    const existingScript = document.getElementById("google-gsi-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setGisLoaded(true);
      document.body.appendChild(script);
    } else {
      setGisLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!gisLoaded || !GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) return;
          try {
            setLoading(true);
            const user = await loginWithGoogle(response.credential, accountType);
            const next = new URLSearchParams(window.location.search).get("next");
            if (user.role === "EMPLOYER") {
              window.location.assign(next || "/dashboard");
            } else {
              router.replace(next || "/");
              router.refresh();
            }
          } catch (err: any) {
            const msg = err instanceof Error ? err.message : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ";
            if (onError) onError(msg);
          } finally {
            setLoading(false);
          }
        },
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: googleBtnRef.current.offsetWidth || 380,
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      }
    } catch (e) {
      console.error("GIS initialization error:", e);
    }
  }, [gisLoaded, accountType, loginWithGoogle, router, onError]);

  const handleFallbackClick = () => {
    if (GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch {
        // Fall back to server redirect
      }
    }
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <>
      <div className="divider">
        <span>หรือ</span>
      </div>

      {GOOGLE_CLIENT_ID && gisLoaded ? (
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <div ref={googleBtnRef} style={{ width: "100%" }} />
        </div>
      ) : (
        <button
          type="button"
          className="google-btn"
          onClick={handleFallbackClick}
          disabled={loading}
        >
          <GoogleIcon />
          {loading ? "กำลังเชื่อมต่อ Google..." : "เข้าสู่ระบบด้วยบัญชี Google"}
        </button>
      )}
    </>
  );
}
