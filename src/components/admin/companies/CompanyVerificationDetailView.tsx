"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Companies.module.css";

interface Props {
  id: string;
}

export function CompanyVerificationDetailView({ id }: Props) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("ข้อมูลไม่ถูกต้องหรือเอกสารไม่ชัดเจน");
  const [rejectRemark, setRejectRemark] = useState("");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleApprove = () => {
    setStatus("approved");
    setShowApproveModal(false);
    setAlertMsg("อนุมัติบริษัท การไฟฟ้าส่วนภูมิภาค เรียบร้อยแล้ว บริษัทสามารถเข้าใช้งานระบบได้ทันที");
  };

  const handleReject = () => {
    setStatus("rejected");
    setShowRejectModal(false);
    setAlertMsg("ปฏิเสธคำขอการอนุมัติบริษัทเรียบร้อยแล้ว");
  };

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: "16px" }}>
        <Link href="/companies" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--gray-500)", fontSize: "13px", fontWeight: 600 }}>
          ← กลับไปหน้ารายการบริษัทรอยืนยัน
        </Link>
      </div>

      {alertMsg && (
        <div style={{ padding: "14px 20px", background: status === "approved" ? "#ecfdf5" : "#fef2f2", border: status === "approved" ? "1px solid #a7f3d0" : "1px solid #fecaca", borderRadius: "12px", color: status === "approved" ? "#065f46" : "#991b1b", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          {status === "approved" ? "✓ " : "✕ "} {alertMsg}
        </div>
      )}

      {/* ── Top Header Banner (ตามภาพ 3-4) ── */}
      <header className={styles.detailHeader}>
        <div className={styles.reqMeta}>
          รหัสคำขอ #REQ-2569-0142 · ยื่นเมื่อ 27/7/2569
        </div>
        <div className={styles.companyTitleRow}>
          <div className={styles.companyIconBox}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="12" y1="6" x2="12" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/></svg>
          </div>
          <div className={styles.companyMainInfo}>
            <h2>การไฟฟ้าส่วนภูมิภาค</h2>
            <p>รอตรวจสอบเอกสารและข้อมูลก่อนอนุมัติเข้าร่วมระบบ</p>
          </div>
        </div>

        <div className={styles.badgeRow}>
          <span className={`${styles.badgePill} ${styles.badgePurple}`}>รัฐวิสาหกิจ</span>
          <span className={`${styles.badgePill} ${styles.badgeGray}`}>มากกว่า 1,000 คน</span>
          <span className={`${styles.badgePill} ${status === "approved" ? styles.badgeGreen : status === "rejected" ? styles.badgeRed : styles.badgeYellow}`}>
            ● สถานะ: {status === "approved" ? "อนุมัติแล้ว" : status === "rejected" ? "ปฏิเสธแล้ว" : "รอดำเนินการ"}
          </span>
          <span className={`${styles.badgePill} ${styles.badgeGold}`}>รูปแบบ: รัฐวิสาหกิจ Partner</span>
          <span className={`${styles.badgePill} ${styles.badgeGray}`}>Bookmark: 0</span>
          <span className={`${styles.badgePill} ${styles.badgeBlueGray}`}>ความครบถ้วน: 3/4 ส่วน</span>
        </div>
      </header>

      {/* ── Section 1: เกี่ยวกับ ── */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBar} />
          เกี่ยวกับ
        </div>
        <p style={{ margin: "0 0 16px", color: "var(--gray-500)", fontSize: "13px" }}>
          หน่วยงานรัฐวิสาหกิจด้านการให้บริการไฟฟ้าแก่ผู้ใช้ไฟทั่วประเทศ ยกเว้นกรุงเทพฯ และปริมณฑล
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.infoField}>
            <small>เว็บไซต์</small>
            <strong style={{ color: "#2563eb" }}>www.pea.co.th</strong>
          </div>
          <div className={styles.infoField}>
            <small>อุตสาหกรรม</small>
            <strong>Information Technology Services</strong>
          </div>
          <div className={styles.infoField}>
            <small>ประเภทธุรกิจ</small>
            <strong>รัฐวิสาหกิจ</strong>
          </div>
          <div className={styles.infoField}>
            <small>เลขทะเบียนนิติบุคคล</small>
            <strong>0000000000000</strong>
          </div>
        </div>

        <div className={styles.fullText}>
          <strong>รายละเอียด</strong>
          <p style={{ margin: "6px 0 0" }}>
            การไฟฟ้าส่วนภูมิภาค (PEA) เป็นรัฐวิสาหกิจสังกัดกระทรวงมหาดไทย มีภารกิจหลักในการจัดหา ให้บริการพลังงานไฟฟ้า และดำเนินธุรกิจอื่นที่เกี่ยวเนื่อง เพื่อตอบสนองความต้องการของผู้ใช้ไฟฟ้า ให้มีคุณภาพไฟฟ้าที่ดี ทั่วถึง และเพียงพอต่อการพัฒนาเศรษฐกิจของประเทศ
          </p>
        </div>

        <div className={styles.contactList}>
          <div className={styles.contactItem}>
            <span>📍 200 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร 10900</span>
          </div>
          <div className={styles.contactItem}>
            <span>📞 โทรศัพท์ 02-123-4567</span>
          </div>
          <div className={styles.contactItem}>
            <span>✉️ อีเมล contact@pea.co.th</span>
          </div>
          <div className={styles.contactItem}>
            <span>👤 ผู้ติดต่อ คุณอรุณี บุญนาค · HR Manager · 081-234-5678</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: ที่ตั้ง ── */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBar} />
          ที่ตั้ง
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          <div>
            <small style={{ color: "var(--gray-400)", fontSize: "12px", display: "block" }}>ที่อยู่</small>
            <strong style={{ fontSize: "14px", color: "var(--navy-950)" }}>
              200 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร
            </strong>
          </div>
          <div>
            <small style={{ color: "var(--gray-400)", fontSize: "12px", display: "block" }}>จังหวัด</small>
            <strong style={{ fontSize: "14px", color: "var(--navy-950)" }}>
              กรุงเทพมหานคร
            </strong>
          </div>
        </div>

        <div className={styles.mapBox}>
          <div className={styles.mapPin}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className={styles.mapCoords}>พิกัด 13.7563, 100.5018</div>
        </div>
      </section>

      {/* ── Section 3: เอกสารยืนยันบริษัท (ตามภาพ 3-4) ── */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBar} />
          เอกสารยืนยันบริษัท
        </div>
        <p style={{ margin: "0 0 16px", color: "var(--gray-500)", fontSize: "13px" }}>
          ไฟล์แนบสำหรับตรวจสอบตัวตนของบริษัท
        </p>

        <div className={styles.docGrid}>
          <div className={styles.docCard}>
            <div className={styles.docLeft}>
              <div className={styles.docIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <div className={styles.docTitle}>หนังสือรับรองบริษัท.pdf</div>
                <div className={styles.docMeta}>2.1 MB · อัปโหลดแล้ว</div>
              </div>
            </div>
            <span className={styles.verifiedBadge}>ตรวจสอบแล้ว</span>
          </div>

          <div className={styles.docCard}>
            <div className={styles.docLeft}>
              <div className={styles.docIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <div>
                <div className={styles.docTitle}>บัตรประชาชนกรรมการ.jpg</div>
                <div className={styles.docMeta}>3.4 MB · อัปโหลดแล้ว</div>
              </div>
            </div>
            <span className={styles.verifiedBadge}>ตรวจสอบแล้ว</span>
          </div>

          <div className={styles.docCard}>
            <div className={styles.docLeft}>
              <div className={styles.docIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div>
                <div className={styles.docTitle}>รูปถ่ายสำนักงาน.jpg</div>
                <div className={styles.docMeta}>1.8 MB · อัปโหลดแล้ว</div>
              </div>
            </div>
            <span className={styles.verifiedBadge}>ตรวจสอบแล้ว</span>
          </div>

          <div className={styles.docCard}>
            <div className={styles.docLeft}>
              <div className={styles.docIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <div className={styles.docTitle}>ภ.พ.20 (VAT)</div>
                <div className={styles.docMeta}>3.4 MB · อัปโหลดแล้ว</div>
              </div>
            </div>
            <span className={styles.verifiedBadge}>ตรวจสอบแล้ว</span>
          </div>
        </div>
      </section>

      {/* ── Bottom Action Bar (ตามภาพ 3-4) ── */}
      <div className={styles.bottomActionBar}>
        <button
          type="button"
          className={styles.rejectBtn}
          disabled={status !== "pending"}
          onClick={() => setShowRejectModal(true)}
        >
          ✕ ปฏิเสธ
        </button>
        <button
          type="button"
          className={styles.approveBtn}
          disabled={status !== "pending"}
          onClick={() => setShowApproveModal(true)}
        >
          ✓ ยืนยัน (Approve)
        </button>
      </div>

      {/* ── Modal 1: ยืนยันการปฏิเสธบริษัท (ตามภาพ media_1790170198111.png) ── */}
      {showRejectModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>ยืนยันการปฏิเสธบริษัท</h3>
            <p className={styles.modalDesc}>
              คุณต้องการปฏิเสธการอนุมัติบริษัท การไฟฟ้าส่วนภูมิภาค ใช่หรือไม่? เมื่อปฏิเสธแล้ว บริษัทจะไม่สามารถเข้าใช้งานระบบได้
            </p>

            <div className={styles.companySummaryBox}>
              <div className={styles.summaryBoxName}>การไฟฟ้าส่วนภูมิภาค</div>
              <div className={styles.summaryBoxUrl}>www.pea.co.th</div>
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

      {/* ── Modal 2: ยืนยันการอนุมัติบริษัท (ตามภาพ media_1790170198102.png) ── */}
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
              คุณต้องการอนุมัติบริษัท การไฟฟ้าส่วนภูมิภาค ใช่หรือไม่? เมื่ออนุมัติแล้ว บริษัทจะสามารถเข้าใช้งานระบบได้ทันที
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
