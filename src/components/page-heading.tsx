"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type PageHeadingProps = {
  title: string;
  description?: string;
  fallbackHref?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

/** หัวข้อมาตรฐานของทุกหน้าภายใน Member พร้อมปุ่มย้อนกลับที่ทำงานได้จริง */
export function PageHeading({
  title,
  description,
  fallbackHref = "/",
  eyebrow,
  actions,
  className = "",
}: PageHeadingProps) {
  const router = useRouter();

  const goBack = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <header className={`flex items-start gap-3 sm:gap-4 ${className}`}>
      <a
        href={fallbackHref}
        onClick={goBack}
        aria-label="ย้อนกลับไปหน้าก่อนหน้า"
        className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-2xl leading-none text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
      >
        <span aria-hidden="true">‹</span>
      </a>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="mb-1 text-xs font-extrabold uppercase tracking-[.12em] text-brand-600">{eyebrow}</p>}
        <h1 className="m-0 text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
