"use client";

import { useCallback, useEffect, useState } from "react";
import type { LanguageKey } from "@/lib/i18n/LanguageContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "./AppShell.module.css";

interface AppShellProps {
  /** ข้อความตรง ๆ – ใช้เมื่อหัวข้อไม่ต้องแปล */
  title?: string;
  /** คีย์พจนานุกรม – ใช้เมื่อหัวข้อต้องเปลี่ยนตามภาษา */
  titleKey?: LanguageKey;
  children: React.ReactNode;
}

export default function AppShell({ title, titleKey, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleToggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.body}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={handleCloseMobile}
        />
        {mobileOpen && (
          <div
            className={styles.backdrop}
            onClick={handleCloseMobile}
            aria-hidden="true"
          />
        )}
        <div className={styles.content}>
          <Topbar
            title={title}
            titleKey={titleKey}
            onToggleMobile={handleToggleMobile}
          />
          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </div>
  );
}
