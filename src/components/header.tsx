"use client";
import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // 🌟 เพิ่ม usePathname
import { Brand } from "./brand";
import { Icon, type IconName } from "./icons";
import { ensureDemoSession, getProfile, hasAccessToken, logout, type MemberProfile } from "@/lib/member-api";
import { useLanguage } from "./language-provider";
import "./profile/profile-editor.css";

const accountLinks: [IconName, string, string][] = [
  ["user", "โปรไฟล์", "/profile"], ["edit", "แก้ไขประวัติ", "/profile/edit"],
  ["preview", "ดูตัวอย่างประวัติ", "/profile/preview"], ["briefcase", "งานของฉัน", "/my-jobs"],
  ["mail", "คำเชิญจากบริษัท", "/invitations"], ["logout", "ออกจากระบบ", "#logout"],
];

export function Header() {
  const { locale, toggleLocale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname(); // 🌟 ดึง path ปัจจุบัน

  const [navOpen, setNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  useEffect(() => { ensureDemoSession().then(() => getProfile().then(setProfile).catch(() => undefined)); }, []);
  const personal = profile?.personal ?? {};
  const accountName = [profile?.firstName ?? personal.firstName, profile?.lastName ?? personal.lastName].filter((value) => typeof value === "string" && value.trim()).join(" ");

  // 🌟 ตัวแปรเช็คว่าตอนนี้อยู่หน้า Gate (Login/Register) หรือไม่
  const isGatePage = pathname?.startsWith("/gate");

  const openResume = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setNavOpen(false);
    await ensureDemoSession();
    if (!hasAccessToken()) { router.push("/"); return; }
    try {
      const profile = await getProfile();
      router.push(profile.completion > 0 ? "/profile/preview" : "/profile/edit");
    } catch {
      router.push("/profile/edit");
    }
  };

  const signOut = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    logout();
    setAccountOpen(false);
    router.push("/");
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button className="mobile-menu-button" type="button" aria-label="เปิดเมนูหลัก" aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>
          <Icon name="menu" />
        </button>
        <nav className={`main-nav ${navOpen ? "is-open" : ""}`} aria-label="เมนูหลัก">
          <Link href="/">หน้าแรก</Link><Link href="/jobs">ค้นหางาน</Link><Link href="/profile/edit" onClick={openResume}>ฝากประวัติ</Link><Link href="/articles">บทความ</Link><Link href="/about">เกี่ยวกับเรา</Link><Link href="/contact">ติดต่อเรา</Link>
          <button type="button" className="language-button" data-no-translate onClick={toggleLocale} aria-label={locale === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}>
            {locale === "th" ? "ภาษาไทย" : "English"} <Icon name="chevron" />
          </button>
        </nav>

        {/* 🌟 เงื่อนไขสลับหน้าตาขวาสุดของ Header */}
        {isGatePage ? (
          <div className="gate-actions" style={{ marginLeft: '16px' }}>
            <Link href="/gate/login" className="login-btn-outline">Log in</Link>
          </div>
        ) : (
          <div className="account-wrap">
            <button className="account-button" type="button" aria-label="เปิดเมนูบัญชี" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)}>
              <Icon name="user" />
            </button>
            {accountOpen && (
              <nav className="account-menu" aria-label="เมนูบัญชี">
                <header>
                  <strong data-no-translate>{accountName || (locale === "th" ? "ผู้ใช้งาน CyberJob" : "CyberJob user")}</strong>
                  <span data-no-translate>{profile?.email ?? window.localStorage.getItem("memberEmail") ?? (locale === "th" ? "สมาชิก CyberJob" : "CyberJob member")}</span>
                </header>
                {accountLinks.map(([icon,label,href]) => (
                  <Link className={icon === "logout" ? "danger" : ""} href={href} onClick={icon === "logout" ? signOut : undefined} key={label}>
                    <Icon name={icon} />{label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        )}
      </div>
    </header>
  );
}