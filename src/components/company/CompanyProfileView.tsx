"use client";

import Link from "next/link";
import { CompanyLogo, Notice, resolveUploadUrl } from "@/components/ui/ui";
import { COMPANY_TYPE_LABEL, formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useOwner } from "@/lib/owner";
import styles from "./Company.module.css";

const VERIFICATION_LABEL = {
  not_submitted: { th: "ยังไม่ได้ส่งข้อมูล", en: "Not submitted" },
  pending: { th: "รอตรวจสอบ", en: "Pending review" },
  approved: { th: "ยืนยันแล้ว", en: "Verified" },
  rejected: { th: "ไม่ผ่านการตรวจสอบ", en: "Rejected" },
} as const;

/** โปรไฟล์บริษัท (Owner Feature 3.1) */
export function CompanyProfileView() {
  const { isEn } = useLanguage();
  const L = (th: string, en: string) => (isEn ? en : th);
  const { me } = useOwner();
  const company = me.company;

  if (!company) return null;

  const mapSrc = company.location
    ? `https://maps.google.com/maps?q=${company.location.lat},${company.location.lng}&z=15&output=embed`
    : null;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div
          className={styles.cover}
          style={company.coverImage ? { backgroundImage: `url("${resolveUploadUrl(company.coverImage)}")` } : undefined}
          aria-hidden
        />
        <div className={styles.heroBody}>
          <div className={styles.logoWrap}>
            <CompanyLogo company={company} size={96} />
          </div>
          <div className={styles.heroText}>
            <h1>{company.name}</h1>
            <p>
              {isEn ? COMPANY_TYPE_LABEL[company.companyType].en : COMPANY_TYPE_LABEL[company.companyType].th} ·{" "}
              {company.businessType}
            </p>
            <span className={`${styles.status} ${styles[company.verificationStatus]}`}>
              {company.verificationStatus === "approved" ? "✓ " : ""}
              {isEn ? VERIFICATION_LABEL[company.verificationStatus].en : VERIFICATION_LABEL[company.verificationStatus].th}
            </span>
          </div>
          <div className={styles.heroActions}>
            {company.memberUrl && (
              <a className={styles.secondary} href={company.memberUrl} target="_blank" rel="noreferrer">
                {L("ดูหน้าบริษัทบนเว็บ ↗", "View public page ↗")}
              </a>
            )}
            <Link className={styles.primary} href="/company/edit">
              {L("แก้ไขโปรไฟล์", "Edit profile")}
            </Link>
          </div>
        </div>
      </section>

      {!company.isPublic && (
        <Notice tone="info">
          {L("หน้าบริษัทถูกตั้งเป็นส่วนตัว ผู้หางานจะค้นหาหน้าบริษัทไม่เจอ (ตั้งค่าได้ที่หน้าการตั้งค่า)", "Your company page is private and hidden from search (change it in Settings).")}
        </Notice>
      )}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>{L("เกี่ยวกับบริษัท", "About")}</h2>
          <p className={styles.about}>{company.about || L("ยังไม่ได้เพิ่มข้อมูลเกี่ยวกับบริษัท", "No description yet")}</p>

          <h2 className={styles.spaced}>{L("รูปภาพ", "Gallery")}</h2>
          {company.gallery.length ? (
            <div className={styles.gallery}>
              {company.gallery.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={resolveUploadUrl(url) || url} alt="" loading="lazy" />
              ))}
            </div>
          ) : (
            <p className={styles.muted}>{L("ยังไม่มีรูปภาพ", "No images yet")}</p>
          )}
        </section>

        <aside className={styles.side}>
          <section className={styles.card}>
            <h2>{L("ช่องทางการติดต่อ", "Contact")}</h2>
            <dl className={styles.definitions}>
              <dt>{L("เบอร์โทร", "Phone")}</dt>
              <dd>{company.phone || "-"}</dd>
              <dt>{L("อีเมล", "Email")}</dt>
              <dd>{company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : "-"}</dd>
              <dt>{L("เว็บไซต์", "Website")}</dt>
              <dd>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noreferrer">
                    {company.website}
                  </a>
                ) : (
                  "-"
                )}
              </dd>
              <dt>{L("จำนวนพนักงาน", "Employees")}</dt>
              <dd>{company.employeeCount ?? "-"}</dd>
            </dl>
          </section>

          <section className={styles.card}>
            <h2>{L("ที่อยู่บริษัท", "Address")}</h2>
            <p>
              {company.address}
              {company.district ? ` ${company.district}` : ""} {company.province}
            </p>
            {mapSrc ? (
              <iframe className={styles.map} title={L("แผนที่บริษัท", "Company map")} src={mapSrc} loading="lazy" referrerPolicy="no-referrer" />
            ) : company.mapUrl ? (
              <a href={company.mapUrl} target="_blank" rel="noreferrer">
                {L("เปิดใน Google Maps ↗", "Open in Google Maps ↗")}
              </a>
            ) : (
              <p className={styles.muted}>{L("ยังไม่ได้ใส่ลิงก์แผนที่", "No map link yet")}</p>
            )}
          </section>

          <section className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <h2 style={{ margin: 0 }}>{L("ข้อมูลการยืนยันบริษัท", "Verification details")}</h2>
              <div>
                {company.verificationStatus === "approved" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "20px", background: "#ecfdf5", color: "#059669", fontSize: "11.5px", fontWeight: "600", border: "1px solid #a7f3d0" }}>
                    ✓ {L("ยืนยันแล้ว", "Approved")}
                  </span>
                ) : company.verificationStatus === "pending" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "20px", background: "#fffbeb", color: "#d97706", fontSize: "11.5px", fontWeight: "600", border: "1px solid #fde68a" }}>
                    ⏳ {L("รอการตรวจสอบ", "Pending")}
                  </span>
                ) : company.verificationStatus === "rejected" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "20px", background: "#fef2f2", color: "#dc2626", fontSize: "11.5px", fontWeight: "600", border: "1px solid #fecaca" }}>
                    ✕ {L("ไม่ผ่านการอนุมัติ", "Rejected")}
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "20px", background: "#f1f5f9", color: "#64748b", fontSize: "11.5px", fontWeight: "600", border: "1px solid #cbd5e1" }}>
                    {L("ยังไม่ยืนยัน", "Unverified")}
                  </span>
                )}
              </div>
            </div>
            <dl className={styles.definitions}>
              <dt>{L("เลขทะเบียน", "Registration no.")}</dt>
              <dd>{company.registrationNumber ?? "-"}</dd>
              <dt>{L("ผู้ติดต่อ", "Contact person")}</dt>
              <dd>
                {company.contactName ?? "-"}
                {company.contactPosition ? ` (${company.contactPosition})` : ""}
              </dd>
              {company.contactPhone && (
                <>
                  <dt>{L("เบอร์ผู้ติดต่อ", "Contact phone")}</dt>
                  <dd>{company.contactPhone}</dd>
                </>
              )}
              <dt>{L("ส่งข้อมูลเมื่อ", "Submitted")}</dt>
              <dd>{company.verificationSubmittedAt ? formatDate(company.verificationSubmittedAt) : "-"}</dd>
            </dl>
            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--color-gray-100)" }}>
              <Link
                href="/company/edit#verification"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12.5px",
                  color: "#0284c7",
                  fontWeight: "600",
                  textDecoration: "none"
                }}
              >
                <span>✏️ {L("แก้ไข / ส่งข้อมูลยืนยันบริษัท", "Edit / Submit verification details")} →</span>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
