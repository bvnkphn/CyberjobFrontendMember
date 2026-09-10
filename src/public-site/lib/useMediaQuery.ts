'use client';

import { useEffect, useState } from 'react';

/**
 * ติดตามผลของ CSS media query จากฝั่ง JavaScript
 *
 * รอบแรกคืน false เสมอเพื่อให้ผลลัพธ์ตรงกับที่ render มาจากเซิร์ฟเวอร์
 * (กัน hydration mismatch) แล้วค่อยอัปเดตเป็นค่าจริงหลัง mount
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);

    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}
