"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./Sidebar.module.css";


interface NavItem {
  key: string;
  labelKey: string;
  icon?: string;
  href?: string;
  /** เส้นทางย่อยที่ยังให้ถือว่าเมนูนี้ active เช่น /job-postings/edit/[id] */
  activePrefixes?: string[];
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { key: "dashboard", labelKey: "sidebar.dashboard", icon: "dashboard", href: "/dashboard" },
  {
    key: "applicants",
    labelKey: "sidebar.applicants",
    icon: "users",
    children: [
      { key: "all-applicants", labelKey: "sidebar.allApplicants", href: "/candidates" },
      { key: "bookmarked", labelKey: "sidebar.bookmarked", href: "/candidates/bookmarks" },
      { key: "responses", labelKey: "sidebar.responses", href: "/candidates/responses" },
      { key: "invitations", labelKey: "sidebar.invitations", href: "/candidates/invitations" },
    ],
  },
  {
    key: "jobs",
    labelKey: "sidebar.jobs",
    icon: "briefcase",
    children: [
      {
        key: "my-postings",
        labelKey: "sidebar.myJobPostings",
        href: "/job-postings",
        activePrefixes: ["/job-postings/edit"],
      },
      {
        key: "create-posting",
        labelKey: "sidebar.createJobPosting",
        href: "/job-postings/create",
      },
    ],
  },
  { key: "company", labelKey: "sidebar.company", icon: "building", href: "/company", activePrefixes: ["/company/"] },
  { key: "package", labelKey: "sidebar.package", icon: "package", href: "/packages", activePrefixes: ["/packages/"] },
  {
    key: "support",
    labelKey: "sidebar.support",
    icon: "database",
    children: [
      { key: "help-center", labelKey: "sidebar.helpCenter", href: "/support" },
      { key: "tutorials", labelKey: "sidebar.tutorials", href: "/support/tutorials" },
    ],
  },
  { key: "settings", labelKey: "sidebar.settings", icon: "settings", href: "/settings" },
];

function NavIcon({ name }: { name?: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "package":
      return (
        <svg {...common}>
          <path d="M21 8v13H3V8" />
          <path d="M1 3h22v5H1z" />
          <path d="M10 12h4" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
          <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
        </svg>
      );
    case "database":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onCloseMobile?.();
    }
  }, [pathname, onCloseMobile]);

  const labelOf = (item: NavItem) => t(item.labelKey as Parameters<typeof t>[0]);

  const isActive = (item: NavItem) =>
    Boolean(
      item.href &&
        (pathname === item.href ||
          (item.activePrefixes ?? []).some((prefix) => pathname.startsWith(prefix))),
    );

  /** กลุ่มที่มีหน้าปัจจุบันอยู่จะกางไว้ให้ตั้งแต่แรก แต่ผู้ใช้ยังกดพับเองได้ */
  const isOpen = (item: NavItem) =>
    openGroups[item.key] ?? (item.children ?? []).some(isActive);

  const toggle = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${
        mobileOpen ? styles.mobileOpen : ""
      }`}
    >
      <div className={styles.logo}>
        <span className={styles.brand}>
          <span className={styles.logoCyber}>CYBER</span>
          <span className={styles.logoJob}>JOB</span>
        </span>
        <div className={styles.headerButtons}>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={onToggle}
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.closeMobileButton}
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map((item) => {
          const label = labelOf(item);
          if (item.children) {
            return (
              <div key={item.key} className={styles.group}>
                <button
                  type="button"
                  className={`${styles.navItem} ${styles.navGroup}`}
                  onClick={() => toggle(item.key)}
                  title={collapsed ? label : undefined}
                >
                  <span className={styles.navIcon}>
                    <NavIcon name={item.icon} />
                  </span>
                  <span className={styles.navLabel}>{label}</span>
                  <span className={`${styles.caret} ${isOpen(item) ? styles.caretOpen : ""}`}>
                    ▾
                  </span>
                </button>
                {!collapsed && isOpen(item) && (
                  <ul className={styles.submenu}>
                    {item.children.map((child) => {
                      const childLabel = labelOf(child);
                      return (
                        <li key={child.key}>
                          {child.href ? (
                            <Link
                              href={child.href}
                              className={`${styles.submenuItem} ${
                                isActive(child) ? styles.submenuItemActive : ""
                              }`}
                              onClick={onCloseMobile}
                            >
                              {childLabel}
                            </Link>
                          ) : (
                            <span className={styles.submenuItem}>{childLabel}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }
          return (
            <div key={item.key} className={styles.navItemWrapper}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${
                    isActive(item) ? styles.navItemActive : ""
                  }`}
                  aria-current={isActive(item) ? "page" : undefined}
                  title={collapsed ? label : undefined}
                  onClick={onCloseMobile}
                >
                  <span className={styles.navIcon}>
                    <NavIcon name={item.icon} />
                  </span>
                  <span className={styles.navLabel}>{label}</span>
                </Link>
              ) : (
                <span
                  className={styles.navItem}
                  title={collapsed ? label : undefined}
                >
                  <span className={styles.navIcon}>
                    <NavIcon name={item.icon} />
                  </span>
                  <span className={styles.navLabel}>{label}</span>
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
