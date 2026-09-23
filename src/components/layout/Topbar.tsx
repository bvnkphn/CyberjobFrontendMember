"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CompanyLogo } from "@/components/ui/ui";
import { relativeTime } from "@/lib/format";
import { useLanguage, type LanguageKey } from "@/lib/i18n/LanguageContext";
import { useOwner } from "@/lib/owner";
import type { OwnerNotification } from "@/lib/types";
import styles from "./Topbar.module.css";

interface TopbarProps {
  title?: string;
  titleKey?: LanguageKey;
  onToggleMobile?: () => void;
}

const LANGUAGES = [
  { value: "th" as const, label: "ไทย" },
  { value: "en" as const, label: "EN" },
];

export default function Topbar({ title, titleKey, onToggleMobile }: TopbarProps) {
  const { language, setLanguage, t, isEn } = useLanguage();
  const { me, api, logout } = useOwner();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"notifications" | "account" | null>(null);
  const [notifications, setNotifications] = useState<OwnerNotification[] | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // โหลดตอนเปิดแผงเพื่อให้เห็นรายการล่าสุดเสมอ – ต้องมีบริษัทก่อน
  useEffect(() => {
    if (panel !== "notifications" || !me.company) return;
    api<OwnerNotification[]>("/owner/notifications")
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [panel, api, me.company]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false);
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectLanguage(lang: "th" | "en") {
    setLanguage(lang);
    setOpen(false);
  }

  const currentLabel = language === "th" ? t("topbar.thai") : t("topbar.english");
  const heading = titleKey ? t(titleKey) : title;
  const togglePanel = (name: "notifications" | "account") =>
    setPanel((current) => (current === name ? null : name));

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onToggleMobile}
          aria-label={isEn ? "Open navigation menu" : "เปิดเมนูนำทาง"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {heading ? <h1 className={styles.title}>{heading}</h1> : null}
      </div>
      <div className={styles.actions}>
        <div className={styles.langWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={`${styles.langButton} ${open ? styles.langButtonOpen : ""}`}
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span>{currentLabel}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${styles.caret} ${open ? styles.caretUp : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {open && (
            <ul className={styles.dropdown} role="listbox">
              {LANGUAGES.map((lang) => (
                <li
                  key={lang.value}
                  role="option"
                  aria-selected={lang.value === language}
                  className={`${styles.dropdownItem} ${lang.value === language ? styles.dropdownItemActive : ""}`}
                  onClick={() => selectLanguage(lang.value)}
                >
                  {lang.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.panelWrapper} ref={panelRef}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t("topbar.notification")}
            aria-expanded={panel === "notifications"}
            onClick={() => togglePanel("notifications")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.accountButton}
            aria-label={isEn ? "Account menu" : "เมนูบัญชี"}
            aria-expanded={panel === "account"}
            onClick={() => togglePanel("account")}
          >
            {me.company ? (
              <CompanyLogo company={me.company} size={38} />
            ) : (
              <span className={styles.avatar}>{me.user.name.slice(0, 2)}</span>
            )}
          </button>

          {panel === "notifications" && (
            <div className={styles.panel} role="dialog" aria-label={t("topbar.notification")}>
              <strong className={styles.panelTitle}>{isEn ? "Recent notifications" : "การแจ้งเตือนล่าสุด"}</strong>
              {!me.company ? (
                <p className={styles.panelEmpty}>
                  {isEn ? "Complete your company details first." : "กรอกข้อมูลบริษัทก่อนเพื่อรับการแจ้งเตือน"}
                </p>
              ) : notifications === null ? (
                <p className={styles.panelEmpty}>{isEn ? "Loading..." : "กำลังโหลด..."}</p>
              ) : notifications.length === 0 ? (
                <p className={styles.panelEmpty}>{isEn ? "No notifications yet" : "ยังไม่มีการแจ้งเตือน"}</p>
              ) : (
                <ul className={styles.notificationList}>
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <Link href={item.link} onClick={() => setPanel(null)}>
                        <span className={`${styles.dot} ${styles[item.type]}`} aria-hidden />
                        <span>
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                          <time>{relativeTime(item.createdAt, isEn)}</time>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {panel === "account" && (
            <div className={`${styles.panel} ${styles.accountPanel}`} role="menu">
              <div className={styles.accountHead}>
                <b>{me.company?.name ?? me.user.name}</b>
                <small>{me.user.email}</small>
                <span className={styles.planPill}>{me.plan.current}</span>
              </div>
              {me.company && (
                <Link role="menuitem" href="/company" onClick={() => setPanel(null)}>
                  {t("sidebar.company")}
                </Link>
              )}
              <Link role="menuitem" href="/packages" onClick={() => setPanel(null)}>
                {t("sidebar.package")}
              </Link>
              <Link role="menuitem" href="/settings" onClick={() => setPanel(null)}>
                {t("sidebar.settings")}
              </Link>
              <button role="menuitem" type="button" className={styles.logout} onClick={() => void logout()}>
                {isEn ? "Log out" : "ออกจากระบบ"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
