"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon, WarningIcon } from "../icons";
import styles from "./ui.module.css";

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}

export function Modal({
  title,
  subtitle,
  wide = false,
  footer,
  onClose,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  useEscape(onClose);
  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={`${styles.modal} ${wide ? styles.modalWide : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.modalHead}>
          <div>
            <h2>{title}</h2>
            {subtitle}
          </div>
          <button type="button" className={styles.closeButton} aria-label="ปิด" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFoot}>{footer}</div>}
      </div>
    </div>
  );
}

/** Pop-up ยืนยันก่อนลบ – ตามชีต "ให้แสดง Pop-up ก่อนยืนยันการลบ" */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  busy: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEscape(onCancel);
  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}
    >
      <div className={styles.confirm} role="alertdialog" aria-modal="true" aria-label={title}>
        <div className={styles.confirmHead}>
          <span className={styles.confirmIcon} aria-hidden>
            <WarningIcon />
          </span>
          <h2>{title}</h2>
        </div>
        <p>{message}</p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.confirmActions}>
          <button type="button" className={styles.button} onClick={onCancel} disabled={busy}>
            ยกเลิก
          </button>
          <button type="button" className={`${styles.button} ${styles.buttonDanger}`} onClick={onConfirm} disabled={busy}>
            {busy ? "กำลังลบ..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
