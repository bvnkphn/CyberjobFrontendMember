"use client";
import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "./brand";
import { Icon } from "./icons";
import { useLanguage } from "./language-provider";
import "./profile/profile-editor.css";

export function Header() {
  const { locale, toggleLocale } = useLanguage();
  const router = useRouter();

  const [navOpen, setNavOpen] = useState(false);

  const openResume = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setNavOpen(false);
    router.push("/profile/edit");
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

        <Link
          href="/profile"
          className="auth-simulated-profile"
          aria-label={locale === "th" ? "โปรไฟล์" : "Profile"}
          title={locale === "th" ? "โปรไฟล์" : "Profile"}
        >
          <Icon name="user" />
        </Link>
      </div>
    </header>
  );
}
