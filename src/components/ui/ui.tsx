"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { initialsOf } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./ui.module.css";

export function resolveUploadUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let resolved = url.trim();
  if (resolved.includes("localhost:3002") || resolved.includes("localhost:4000")) {
    resolved = resolved.replace(/http:\/\/localhost:(3002|4000)/g, "https://api.cyberjob.asia");
  }
  if (resolved.startsWith("/uploads/")) {
    resolved = `https://api.cyberjob.asia${resolved}`;
  }
  return resolved;
}


export function Loading({ label }: { label?: string }) {
  const { isEn } = useLanguage();
  return (
    <div className={styles.state} role="status">
      <span className={styles.spinner} aria-hidden />
      <span>{label ?? (isEn ? "Loading..." : "กำลังโหลดข้อมูล...")}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { isEn } = useLanguage();
  return (
    <div className={`${styles.state} ${styles.error}`} role="alert">
      <strong>{isEn ? "Something went wrong" : "โหลดข้อมูลไม่สำเร็จ"}</strong>
      <span>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {isEn ? "Try again" : "ลองอีกครั้ง"}
        </button>
      )}
    </div>
  );
}

export type NoticeTone = "info" | "success" | "error" | "warning";

export function Notice({ tone = "info", children, action }: { tone?: NoticeTone; children: ReactNode; action?: ReactNode }) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      <span>{children}</span>
      {action}
    </div>
  );
}

/** แจ้งเมื่อแพ็กเกจปัจจุบันใช้ฟีเจอร์นี้ไม่ได้ พร้อมปุ่มไปหน้าแพ็กเกจ */
export function UpgradeNotice({ message }: { message: string }) {
  const { isEn } = useLanguage();
  return (
    <Notice
      tone="warning"
      action={
        <Link href="/packages" className={styles.noticeAction}>
          {isEn ? "View packages" : "ดูแพ็กเกจ"}
        </Link>
      }
    >
      {message}
    </Notice>
  );
}

export function PersonAvatar({ name, url, size = 38 }: { name: string; url?: string | null; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={styles.avatar} src={url} alt="" width={size} height={size} />
  ) : (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {initialsOf(name) || "?"}
    </span>
  );
}

export function CompanyLogo({
  company,
  size = 48,
}: {
  company: { name: string; logoUrl: string | null; logoText: string; logoColor: string };
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const src = resolveUploadUrl(company.logoUrl);

  useEffect(() => {
    setImgError(false);
  }, [company.logoUrl]);

  return src && !imgError ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.logo}
      src={src}
      alt={company.name}
      width={size}
      height={size}
      onError={() => setImgError(true)}
      style={{ objectFit: "contain", borderRadius: size >= 80 ? "16px" : "8px", background: "#fff", border: "1px solid #e2e8f0" }}
    />
  ) : (
    <span
      className={styles.logo}
      style={{
        width: size,
        height: size,
        background: company.logoColor || "#1e3a8a",
        fontSize: size * 0.36,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: size >= 80 ? "16px" : "8px",
      }}
      aria-hidden
    >
      {company.logoText || (company.name ? company.name.slice(0, 2).toUpperCase() : "CJ")}
    </span>
  );
}

/** คะแนน 0–100 แบบวงแหวน · null = ยังไม่ประเมิน */
export function ScoreBadge({ value, label }: { value: number | null; label?: string }) {
  const { isEn } = useLanguage();
  if (value === null) {
    return (
      <span className={styles.scorePending} title={label}>
        {isEn ? "N/A" : "ยังไม่ประเมิน"}
      </span>
    );
  }
  const color = value >= 80 ? "#22a06b" : value >= 60 ? "#3e6ff0" : "#f5a623";
  return (
    <span
      className={styles.score}
      style={{ background: `conic-gradient(${color} ${value * 3.6}deg, var(--color-gray-100) 0)`, color }}
      title={label ? `${label}: ${value}` : String(value)}
    >
      <span className={styles.scoreInner}>{value}</span>
    </span>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const { isEn } = useLanguage();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`${styles.modal} ${wide ? styles.modalWide : ""}`} role="dialog" aria-modal="true">
        <header className={styles.modalHead}>
          <h2>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={isEn ? "Close" : "ปิด"}>
            ×
          </button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        {footer && <footer className={styles.modalFooter}>{footer}</footer>}
      </div>
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const { isEn } = useLanguage();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className={styles.pagination} aria-label={isEn ? "Pagination" : "เลื่อนหน้า"}>
      <span>
        {from}–{to} {isEn ? "of" : "จาก"} {total}
      </span>
      <div>
        <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ‹ {isEn ? "Prev" : "ก่อนหน้า"}
        </button>
        {Array.from({ length: pages }, (_, index) => index + 1)
          .filter((number) => Math.abs(number - page) <= 2 || number === 1 || number === pages)
          .map((number) => (
            <button
              key={number}
              type="button"
              aria-current={number === page ? "page" : undefined}
              className={number === page ? styles.pageActive : ""}
              onClick={() => onChange(number)}
            >
              {number}
            </button>
          ))}
        <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          {isEn ? "Next" : "ถัดไป"} ›
        </button>
      </div>
    </nav>
  );
}

/** ส่วนหัวของหน้าจอ (Page Header) มาตรฐานสำหรับทุกหน้าในฝั่ง Owner */
export function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.pageHeader} ${className ?? ""}`}>
      <div className={styles.pageHeaderMain}>
        {icon && <span className={styles.pageHeaderIcon} aria-hidden>{icon}</span>}
        <div className={styles.pageHeaderTitleCol}>
          <div className={styles.pageHeaderTitleRow}>
            <h1 className={styles.pageHeaderTitle}>{title}</h1>
            {badge && <span className={styles.pageHeaderBadge}>{badge}</span>}
          </div>
          {subtitle && <p className={styles.pageHeaderSubtitle}>{subtitle}</p>}
        </div>
      </div>
      {action && <div className={styles.pageHeaderAction}>{action}</div>}
    </div>
  );
}

/** ป้ายกำกับสถานะ (Status Badge) ดีไซน์มน สะอาดตา */
export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "success" | "warning" | "info" | "neutral" | "danger";
  children: ReactNode;
  className?: string;
}) {
  const toneClass = {
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    info: styles.badgeInfo,
    neutral: styles.badgeNeutral,
    danger: styles.badgeDanger,
  }[tone];

  return <span className={`${styles.badge} ${toneClass} ${className ?? ""}`}>{children}</span>;
}

