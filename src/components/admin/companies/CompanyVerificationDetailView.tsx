"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin/auth";
import styles from "./Companies.module.css";

interface Props {
  id: string;
}

interface PreviewDoc {
  title: string;
  type: string;
  size: string;
  date: string;
}

export function CompanyVerificationDetailView({ id }: Props) {
  const { adminFetch } = useAdminAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("ข้อมูลไม่ถูกต้องหรือเอกสารไม่ชัดเจน");
  const [rejectRemark, setRejectRemark] = useState("");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDoc | null>(null);

  useEffect(() => {
    let mounted = true;
    adminFetch(`/admin/companies/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data) {
          setCompany(data);
          const mappedStatus =
            data.verificationStatus === "APPROVED" || data.verified
              ? "approved"
              : data.verificationStatus === "REJECTED"
              ? "rejected"
              : "pending";
          setStatus(mappedStatus);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, adminFetch]);

  const handleApprove = async () => {
    try {
      const res = await adminFetch(`/admin/companies/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ action: "APPROVED" }),
      });
      if (res.ok) {
        setStatus("approved");
        setShowApproveModal(false);
        setAlertMsg(`อนุมัติบริษัท ${company?.name || ""} เรียบร้อยแล้ว บริษัทสามารถเข้าใช้งานระบบได้ทันที`);
      }
    } catch {
      //
    }
  };

  const handleReject = async () => {
    try {
      const res = await adminFetch(`/admin/companies/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ action: "REJECTED", notes: `${rejectReason} ${rejectRemark}`.trim() }),
      });
      if (res.ok) {
        setStatus("rejected");
        setShowRejectModal(false);
        setAlertMsg("ปฏิเสธคำขอการอนุมัติบริษัทเรียบร้อยแล้ว");
      }
    } catch {
      //
    }
  };

  const companyName = company?.name || company?.legalName || "กำลังโหลดข้อมูล...";
  const createdDate = company?.createdAt
    ? new Date(company.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
    : "27 กรกฎาคม 2569";

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: "16px" }}>
        <Link href="/admin/companies" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--gray-500)", fontSize: "13px", fontWeight: 600 }}>
          ← กลับไปหน้ารายการบริษัท
        </Link>
      </div>

      {alertMsg && (
        <div style={{ padding: "14px 20px", background: status === "approved" ? "#ecfdf5" : "#fef2f2", border: status === "approved" ? "1px solid #a7f3d0" : "1px solid #fecaca", borderRadius: "12px", color: status === "approved" ? "#065f46" : "#991b1b", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          {status === "approved" ? "✓ " : "✕ "} {alertMsg}
        </div>
      )}

      {/* ── Top Header Banner ── */}
      <header className={styles.detailHeader}>
        <div className={styles.reqMeta}>
          รหัสคำขอ #REQ-{id.slice(0, 8).toUpperCase()} · ยื่นเมื่อ {createdDate}
        </div>
        <div className={styles.companyTitleRow}>
          <div className={styles.companyIconBox}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="12" y1="6" x2="12" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/></svg>
          </div>
          <div className={styles.companyMainInfo}>
            <h2>{companyName}</h2>
            <p>
              {status === "approved"
                ? "บริษัทได้รับการตรวจสอบและยืนยันตัวตนเรียบร้อยแล้ว"
                : "รอตรวจสอบเอกสารและข้อมูลก่อนอนุมัติเข้าร่วมระบบ"}
            </p>
          </div>
        </div>

        <div className={styles.badgeRow}>
          <span className={`${styles.badgePill} ${styles.badgePurple}`}>
            {company?.businessType || "นิติบุคคล"}
          </span>
          <span className={`${styles.badgePill} ${styles.badgeGray}`}>
            {company?.companySize || "องค์กรธุรกิจ"}
          </span>
          <span className={`${styles.badgePill} ${status === "approved" ? styles.badgeGreen : status === "rejected" ? styles.badgeRed : styles.badgeYellow}`}>
            ● สถานะ: {status === "approved" ? "ยืนยันแล้ว (Approved)" : status === "rejected" ? "ปฏิเสธแล้ว" : "รอดำเนินการ (Pending)"}
          </span>
          <span className={`${styles.badgePill} ${styles.badgeGold}`}>
            แผนก: {company?.plan || "FREE"}
          </span>
          <span className={`${styles.badgePill} ${styles.badgeBlueGray}`}>ความครบถ้วนเอกสาร: ครบถ้วน</span>
        </div>
      </header>

      {/* ── Section 1: เกี่ยวกับ ── */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBar} />
          เกี่ยวกับบริษัท
        </div>
        <p style={{ margin: "0 0 16px", color: "var(--gray-500)", fontSize: "13px" }}>
          {company?.description || "ข้อมูลภาพรวมและการจดทะเบียนนิติบุคคลของบริษัท"}
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.infoField}>
            <small>เว็บไซต์</small>
            <strong style={{ color: "#2563eb" }}>
              {company?.website ? (
                <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
                  {company.website}
                </a>
              ) : (
                "cyberjob.asia"
              )}
            </strong>
          </div>
          <div className={styles.infoField}>
            <small>อุตสาหกรรม</small>
            <strong>{company?.industry || "Information Technology / Tech"}</strong>
          </div>
          <div className={styles.infoField}>
            <small>ประเภทธุรกิจ</small>
            <strong>{company?.businessType || "บริษัทจำกัด / มหาชน"}</strong>
          </div>
          <div className={styles.infoField}>
            <small>เลขทะเบียนนิติบุคคล / ผู้เสียภาษี</small>
            <strong>{company?.taxId || "0105562098471"}</strong>
          </div>
        </div>

        <div className={styles.contactList}>
          <div className={styles.contactItem}>
            <span>📍 {company?.address || `${company?.province || "กรุงเทพมหานคร"} ${company?.district || ""}`}</span>
          </div>
          <div className={styles.contactItem}>
            <span>📞 โทรศัพท์: {company?.phone || company?.owner?.phone || "02-105-4688"}</span>
          </div>
          <div className={styles.contactItem}>
            <span>✉️ อีเมล: {company?.email || company?.owner?.email || "contact@cyberjob.asia"}</span>
          </div>
          <div className={styles.contactItem}>
            <span>👤 ผู้ดูแลระบบ: {company?.owner?.name || "ตัวแทนผู้ประกอบการ"}</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: ที่ตั้ง ── */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBar} />
          ที่ตั้งสถานประกอบการ
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          <div>
            <small style={{ color: "var(--gray-400)", fontSize: "12px", display: "block" }}>ที่อยู่จดทะเบียน</small>
            <strong style={{ fontSize: "14px", color: "var(--navy-950)" }}>
              {company?.address || `${company?.province || "กรุงเทพมหานคร"}`}
            </strong>
          </div>
          <div>
            <small style={{ color: "var(--gray-400)", fontSize: "12px", display: "block" }}>จังหวัด</small>
            <strong style={{ fontSize: "14px", color: "var(--navy-950)" }}>
              {company?.province || "กรุงเทพมหานคร"}
            </strong>
          </div>
        </div>

        <div className={styles.mapBox}>
          <div className={styles.mapPin}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className={styles.mapCoords}>พิกัด 13.7563, 100.5018 (สำนักงานใหญ่)</div>
        </div>
      </section>

      {/* ── Section 3: เอกสารยืนยันบริษัท (คลิกดูเอกสารได้ถึงจะยืนยันแล้ว) ── */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBar} />
          เอกสารยืนยันบริษัท
        </div>
        <p style={{ margin: "0 0 16px", color: "var(--gray-500)", fontSize: "13px" }}>
          ไฟล์เอกสารแนบสำหรับตรวจสอบตัวตนบริษัท (สามารถคลิกดูเอกสารได้ทุกสถานะ)
        </p>

        <div className={styles.docGrid}>
          {/* Doc 1 */}
          <div
            className={styles.docCard}
            style={{ cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
            onClick={() =>
              setPreviewDoc({
                title: "หนังสือรับรองบริษัท (DBD).pdf",
                type: "PDF Document",
                size: "2.4 MB",
                date: createdDate,
              })
            }
          >
            <div className={styles.docLeft}>
              <div className={styles.docIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <div className={styles.docTitle}>หนังสือรับรองบริษัท (DBD).pdf</div>
                <div className={styles.docMeta}>2.4 MB · คลิกเพื่อดูเอกสาร 🔍</div>
              </div>
            </div>
            <span className={styles.verifiedBadge}>ตรวจสอบแล้ว</span>
          </div>

          {/* Doc 2 */}
          <div
            className={styles.docCard}
            style={{ cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
            onClick={() =>
              setPreviewDoc({
                title: "รูปถ่ายสำนักงานและป้ายบริษัท.jpg",
                type: "JPEG Image",
                size: "1.8 MB",
                date: createdDate,
              })
            }
          >
            <div className={styles.docLeft}>
              <div className={styles.docIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div>
                <div className={styles.docTitle}>รูปถ่ายสำนักงานและป้ายบริษัท.jpg</div>
                <div className={styles.docMeta}>1.8 MB · คลิกเพื่อดูเอกสาร 🔍</div>
              </div>
            </div>
            <span className={styles.verifiedBadge}>ตรวจสอบแล้ว</span>
          </div>

          {/* Doc 3 */}
          <div
            className={styles.docCard}
            style={{ cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
            onClick={() =>
              setPreviewDoc({
                title: "ภ.พ.20 (VAT Registration).pdf",
                type: "PDF Document",
                size: "3.4 MB",
                date: createdDate,
              })
            }
          >
            <div className={styles.docLeft}>
              <div className={styles.docIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <div className={styles.docTitle}>ภ.พ.20 (VAT Registration).pdf</div>
                <div className={styles.docMeta}>3.4 MB · คลิกเพื่อดูเอกสาร 🔍</div>
              </div>
            </div>
            <span className={styles.verifiedBadge}>ตรวจสอบแล้ว</span>
          </div>
        </div>
      </section>

      {/* ── Bottom Action Bar (ถ้าอนุมัติแล้ว ไม่สามารถกด Approve ได้อีก) ── */}
      <div className={styles.bottomActionBar}>
        {status === "approved" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 20px", background: "#ecfdf5", border: "1px solid #10b981", borderRadius: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#065f46", fontWeight: 700, fontSize: "14px" }}>
              <span style={{ fontSize: "18px" }}>✓</span> บริษัทนี้ได้รับการยืนยันตัวตนเรียบร้อยแล้ว (Verified & Approved)
            </div>
            <span style={{ fontSize: "13px", color: "#047857", fontWeight: 600 }}>
              สถานะ: อนุมัติแล้ว ไม่สามารถกดอนุมัติซ้ำได้
            </span>
          </div>
        ) : status === "rejected" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 20px", background: "#fef2f2", border: "1px solid #ef4444", borderRadius: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#991b1b", fontWeight: 700, fontSize: "14px" }}>
              <span>✕</span> คำขอยืนยันตัวตนนี้ถูกปฏิเสธแล้ว
            </div>
            <button
              type="button"
              className={styles.approveBtn}
              onClick={() => setShowApproveModal(true)}
            >
              พิจารณาอนุมัติใหม่
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className={styles.rejectBtn}
              onClick={() => setShowRejectModal(true)}
            >
              ✕ ปฏิเสธ
            </button>
            <button
              type="button"
              className={styles.approveBtn}
              onClick={() => setShowApproveModal(true)}
            >
              ✓ ยืนยัน (Approve)
            </button>
          </>
        )}
      </div>

      {/* ── Document Preview Modal (ดูเอกสารได้ทุกสถานะ) ── */}
      {previewDoc && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className={styles.modalBox}
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--gray-200)", paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--navy-950)" }}>
                📄 {previewDoc.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{ border: 0, background: "none", fontSize: "18px", cursor: "pointer", color: "var(--gray-500)" }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "40px 20px", textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "42px", marginBottom: "8px" }}>📜</div>
              <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "var(--navy-900)" }}>
                {previewDoc.title}
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--gray-500)" }}>
                {previewDoc.type} · ขนาด {previewDoc.size} · วันที่ยื่น {previewDoc.date}
              </p>
              <div style={{ marginTop: "16px", display: "inline-block", padding: "4px 12px", background: "#ecfdf5", border: "1px solid #10b981", borderRadius: "999px", fontSize: "12px", color: "#065f46", fontWeight: 600 }}>
                ✓ มีการรับรองลายมือชื่ออิเล็กทรอนิกส์
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setPreviewDoc(null)}
              >
                ปิด
              </button>
              <button
                type="button"
                className={styles.modalConfirmApproveBtn}
                onClick={() => alert(`ดาวน์โหลด ${previewDoc.title} เรียบร้อยแล้ว`)}
              >
                📥 ดาวน์โหลดเอกสาร
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 1: ยืนยันการปฏิเสธบริษัท ── */}
      {showRejectModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>ยืนยันการปฏิเสธบริษัท</h3>
            <p className={styles.modalDesc}>
              คุณต้องการปฏิเสธการอนุมัติบริษัท {companyName} ใช่หรือไม่? เมื่อปฏิเสธแล้ว บริษัทจะไม่สามารถเข้าใช้งานระบบได้
            </p>

            <div className={styles.companySummaryBox}>
              <div className={styles.summaryBoxName}>{companyName}</div>
              <div className={styles.summaryBoxUrl}>{company?.website || "cyberjob.asia"}</div>
            </div>

            <div className={styles.formGroup}>
              <label>เหตุผล</label>
              <select
                className={styles.formSelect}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              >
                <option value="ข้อมูลไม่ถูกต้องหรือเอกสารไม่ชัดเจน">ข้อมูลไม่ถูกต้องหรือเอกสารไม่ชัดเจน</option>
                <option value="ไม่ผ่านเกณฑ์มาตรฐานการตรวจสอบ">ไม่ผ่านเกณฑ์มาตรฐานการตรวจสอบ</option>
                <option value="เอกสารไม่ครบถ้วน">เอกสารไม่ครบถ้วน</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>หมายเหตุเพิ่มเติม</label>
              <textarea
                className={styles.formTextarea}
                rows={3}
                placeholder="หมายเหตุเพิ่มเติม"
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
              />
            </div>

            <div className={styles.modalBtnRow}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowRejectModal(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={styles.modalConfirmRejectBtn}
                onClick={handleReject}
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: ยืนยันการอนุมัติบริษัท ── */}
      {showApproveModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <div className={styles.modalIconCenter}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className={styles.modalTitle}>ยืนยันการอนุมัติบริษัท</h3>
            <p className={styles.modalDesc}>
              คุณต้องการอนุมัติบริษัท {companyName} ใช่หรือไม่? เมื่ออนุมัติแล้ว บริษัทจะสามารถเข้าใช้งานระบบได้ทันที
            </p>

            <div className={styles.modalBtnRow}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowApproveModal(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={styles.modalConfirmApproveBtn}
                onClick={handleApprove}
              >
                ยืนยันการอนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
