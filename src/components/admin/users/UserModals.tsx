"use client";

import { useEffect, useState } from "react";
import { readError, useAdminAuth } from "@/lib/admin/auth";
import type { AdminUser, CandidateSource, CertificateList, Resume, UserDetail } from "@/lib/types";
import { AwardIcon } from "../icons";
import { Modal } from "../ui/Modal";
import ui from "../ui/ui.module.css";
import styles from "./Users.module.css";

export const SOURCE_OPTIONS: { value: CandidateSource; label: string }[] = [
  { value: "OUTSIDER", label: "คนภายนอก" },
  { value: "CYBERPAY_INTERN", label: "เด็กฝึกจาก Cyberpay" },
];

/** โหลดข้อมูลของ modal ครั้งเดียวตอนเปิด */
function useModalData<T>(path: string) {
  const { adminFetch } = useAdminAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    void adminFetch(path)
      .then(async (response) => {
        if (!response.ok) throw await readError(response, "โหลดข้อมูลไม่สำเร็จ");
        return (await response.json()) as T;
      })
      .then((value) => alive && setData(value))
      .catch((reason: unknown) => alive && setError(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ"));
    return () => {
      alive = false;
    };
  }, [adminFetch, path]);

  return { data, error };
}

function Loading({ error }: { error: string }) {
  return error ? (
    <p className={ui.error} role="alert">
      {error}
    </p>
  ) : (
    <p className={ui.empty}>กำลังโหลด...</p>
  );
}

/* ---------------------------------------------------------------- */
/* Popup "ดู Resume"                                                 */
/* ---------------------------------------------------------------- */

