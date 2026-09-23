"use client";

import Link from "next/link";
import { MEMBER_URL } from "@/lib/config";
import { useLanguage, type LanguageKey } from "@/lib/i18n/LanguageContext";
import styles from "./Footer.module.css";

type FooterLink = { key: LanguageKey; href: string; external?: boolean };

const COLUMNS: Array<{ titleKey: LanguageKey; links: FooterLink[] }> = [
  {
    titleKey: "footer.forEmployer",
    links: [
      { key: "footer.allApplicants", href: "/candidates" },
      { key: "footer.bookmark", href: "/candidates/bookmarks" },
      { key: "footer.applicantResponses", href: "/candidates/responses" },
      { key: "footer.invitations", href: "/candidates/invitations" },
    ],
  },
  {
    titleKey: "footer.jobs",
    links: [
      { key: "footer.myJobPostings", href: "/job-postings" },
      { key: "footer.createJobPosting", href: "/job-postings/create" },
    ],
  },
  {
    titleKey: "footer.aboutUs",
    links: [
      { key: "footer.contactUs", href: "/support" },
      { key: "footer.faq", href: "/support#faq" },
      // นโยบายและข้อตกลงใช้หน้าเดียวกับเว็บ member
      { key: "footer.privacyPolicy", href: `${MEMBER_URL}/privacy`, external: true },
      { key: "footer.terms", href: `${MEMBER_URL}/terms`, external: true },
    ],
  },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoCyber}>CYBER</span>
            <span className={styles.logoJob}>JOB</span>
          </div>
          <p className={styles.description}>{t("footer.description")}</p>
        </div>

        <div className={styles.columns}>
          {COLUMNS.map((column) => (
            <div key={column.titleKey} className={styles.column}>
              <h4 className={styles.columnTitle}>{t(column.titleKey)}</h4>
              <ul className={styles.columnList}>
                {column.links.map((link) => (
                  <li key={link.key}>
                    {link.external ? (
                      <a className={styles.columnLink} href={link.href} target="_blank" rel="noreferrer">
                        {t(link.key)}
                      </a>
                    ) : (
                      <Link className={styles.columnLink} href={link.href}>
                        {t(link.key)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <span>{t("footer.copyright")}</span>
      </div>
    </footer>
  );
}
