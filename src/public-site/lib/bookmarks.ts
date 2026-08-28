'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/public-site/auth/AuthProvider';
import { meService } from '@/public-site/services/auth.service';
import { usePathname, useRouter } from 'next/navigation';

const STORAGE_KEY = 'cyberjob.bookmarks';

function readLocal(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* โหมดส่วนตัวของเบราว์เซอร์อาจปิด storage ไว้ */
  }
}

/**
 * Feature 7.1 – ผู้สมัครบันทึกไว้ได้ว่าสนใจงานไหน
 * ล็อกอินแล้ว → เก็บในฐานข้อมูลผ่าน API
 * ยังไม่ล็อกอิน → เก็บไว้ในเครื่องก่อน แล้วย้ายเข้าบัญชีอัตโนมัติตอนล็อกอิน
 */
export function useBookmarks() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    let alive = true;

    (async () => {
      if (user) {
        try {
          const jobs = await meService.bookmarks();
          if (alive) setIds(jobs.map((j) => j.id));
        } catch {
          if (alive) setIds([]);
        }
      } else {
        if (alive) setIds(readLocal());
      }
      if (alive) setReady(true);
    })();

    return () => {
      alive = false;
    };
  }, [user, authLoading]);

  const toggle = useCallback(
    (id: string) => {
      if (!user) {
        router.push(`/gate/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const isOn = ids.includes(id);
      const next = isOn ? ids.filter((x) => x !== id) : [...ids, id];

      // อัปเดตหน้าจอทันที แล้วค่อยซิงก์เบื้องหลัง
      setIds(next);

      if (user) {
        const call = isOn
          ? meService.removeBookmark(id)
          : meService.addBookmark(id);
        call.catch(() => setIds(ids)); // ล้มเหลว → ย้อนกลับ
      }
    },
    [ids, pathname, router, user],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, has, toggle, ready };
}