export function ResumeModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const { data, error } = useModalData<Resume>(`/admin/users/${user.id}/resume`);

  return (
    <Modal title={`Resume · ${user.code}`} wide onClose={onClose}>
      {!data ? (
        <Loading error={error} />
      ) : (
        <>
          {/* Header matching User Resume Preview */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--navy-900)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: "22px",
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              {data.contact.name ? data.contact.name.charAt(0) : "U"}
            </div>
            <div>
              <h2 className={styles.resumeName} style={{ margin: 0, fontSize: "22px" }}>
                {data.contact.name}
              </h2>
              <p style={{ margin: "2px 0 0", color: "#b45309", fontWeight: 600, fontSize: "14px" }}>
                {data.desiredPositions[0] || "ผู้สมัครงานทั่วไป"}
              </p>
            </div>
          </div>

          <div className={styles.contactLine}>
            <span>📧 {data.contact.email}</span>
            {data.contact.phone && <span>📞 {data.contact.phone}</span>}
            {data.contact.address && <span>📍 {data.contact.address}</span>}
          </div>

          <div className={styles.resumeGrid}>
            <div>
              <section className={styles.resumeSection}>
                <h3>เป้าหมายทางอาชีพ</h3>
                <span className={styles.muted}>ตำแหน่งที่ต้องการ</span>
                {data.desiredPositions.length ? (
                  <div className={styles.chips}>
                    {data.desiredPositions.map((position) => (
                      <span key={position} className={styles.chip}>
                        {position}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.muted}>ยังไม่ได้ระบุ</p>
                )}
              </section>

              <section className={styles.resumeSection}>
                <h3>การศึกษา</h3>
                {data.educations.length ? (
                  data.educations.map((education) => (
                    <div key={`${education.institution}-${education.year}`} style={{ marginBottom: 12 }}>
                      <p className={styles.eduTitle}>
                        {education.degree}
                        {education.major ? ` สาขา${education.major}` : ""}
                      </p>
                      <span className={styles.muted}>{education.institution}</span>
                      <div className={styles.eduMeta}>
                        <span>{education.year ?? ""}</span>
                        {education.gpa && <span className={styles.gpa}>GPA: {education.gpa}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.muted}>ยังไม่ได้ระบุ</p>
                )}
              </section>

              <section className={styles.resumeSection}>
                <h3>ทักษะเฉพาะทาง</h3>
                {data.specialties.length ? (
                  <ul className={styles.list}>
                    {data.specialties.map((specialty) => (
                      <li key={specialty}>{specialty}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.muted}>ยังไม่ได้ระบุ</p>
                )}
                {data.languages.length > 0 && (
                  <>
                    <p className={styles.muted} style={{ margin: "14px 0 6px" }}>
                      ภาษา
                    </p>
                    {data.languages.map((language) => (
                      <div key={language.name} className={styles.languageRow}>
                        <span>{language.name}</span>
                        <span>{language.level}</span>
                      </div>
                    ))}
                  </>
                )}
              </section>
            </div>

            <div>
              <section className={styles.resumeSection}>
                <h3>ประสบการณ์การทำงาน</h3>
                {data.workExperiences.length ? (
                  <div className={styles.timeline}>
                    {data.workExperiences.map((work) => (
                      <div key={`${work.company}-${work.period}`} style={{ marginBottom: 16 }}>
                        <p className={styles.jobTitle}>{work.position}</p>
                        <div className={styles.jobMeta}>
                          <span className={styles.jobCompany}>{work.company}</span>
                          <span>{work.period}</span>
                        </div>
                        {work.description && <p className={styles.paragraph}>{work.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.muted}>ยังไม่มีประสบการณ์การทำงาน</p>
                )}
              </section>

              <section className={styles.resumeSection}>
                <h3>โปรเจกต์และผลงาน</h3>
                {data.projects ? (
                  <p className={styles.paragraph}>{data.projects}</p>
                ) : (
                  <p className={styles.muted}>ยังไม่ได้ระบุ</p>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------------------- */
/* Modal "ใบประกาศนียบัตรของฉัน"                                     */
/* ---------------------------------------------------------------- */

export function CertificatesModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const { data, error } = useModalData<CertificateList>(`/admin/users/${user.id}/certificates`);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  return (
    <>
      <Modal
        title={`ใบประกาศนียบัตร · ${user.name}`}
        subtitle={data && <span className={styles.countLink}>ทั้งหมด {data.total} ใบ (คลิกเพื่อดูเอกสาร)</span>}
        wide
        onClose={onClose}
        footer={
          <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={onClose}>
            ปิด
          </button>
        }
      >
        {!data ? (
          <Loading error={error} />
        ) : data.items.length === 0 ? (
          <p className={ui.empty}>ผู้สมัครรายนี้ยังไม่มีใบประกาศนียบัตร</p>
        ) : (
          <div className={styles.certGrid}>
            {data.items.map((certificate, index) => (
              <article
                key={`${certificate.title}-${index}`}
                className={styles.cert}
                style={{ cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                onClick={() => setSelectedCert(certificate)}
              >
                <div className={styles.certPreview} aria-hidden>
                  <AwardIcon size={36} />
                </div>
                <div className={styles.certBody}>
                  <p className={styles.certTitle} style={{ color: "var(--navy-950)", fontWeight: 700 }}>
                    {certificate.title}
                  </p>
                  {certificate.issuer && <p className={styles.certIssuer}>{certificate.issuer}</p>}
                  {certificate.fileName && (
                    <p className={styles.certFile} style={{ color: "#2563eb", marginTop: "4px" }}>
                      🔍 คลิกเพื่อดูเอกสาร
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal ดูเอกสารประกาศนียบัตร */}
      {selectedCert && (
        <Modal
          title={`ดูเอกสาร: ${selectedCert.title}`}
          subtitle={selectedCert.issuer ? `ออกโดย: ${selectedCert.issuer}` : undefined}
          onClose={() => setSelectedCert(null)}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
              <button
                type="button"
                className={ui.button}
                onClick={() => setSelectedCert(null)}
              >
                ปิด
              </button>
              <button
                type="button"
                className={`${ui.button} ${ui.buttonPrimary}`}
                onClick={() => alert(`ตรวจสอบเอกสาร ${selectedCert.title} เรียบร้อยแล้ว`)}
              >
                📥 ตรวจสอบ / ดาวน์โหลด
              </button>
            </div>
          }
        >
          <div style={{ padding: "30px 20px", textAlign: "center", background: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: "12px", marginBottom: "16px" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>📜</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--navy-950)" }}>
              {selectedCert.title}
            </h3>
            {selectedCert.issuer && (
              <p style={{ margin: "0 0 4px", fontSize: "14px", color: "var(--gray-600)" }}>
                สถาบัน/หน่วยงาน: <strong>{selectedCert.issuer}</strong>
              </p>
            )}
            {selectedCert.fileName && (
              <p style={{ margin: "0", fontSize: "13px", color: "var(--gray-400)" }}>
                ชื่อไฟล์: {selectedCert.fileName}
              </p>
            )}
            <div style={{ marginTop: "16px", display: "inline-block", padding: "4px 12px", background: "#ecfdf5", border: "1px solid #10b981", borderRadius: "999px", fontSize: "12px", color: "#065f46", fontWeight: 600 }}>
              ✓ เอกสารผ่านการรับรองจากผู้สมัคร
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* แก้ไขข้อมูลผู้สมัคร – แก้ได้เฉพาะแหล่งที่มา                       */
/* ---------------------------------------------------------------- */

export function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { adminFetch } = useAdminAuth();
  const { data, error } = useModalData<UserDetail>(`/admin/users/${user.id}`);
  const [source, setSource] = useState<CandidateSource>(user.source);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (data) setSource(data.source);
  }, [data]);

  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const response = await adminFetch(`/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ candidateSource: source }),
      });
      if (!response.ok) throw await readError(response, "บันทึกไม่สำเร็จ");
      onSaved();
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const readonly = (label: string, value: string) => (
    <div className={styles.field}>
      <label>{label}</label>
      <input className={styles.readonly} value={value} readOnly aria-readonly="true" />
    </div>
  );

  return (
    <Modal
      title="แก้ไขข้อมูลผู้สมัคร"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ui.button} onClick={onClose} disabled={saving}>
            ยกเลิก
          </button>
          <button
            type="button"
            className={`${ui.button} ${ui.buttonGold}`}
            onClick={save}
            disabled={!data || saving || source === data.source}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </>
      }
    >
      {!data ? (
        <Loading error={error} />
      ) : (
        <>
          <p className={styles.notice}>
            แก้ไขได้เฉพาะ &quot;แหล่งที่มา&quot; เท่านั้น ฟิลด์อื่นเป็นแบบอ่านอย่างเดียว
          </p>
          {saveError && (
            <p className={ui.error} role="alert">
              {saveError}
            </p>
          )}
          <div className={styles.formGrid}>
            {readonly("UserID", data.code)}
            {readonly("ชื่อผู้สมัคร", data.name)}
            {readonly("Email", data.email)}
            {readonly("เบอร์โทร", data.phone ?? "-")}
            {readonly("อายุงาน", `${data.experienceYears} ปี`)}
            {readonly("ตำแหน่งที่สนใจ", data.desiredPosition ?? "-")}
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="candidate-source">
                แหล่งที่มา <span className={styles.required}>*</span>
              </label>
              <select
                id="candidate-source"
                className={styles.sourceSelect}
                value={source}
                onChange={(event) => setSource(event.target.value as CandidateSource)}
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
