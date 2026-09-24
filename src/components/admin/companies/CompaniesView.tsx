"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Companies.module.css";

export interface CompanyVerificationItem {
  id: string;
  name: string;
  location: string;
  appliedDate: string;
  status: "pending" | "approved" | "rejected";
}

export const VERIFICATION_REQUESTS: CompanyVerificationItem[] = [
  { id: "req-01", name: "การไฟฟ้าส่วนภูมิภาค", location: "นนทบุรี", appliedDate: "4/8/2569", status: "pending" },
  { id: "req-02", name: "บริษัท เทคโนโลยี ไทย จำกัด", location: "กรุงเทพมหานคร", appliedDate: "4/8/2569", status: "pending" },
  { id: "req-03", name: "บริษัท ซีเบอร์โซลูชัน จำกัด (มหาชน)", location: "กรุงเทพมหานคร", appliedDate: "27/7/2569", status: "pending" },
  { id: "req-04", name: "บริษัท คลาวด์ เซอร์วิส จำกัด", location: "ปทุมธานี", appliedDate: "27/7/2569", status: "pending" },
  { id: "req-05", name: "บริษัท โค้ดแล็บ จำกัด", location: "เชียงใหม่", appliedDate: "27/7/2569", status: "pending" },
  { id: "req-06", name: "บริษัท ไทยเทค โซลูชัน จำกัด", location: "กรุงเทพมหานคร", appliedDate: "27/7/2569", status: "pending" },
  { id: "req-07", name: "บริษัท ดิจิทัล อินโนเวชั่น จำกัด", location: "ชลบุรี", appliedDate: "27/7/2569", status: "pending" },
  { id: "req-08", name: "การไฟฟ้าส่วนภูมิภาค", location: "นนทบุรี", appliedDate: "27/7/2569", status: "pending" },
  { id: "req-09", name: "สำนักงาน ก.พ.", location: "กรุงเทพมหานคร", appliedDate: "27/7/2569", status: "pending" },
  { id: "req-10", name: "บริษัท เซฟเน็ต ซีเคียวริตี้ จำกัด", location: "กรุงเทพมหานคร", appliedDate: "27/7/2569", status: "pending" },
];

export function CompaniesView() {
  const [activeTab, setActiveTab] = useState<"details" | "pending">("pending");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>จัดการบริษัท</h1>
        <p>จัดการข้อมูลบริษัททั้ง Partner และบริษัทภายนอก</p>
      </header>

      {/* ── Top Tabs ── */}
      <div className={styles.tabList}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "details" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("details")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          รายละเอียดบริษัท
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "pending" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/></svg>
          บริษัทรอยืนยัน
        </button>
      </div>

      {/* ── 3 Summary Stat Cards (ตามภาพ) ── */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconYellow}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>รอดำเนินการ</span>
            <span className={styles.summaryNumber}>12</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconGreen}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 22 4"/></svg>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>ยืนยันแล้ว</span>
            <span className={styles.summaryNumber}>14</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconNavy}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>ปฏิเสธ</span>
            <span className={styles.summaryNumber}>4</span>
          </div>
        </div>
      </div>

      {/* ── Data Table (ตามภาพ) ── */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ชื่อบริษัท</th>
              <th>ที่ตั้ง</th>
              <th>วันที่สมัคร</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {VERIFICATION_REQUESTS.map((item) => (
              <tr key={item.id}>
                <td className={styles.companyName}>{item.name}</td>
                <td>{item.location}</td>
                <td>{item.appliedDate}</td>
                <td>
                  <span className={styles.statusPending}>รอดำเนินการ</span>
                </td>
                <td>
                  <Link href={`/companies/${item.id}`} className={styles.actionLink}>
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.tableFooter}>
          <span>แสดง 20 รายการต่อหน้า | 1-14 จาก 14</span>
          <div className={styles.pageControls}>
            <button type="button" className={styles.pageBtn} disabled>‹</button>
            <span style={{ fontWeight: 600 }}>1 / 1</span>
            <button type="button" className={styles.pageBtn} disabled>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
