"use client";

import { useState, type FormEvent } from "react";
import { loginUrl } from "@/lib/config";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { errorMessage, useOwner } from "@/lib/owner";
import styles from "./Settings.module.css";

type Visibility = "public" | "private";
type Notice = { tone: "info" | "error"; text: string } | null;

/** การตั้งค่า (Owner Feature 7) */
export function SettingsView() {
  const { t, language, setLanguage, isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const { me, api, reloadMe, logout: signOut } = useOwner();

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [visibility, setVisibility] = useState<Visibility>(me.company?.isPublic === false ? "private" : "public");
  const [privacyNotice, setPrivacyNotice] = useState<Notice>(null);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<Notice>(null);
  const [deleting, setDeleting] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwords.next.length < 8) {
      setPasswordNotice({ tone: "error", text: t("settings.passwordTooShort") });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordNotice({ tone: "error", text: t("settings.passwordMismatch") });
      return;
    }
    setSavingPassword(true);
    setPasswordNotice(null);
    try {
      await api("/owner/account/password", {
        method: "PATCH",
        body: { currentPassword: passwords.current, newPassword: passwords.next },
      });
      // ระบบเพิกถอน session ทุกอุปกรณ์หลังเปลี่ยนรหัสผ่าน จึงต้องเข้าสู่ระบบใหม่
      setPasswordNotice({
        tone: "info",
        text: L("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่ด้วยรหัสผ่านใหม่", "Password updated. Please sign in again with your new password."),
      });
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => window.location.replace(loginUrl()), 2500);
    } catch (error) {
      setPasswordNotice({ tone: "error", text: errorMessage(error) });
    } finally {
      setSavingPassword(false);
    }
  };

  const savePrivacy = async () => {
    setPrivacyNotice(null);
    try {
      await api("/owner/company/privacy", { method: "PATCH", body: { visibility } });
      await reloadMe();
      setPrivacyNotice({ tone: "info", text: L("บันทึกการตั้งค่าความเป็นส่วนตัวแล้ว", "Privacy settings saved") });
    } catch (error) {
      setPrivacyNotice({ tone: "error", text: errorMessage(error) });
    }
  };

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault();
    setDeleting(true);
    setDeleteNotice(null);
    try {
      await api("/owner/account", {
        method: "DELETE",
        body: { currentPassword: me.user.hasPassword ? deletePassword : undefined, confirm: true },
      });
      await signOut();
    } catch (error) {
      setDeleteNotice({ tone: "error", text: errorMessage(error) });
      setDeleting(false);
    }
  };

  /** ออกจากระบบ (Feature 7.3) – session มาจาก API ฝั่งสมาชิก */
  const logout = async () => {
    setLoggingOut(true);
    await signOut();
  };

  const renderNotice = (notice: Notice) =>
    notice ? (
      <p
        className={`${styles.notice} ${notice.tone === "error" ? styles.noticeError : styles.noticeInfo}`}
        role={notice.tone === "error" ? "alert" : "status"}
      >
        {notice.text}
      </p>
    ) : null;

  const lockIcon = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <span className={styles.pageIcon} aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </span>
        <h1>{t("pageTitle.settings")}</h1>
      </header>

      {/* การเปลี่ยนภาษา (Feature 7.1) */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardIcon} aria-hidden>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
            </svg>
          </span>
          <h2>{L("ภาษา", "Language")}</h2>
        </div>
        <div className={styles.optionList}>
          {(
            [
              { value: "th", title: "ไทย", hint: "แสดงหลังบ้านเป็นภาษาไทย" },
              { value: "en", title: "English", hint: "Show the back office in English" },
            ] as const
          ).map((option) => (
            <label key={option.value} className={`${styles.option} ${language === option.value ? styles.optionSelected : ""}`}>
              <input
                type="radio"
                name="language"
                value={option.value}
                checked={language === option.value}
                onChange={() => setLanguage(option.value)}
              />
              <span>
                <span className={styles.optionTitle}>{option.title}</span>
                <span className={styles.optionHint}>{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* เปลี่ยนรหัสผ่าน (Feature 7.2) */}
      {me.user.hasPassword ? (
        <form className={styles.card} onSubmit={submitPassword}>
          <div className={styles.cardHead}>
            <span className={styles.cardIcon} aria-hidden>
              {lockIcon}
            </span>
            <h2>{t("settings.changePassword")}</h2>
          </div>

          {renderNotice(passwordNotice)}

          <label className={styles.field}>
            <span className={styles.label}>{t("settings.currentPassword")}</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t("settings.newPassword")}</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwords.next}
              onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t("settings.confirmPassword")}</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwords.confirm}
              onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
              required
            />
          </label>

          <button type="submit" className={styles.primaryButton} disabled={savingPassword}>
            {savingPassword ? L("กำลังบันทึก...", "Saving...") : t("settings.updatePassword")}
          </button>
        </form>
      ) : (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardIcon} aria-hidden>
              {lockIcon}
            </span>
            <h2>{t("settings.changePassword")}</h2>
          </div>
          <p className={styles.hint}>
            {L("บัญชีนี้เข้าสู่ระบบด้วย Google จึงไม่มีรหัสผ่านให้เปลี่ยน", "This account signs in with Google, so there is no password to change.")}
          </p>
        </section>
      )}

      {/* ความเป็นส่วนตัว – แสดง/ซ่อนหน้าบริษัทบนเว็บผู้หางาน */}
      {me.company && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardIcon} aria-hidden>
              {lockIcon}
            </span>
            <h2>{t("settings.privacy")}</h2>
          </div>

          {renderNotice(privacyNotice)}

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{t("settings.profileVisibility")}</legend>
            <div className={styles.optionList}>
              {(
                [
                  { value: "public", title: "settings.publicLabel", hint: "settings.publicHint" },
                  { value: "private", title: "settings.privateLabel", hint: "settings.privateHint" },
                ] as const
              ).map((option) => (
                <label key={option.value} className={`${styles.option} ${visibility === option.value ? styles.optionSelected : ""}`}>
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={() => setVisibility(option.value)}
                  />
                  <span>
                    <span className={styles.optionTitle}>{t(option.title)}</span>
                    <span className={styles.optionHint}>{t(option.hint)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="button" className={styles.primaryButton} onClick={savePrivacy}>
            {t("settings.saveChanges")}
          </button>
        </section>
      )}

      {/* ลบบัญชี */}
      <form className={styles.card} onSubmit={deleteAccount}>
        <div className={styles.cardHead}>
          <span className={`${styles.cardIcon} ${styles.cardIconDanger}`} aria-hidden>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.01" />
            </svg>
          </span>
          <h2>{t("settings.deleteAccount")}</h2>
        </div>

        <p className={styles.warning}>{t("settings.deleteWarning")}</p>

        {renderNotice(deleteNotice)}

        {me.user.hasPassword && (
          <label className={styles.field}>
            <span className={styles.label}>{t("settings.currentPassword")}</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              required
            />
          </label>
        )}

        <label className={styles.checkboxRow}>
          <input type="checkbox" checked={deleteAcknowledged} onChange={(event) => setDeleteAcknowledged(event.target.checked)} />
          <span>{t("settings.deleteConfirmLabel")}</span>
        </label>

        <button
          type="submit"
          className={styles.dangerButton}
          disabled={deleting || !deleteAcknowledged || (me.user.hasPassword && deletePassword.length === 0)}
        >
          {deleting ? L("กำลังลบบัญชี...", "Deleting...") : t("settings.deleteButton")}
        </button>
      </form>

      {/* ออกจากระบบ (Feature 7.3) */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={`${styles.cardIcon} ${styles.cardIconDanger}`} aria-hidden>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5M21 12H9" />
            </svg>
          </span>
          <h2>{t("settings.logout")}</h2>
        </div>

        <p className={styles.hint}>{t("settings.logoutHint")}</p>

        <button type="button" className={styles.outlineDangerButton} onClick={logout} disabled={loggingOut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5M21 12H9" />
          </svg>
          {loggingOut ? t("settings.loggingOut") : t("settings.logout")}
        </button>
      </section>
    </div>
  );
}
