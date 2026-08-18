"use client";
import { useState } from "react";
import Link from "next/link";
import { Brand } from "./brand";
import { Icon, type IconName } from "./icons";

const accountLinks: [IconName, string, string][] = [
  ["user", "โปรไฟล์", "/profile"], ["edit", "แก้ไขประวัติ", "/profile/edit"],
  ["preview", "ดูตัวอย่างประวัติ", "/profile/preview"], ["briefcase", "งานของฉัน", "/my-jobs"],
  ["mail", "คำเชิญจากบริษัท", "/invitations"], ["logout", "ออกจากระบบ", "#logout"],
];

export function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  return <header className="site-header"><div className="header-inner"><Brand />
    <button className="mobile-menu-button" type="button" aria-label="เปิดเมนูหลัก" aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}><Icon name="menu" /></button>
    <nav className={`main-nav ${navOpen ? "is-open" : ""}`} aria-label="เมนูหลัก">
      <Link href="/">หน้าแรก</Link><Link href="/jobs">ค้นหางาน</Link><Link href="/resume">ฝากประวัติ</Link><Link href="/articles">บทความ</Link><Link href="/about">เกี่ยวกับเรา</Link><Link href="/contact">ติดต่อเรา</Link>
      <button type="button" className="language-button">ภาษาไทย <Icon name="chevron" /></button>
    </nav>
    <div className="account-wrap"><button className="account-button" type="button" aria-label="เปิดเมนูบัญชี" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)}><Icon name="user" /></button>
      {accountOpen && <nav className="account-menu" aria-label="เมนูบัญชี">{accountLinks.map(([icon,label,href]) => <Link className={icon === "logout" ? "danger" : ""} href={href} key={label}><Icon name={icon} />{label}</Link>)}</nav>}
    </div>
  </div></header>;
}
