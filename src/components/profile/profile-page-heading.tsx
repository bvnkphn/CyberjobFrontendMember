"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

export function ProfilePageHeading({ title, description, fallbackHref = "/profile" }: { title: string; description?: string; fallbackHref?: string }) {
  const router = useRouter();

  const goBack = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <header className="profile-page-heading">
      <a className="profile-back-link" href={fallbackHref} onClick={goBack} aria-label="ย้อนกลับไปหน้าก่อนหน้า">
        <span aria-hidden="true">‹</span>
      </a>
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    </header>
  );
}
