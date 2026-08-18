"use client";

import { useRouter } from "next/navigation";

export function ProfilePageHeading({ title, fallbackHref = "/profile" }: { title: string; fallbackHref?: string }) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <header className="profile-page-heading">
      <button type="button" onClick={goBack} aria-label="ย้อนกลับไปหน้าก่อนหน้า">
        <span aria-hidden="true">←</span> ย้อนกลับ
      </button>
      <h1>{title}</h1>
    </header>
  );
}
