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
  VideoIcon,
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
  { label: "วิดีโอแนะนำ (Tutorials)", icon: <VideoIcon />, href: "/admin/tutorials" },
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
  const { status, user, logout } = useAdminAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setOpen(false);
    setShowNotif(false);
    setShowProfile(false);
  }, [pathname]);

  if (status === "checking") return <div className={styles.checking}>กำลังตรวจสอบสิทธิ์...</div>;
  if (status === "signed-out") return <SignIn />;

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderLink = (item: NavLink) => {
    const active = isActive(item.href);
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
        className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className={styles.shell}>
      {(open || showNotif || showProfile) && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="ปิดเมนู"
          onClick={() => {
            setOpen(false);
            setShowNotif(false);
            setShowProfile(false);
          }}
        />
      )}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarHead}>
          <Link href="/" className={styles.logo}>
            CYBER<span>JOB</span>
          </Link>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="ย่อ/ขยายเมนู"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 960) {
                setOpen(false);
              } else {
                setCollapsed((prev) => !prev);
              }
            }}
            title="ย่อ/ขยายแถบเมนู"
          >
            <MenuIcon size={22} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="เมนูหลัก">
          {NAV.map((item) => {
            if (!item.children) return renderLink(item);
            const isChildActive = item.children.some((child) => isActive(child.href));
            const isOpen = expanded[item.label] ?? isChildActive;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  className={`${styles.navItem} ${isChildActive ? styles.navParentActive : ""}`}
                  aria-expanded={isOpen}
                  onClick={() => setExpanded((prev) => ({ ...prev, [item.label]: !isOpen }))}
                >
                  {item.icon}
                  <span className={styles.navLabel}>{item.label}</span>
                  <ChevronIcon size={16} dir={isOpen ? "up" : "down"} />
                </button>
                {isOpen && !collapsed && <div className={styles.submenu}>{item.children.map(renderLink)}</div>}
              </div>
            );
          })}
        </nav>

        <div className={styles.version}>
          Cyber Job v1.0
          <br />© 2026 All rights reserved
        </div>
      </aside>

      <div className={`${styles.workspace} ${collapsed ? styles.workspaceCollapsed : ""}`}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.sidebarToggleBtn}`}
            aria-label="เปิด/ปิดเมนู"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 960) {
                setOpen((prev) => !prev);
              } else {
                setCollapsed((prev) => !prev);
              }
            }}
            title="ย่อ/ขยายแถบเมนู"
          >
            <MenuIcon size={22} />
          </button>

          <div className={styles.topbarActions}>
            {/* Notification Bell Button & Popover */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={`${styles.iconButton} ${styles.bell}`}
                aria-label="การแจ้งเตือน"
                onClick={() => {
                  setShowNotif((prev) => !prev);
                  setShowProfile(false);
                }}
                title="ดูการแจ้งเตือนระบบ"
              >
                <BellIcon size={22} />
              </button>

              {showNotif && (
                <div className={`${styles.popoverMenu} ${styles.notifPopover}`}>
                  <div className={styles.popoverHead}>
                    <h4>การแจ้งเตือนระบบ</h4>
                    <span className={styles.popoverBadge}>3 ใหม่</span>
                  </div>
                  <div className={styles.notifList}>
                    <Link
                      href="/admin/companies"
                      className={styles.notifItem}
                      onClick={() => setShowNotif(false)}
                    >
                      <div className={`${styles.notifIconBox} ${styles.iconBoxGold}`}>🏢</div>
                      <div className={styles.notifText}>
                        <div className={styles.notifTitle}>บริษัทใหม่รอยืนยันตัวตน</div>
                        <div className={styles.notifDesc}>มี 2 บริษัทลงทะเบียนใหม่และส่งเอกสารเพื่อขอ Verification</div>
                        <div className={styles.notifTime}>10 นาทีที่แล้ว</div>
                      </div>
                    </Link>

                    <Link
                      href="/jobs"
                      className={styles.notifItem}
                      onClick={() => setShowNotif(false)}
                    >
                      <div className={`${styles.notifIconBox} ${styles.iconBoxBlue}`}>💼</div>
                      <div className={styles.notifText}>
                        <div className={styles.notifTitle}>ประกาศงานใหม่เข้าระบบ</div>
                        <div className={styles.notifDesc}>มีการโพสต์ตำแหน่งงานใหม่ 5 รายการจากผู้ประกอบการ</div>
                        <div className={styles.notifTime}>1 ชั่วโมงที่แล้ว</div>
                      </div>
                    </Link>

                    <Link
                      href="/packages"
                      className={styles.notifItem}
                      onClick={() => setShowNotif(false)}
                    >
                      <div className={`${styles.notifIconBox} ${styles.iconBoxGreen}`}>💳</div>
                      <div className={styles.notifText}>
                        <div className={styles.notifTitle}>ชำระเงินแพ็กเกจใหม่</div>
                        <div className={styles.notifDesc}>แจ้งการโอนเงินซื้อแพ็กเกจ Pro Enterprise สั่งซื้อใหม่</div>
                        <div className={styles.notifTime}>2 ชั่วโมงที่แล้ว</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Button & Popover */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={styles.accountBtn}
                onClick={() => {
                  setShowProfile((prev) => !prev);
                  setShowNotif(false);
                }}
                title="เมนูผู้ดูแลระบบ"
              >
                <span className={styles.account}>
                  <span className={styles.avatar} aria-hidden>
                    {(user?.name ?? "A").charAt(0).toUpperCase()}
                  </span>
                  <span>{user?.name ?? "Admin"}</span>
                  <ChevronIcon size={14} dir={showProfile ? "up" : "down"} />
                </span>
              </button>

              {showProfile && (
                <div className={`${styles.popoverMenu} ${styles.profilePopover}`}>
                  <div className={styles.profileCard}>
                    <div className={styles.profileBigAvatar}>
                      {(user?.name ?? "A").charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.profileMeta}>
                      <span className={styles.profileName}>{user?.name ?? "ผู้ดูแลระบบ"}</span>
                      <span className={styles.profileEmail}>{user?.email ?? "admin@cyberjob.asia"}</span>
                      <span className={styles.profileRoleBadge}>SUPER ADMIN</span>
                    </div>
                  </div>

                  <div className={styles.profileMenuGroup}>
                    <Link
                      href="/settings"
                      className={styles.profileMenuItem}
                      onClick={() => setShowProfile(false)}
                    >
                      <GearIcon size={16} />
                      <span>ตั้งค่าระบบ (Settings)</span>
                    </Link>

                    <Link
                      href="/synonyms"
                      className={styles.profileMenuItem}
                      onClick={() => setShowProfile(false)}
                    >
                      <BookIcon size={16} />
                      <span>Synonym & Keyword</span>
                    </Link>

                    <Link
                      href="/users"
                      className={styles.profileMenuItem}
                      onClick={() => setShowProfile(false)}
                    >
                      <UsersIcon size={16} />
                      <span>จัดการผู้ใช้ทั้งหมด</span>
                    </Link>

                    <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />

                    <button
                      type="button"
                      className={`${styles.profileMenuItem} ${styles.logoutMenuItem}`}
                      onClick={() => {
                        setShowProfile(false);
                        logout();
                      }}
                    >
                      <span>🚪 ออกจากระบบ (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
