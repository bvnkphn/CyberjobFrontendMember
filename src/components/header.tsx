"use client";
import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "./brand";
import { Icon, type IconName } from "./icons";
import { ensureDemoSession, getProfile, hasAccessToken, logout } from "@/lib/member-api";

const accountLinks: [IconName, string, string][] = [
  ["user", "โปรไฟล์", "/profile"], ["edit", "แก้ไขประวัติ", "/profile/edit"],
  ["preview", "ดูตัวอย่างประวัติ", "/profile/preview"], ["briefcase", "งานของฉัน", "/my-jobs"],
  ["mail", "คำเชิญจากบริษัท", "/invitations"], ["logout", "ออกจากระบบ", "#logout"],
];

export function Header() {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  useEffect(() => { void ensureDemoSession(); }, []);

  const openResume = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setNavOpen(false);
    await ensureDemoSession();
    if (!hasAccessToken()) { router.push("/register"); return; }
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

  return <header className="site-header"><div className="header-inner"><Brand />
    <button className="mobile-menu-button" type="button" aria-label="เปิดเมนูหลัก" aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}><Icon name="menu" /></button>
    <nav className={`main-nav ${navOpen ? "is-open" : ""}`} aria-label="เมนูหลัก">
      <Link href="/">หน้าแรก</Link><Link href="/jobs">ค้นหางาน</Link><Link href="/profile/edit" onClick={openResume}>ฝากประวัติ</Link><Link href="/articles">บทความ</Link><Link href="/about">เกี่ยวกับเรา</Link><Link href="/contact">ติดต่อเรา</Link>
      <button type="button" className="language-button">ภาษาไทย <Icon name="chevron" /></button>
    </nav>
    <div className="account-wrap"><button className="account-button" type="button" aria-label="เปิดเมนูบัญชี" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)}><Icon name="user" /></button>
      {accountOpen && <nav className="account-menu" aria-label="เมนูบัญชี">{accountLinks.map(([icon,label,href]) => <Link className={icon === "logout" ? "danger" : ""} href={href} onClick={icon === "logout" ? signOut : undefined} key={label}><Icon name={icon} />{label}</Link>)}</nav>}
    </div>
  </div></header>;
}
