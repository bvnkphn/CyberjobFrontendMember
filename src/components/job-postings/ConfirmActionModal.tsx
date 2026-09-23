"use client";

import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./ConfirmActionModal.module.css";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant: "warning" | "danger";
  title: string;
  description: string;
  targetName: string;
  confirmLabel: string;
}

export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  variant,
  title,
  description,
  targetName,
  confirmLabel,
}: ConfirmActionModalProps) {
  const { t } = useLanguage();
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headingId = `confirm-action-title-${variant}`;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        data-variant={variant}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.iconWrap}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>

        <p className={styles.message}>
          {description}
          <br />
          <span className={styles.targetName}>"{targetName}"</span>
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            {t("confirm.cancel")}
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            data-variant={variant}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
