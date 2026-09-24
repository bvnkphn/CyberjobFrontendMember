"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAdminAuth } from "@/lib/admin/auth";
import {
  BellIcon,
  BookIcon,
  BuildingIcon,
  BriefcaseIcon,
  ChevronIcon,
  GearIcon,
  GridIcon,
  LifebuoyIcon,
  MenuIcon,
  UsersIcon,
} from "../icons";
import styles from "./Shell.module.css";

interface NavLink {
  label: string;
  icon: ReactNode;
  href?: string;
  children?: NavLink[];
}

/**
 * เมนูตามดีไซน์ – รายการที่ไม่มี href เป็นฟีเจอร์ของทีมอื่นที่ยังไม่ได้ทำ
 * แสดงไว้ให้โครงหน้าเหมือนดีไซน์ แต่กดไม่ได้
 */
const NAV: NavLink[] = [
  { label: "Dashboard", icon: <GridIcon />, href: "/admin" },
  { label: "จัดการผู้ใช้", icon: <UsersIcon />, href: "/admin/users" },
  {
    label: "จัดการบริษัท",
    icon: <BuildingIcon />,
    children: [
      { label: "บริษัทรอยืนยัน", icon: <BuildingIcon size={18} />, href: "/admin/companies" },
      { label: "ดูประกาศงาน", icon: <BriefcaseIcon size={18} />, href: "/admin/jobs" },
    ],
  },
  { label: "จัดการแพ็กเกจ", icon: <LifebuoyIcon />, href: "/admin/packages" },
  { label: "ตั้งค่าระบบ", icon: <GearIcon />, href: "/admin/settings" },
  { label: "Synonym & Keyword", icon: <BookIcon />, href: "/admin/synonyms" },
];

function SignIn() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={styles.signin}>
      <form className={styles.signinCard} onSubmit={submit}>
        <span className={styles.logo} style={{ color: "var(--navy-950)" }}>
          CYBER<span>JOB</span>
        </span>
        <h1>เข้าสู่ระบบผู้ดูแลระบบ</h1>
        {/* หน้านี้เป็นทางเข้าชั่วคราว – หน้า Login จริงพร้อม MFA อยู่ใน Feature 1 */}
        <p>ใช้บัญชีที่มีสิทธิ์ผู้ดูแลระบบเท่านั้น</p>
        {error && (
          <div className={styles.signinError} role="alert">
            {error}
          </div>
        )}
        <input
          type="email"
          autoComplete="username"
          placeholder="อีเมล"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </main>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { status, user } = useAdminAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => setOpen(false), [pathname]);

  if (status === "checking") return <div className={styles.checking}>กำลังตรวจสอบสิทธิ์...</div>;
  if (status === "signed-out") return <SignIn />;

  const isActive = (href?: string) =>
    Boolean(href && (pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`))));

  const renderLink = (item: NavLink) => {
    const content = (
      <>
        {item.icon}
        <span className={styles.navLabel}>{item.label}</span>
      </>
    );
    if (!item.href) {
      return (
        <span key={item.label} className={styles.navItem} aria-disabled="true" title="ยังไม่เปิดใช้งาน">
          {content}
          <span className={styles.soon}>เร็ว ๆ นี้</span>
        </span>
      );
    }
    return (
      <Link
        key={item.label}
        href={item.href}
        className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
        aria-current={isActive(item.href) ? "page" : undefined}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className={styles.shell}>
      {open && <button type="button" className={styles.backdrop} aria-label="ปิดเมนู" onClick={() => setOpen(false)} />}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHead}>
          <Link href="/" className={styles.logo}>
            CYBER<span>JOB</span>
          </Link>
          <button type="button" className={styles.iconButton} aria-label="ปิดเมนู" onClick={() => setOpen(false)}>
            <MenuIcon size={22} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="เมนูหลัก">
          {NAV.map((item) => {
            if (!item.children) return renderLink(item);
            // กลุ่มที่มีหน้าปัจจุบันอยู่จะกางให้ตั้งแต่แรก
            const isOpen = expanded[item.label] ?? item.children.some((child) => isActive(child.href));
            return (
              <div key={item.label}>
                <button
                  type="button"
                  className={styles.navItem}
                  aria-expanded={isOpen}
                  onClick={() => setExpanded((prev) => ({ ...prev, [item.label]: !isOpen }))}
                >
                  {item.icon}
                  <span className={styles.navLabel}>{item.label}</span>
                  <ChevronIcon size={16} dir={isOpen ? "up" : "down"} />
                </button>
                {isOpen && <div className={styles.submenu}>{item.children.map(renderLink)}</div>}
              </div>
            );
          })}
        </nav>

        <div className={styles.version}>
          Cyber Job v1.0
          <br />© 2026 All rights reserved
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.mobileMenu}`}
            aria-label="เปิดเมนู"
            onClick={() => setOpen(true)}
          >
            <MenuIcon size={22} />
          </button>
          <span className={`${styles.iconButton} ${styles.bell}`} aria-label="การแจ้งเตือน" role="img">
            <BellIcon size={22} />
          </span>
          <span className={styles.account}>
            <span className={styles.avatar} aria-hidden>
              {(user?.name ?? "A").charAt(0).toUpperCase()}
            </span>
            Admin
          </span>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
