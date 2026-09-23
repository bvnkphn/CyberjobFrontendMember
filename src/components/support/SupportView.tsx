"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Notice } from "@/components/ui/ui";
import { fileSize } from "@/lib/format";
import { useLanguage, type LanguageKey } from "@/lib/i18n/LanguageContext";
import { errorMessage, useApi, useOwner } from "@/lib/owner";
import styles from "./Support.module.css";

const LINE_ID = "@cyberjob";
const LINE_URL = "https://lin.ee/qYT9XuK";
const SUPPORT_EMAIL = "support@cyberjob.th";
const SUPPORT_PHONE = "02-123-4567";

const FAQ: { question: LanguageKey; answer: LanguageKey }[] = [
  { question: "support.faq1Q", answer: "support.faq1A" },
  { question: "support.faq2Q", answer: "support.faq2A" },
  { question: "support.faq3Q", answer: "support.faq3A" },
  { question: "support.faq4Q", answer: "support.faq4A" },
];

/** ศูนย์ช่วยเหลือ (Feature 6.1) */
export function SupportView() {
  const { t, isEn } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <span className={styles.pageIcon} aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3.5" />
            <path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9" />
          </svg>
        </span>
        <div>
          <h1>{t("pageTitle.support")}</h1>
          <p>{t("support.subtitle")}</p>
        </div>
      </header>

      <span className={styles.sectionLabel}>{t("support.fastestChannel")}</span>

      <section className={styles.lineCard}>
        <span className={styles.lineLogo} aria-hidden>
          LINE
        </span>

        <div className={styles.lineBody}>
          <div className={styles.lineTitleRow}>
            <h2>{t("support.lineTitle")}</h2>
            <span className={styles.lineBadge}>{t("support.lineBadge")}</span>
          </div>
          <p>{t("support.lineDescription")}</p>
          <span className={styles.lineId}>{LINE_ID}</span>
        </div>

        <a className={styles.qrBox} href={LINE_URL} target="_blank" rel="noopener noreferrer" title="สแกนหรือคลิกเพื่อเพิ่มเพื่อนทาง LINE">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/contact/line-qr.png" alt={t("support.qrAlt")} width={84} height={84} />
        </a>

        <a className={styles.lineCta} href={LINE_URL} target="_blank" rel="noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3C6.9 3 2.8 6.4 2.8 10.5c0 3.7 3.3 6.8 7.7 7.4.3.1.7.2.8.5.1.3.1.6 0 .9l-.1.8c0 .2-.2.9.8.5s5.3-3.1 7.2-5.3c1.3-1.4 2-2.9 2-4.8C21.2 6.4 17.1 3 12 3z" />
          </svg>
          {t("support.lineCta")}
        </a>
      </section>

      <section className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <span
            className={styles.contactIcon}
            style={{ background: "#fdf1dc", color: "var(--color-gold-dark)" }}
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <span>
            <span className={styles.contactLabel}>{t("support.email")}</span>
            <a className={styles.contactValue} href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </span>
        </div>

        <div className={styles.contactCard}>
          <span
            className={styles.contactIcon}
            style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
            </svg>
          </span>
          <span>
            <span className={styles.contactLabel}>{t("support.phone")}</span>
            <a className={styles.contactValue} href={`tel:${SUPPORT_PHONE.replace(/-/g, "")}`}>
              {SUPPORT_PHONE}
            </a>
          </span>
        </div>
      </section>

      <ReportProblem />

      <Link href="/support/tutorials" className={styles.tutorialLink}>
        ▶ {isEn ? "Watch tutorial videos" : "ดูวิดีโอแนะนำการใช้งาน"}
      </Link>

      <section className={styles.faqCard} id="faq">
        <h2>{t("support.faqTitle")}</h2>
        {FAQ.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={item.question} className={styles.faqItem}>
              <button
                type="button"
                className={styles.faqQuestion}
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                {t(item.question)}
                <svg
                  className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ""}`}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {open && <p className={styles.faqAnswer}>{t(item.answer)}</p>}
            </div>
          );
        })}
      </section>
    </div>
  );
}

const MAX_IMAGES = 3;

/** แจ้งปัญหา (Owner Feature 6.2) */
function ReportProblem() {
  const { isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const { me, api } = useOwner();
  const topics = useApi<string[]>("/owner/support/topics");
  const [topic, setTopic] = useState("");
  const [email, setEmail] = useState(me.user.email);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((file) => ["image/png", "image/jpeg"].includes(file.type));
    setImages((current) => [...current, ...accepted].slice(0, MAX_IMAGES));
    if (fileInput.current) fileInput.current.value = "";
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    if (!topic) return setNotice({ tone: "error", text: L("กรุณาเลือกประเภทปัญหา", "Please choose a problem type") });
    if (message.trim().length < 10) {
      return setNotice({ tone: "error", text: L("กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร", "Please describe the problem (10+ characters)") });
    }
    const body = new FormData();
    body.append("topic", topic);
    body.append("email", email);
    body.append("message", message);
    images.forEach((image) => body.append("images", image));
    setSending(true);
    try {
      const result = await api<{ ticketId: string }>("/owner/support/reports", { body });
      setNotice({
        tone: "success",
        text: L(`ได้รับเรื่องแล้ว (เลขที่ ${result.ticketId}) ทีมงานจะติดต่อกลับภายใน 1 วันทำการ`, `Report received (ref ${result.ticketId}). We will reply within 1 business day.`),
      });
      setTopic("");
      setMessage("");
      setImages([]);
    } catch (error) {
      setNotice({ tone: "error", text: errorMessage(error) });
    } finally {
      setSending(false);
    }
  };

  return (
    <form className={styles.reportCard} onSubmit={submit} noValidate>
      <h2>{L("แจ้งปัญหา", "Report a problem")}</h2>
      <p className={styles.reportHint}>{L("บอกเราว่าเกิดอะไรขึ้น แนบภาพหน้าจอได้ถ้ามี", "Tell us what went wrong – screenshots help")}</p>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <div className={styles.reportGrid}>
        <label className={styles.reportField}>
          <span>{L("ประเภทปัญหา", "Problem type")} *</span>
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="">{L("เลือกประเภทปัญหา", "Choose a type")}</option>
            {(topics.data ?? []).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className={styles.reportField}>
          <span>{L("อีเมลสำหรับติดต่อกลับ", "Reply-to email")} *</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
      </div>

      <label className={styles.reportField}>
        <span>{L("รายละเอียดปัญหา", "Details")} *</span>
        <textarea rows={5} maxLength={4000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={L("เช่น กดเผยแพร่ประกาศแล้วขึ้นข้อความผิดพลาด...", "e.g. Publishing a job shows an error...")} />
      </label>

      <div className={styles.reportField}>
        <span>{L("รูปภาพประกอบ (ถ้ามี)", "Screenshots (optional)")}</span>
        <div className={styles.reportImages}>
          {images.map((image, index) => (
            <span key={`${image.name}-${index}`} className={styles.reportImage}>
              {image.name} · {fileSize(image.size)}
              <button type="button" aria-label={L("ลบรูป", "Remove")} onClick={() => setImages((current) => current.filter((_, position) => position !== index))}>
                ×
              </button>
            </span>
          ))}
          {images.length < MAX_IMAGES && (
            <label className={styles.reportAdd}>
              + {L("แนบรูป", "Attach image")}
              <input ref={fileInput} hidden type="file" multiple accept="image/png,image/jpeg" onChange={(event) => addImages(event.target.files)} />
            </label>
          )}
        </div>
        <small>{L("รองรับ PNG, JPG, JPEG สูงสุด 3 รูป รูปละไม่เกิน 5 MB", "PNG, JPG, JPEG · up to 3 images, 5 MB each")}</small>
      </div>

      <button type="submit" className={styles.reportSubmit} disabled={sending}>
        {sending ? L("กำลังส่ง...", "Sending...") : L("แจ้งปัญหา", "Submit report")}
      </button>
    </form>
  );
}
