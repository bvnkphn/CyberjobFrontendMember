"use client";

import { useState } from "react";
import {
  GearIcon,
  BellIcon,
  WarningIcon,
  CheckIcon,
  CalendarIcon,
  AlertCircleIcon,
} from "../icons";
import styles from "./Settings.module.css";

export function SettingsView() {
  // Maintenance Mode States
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("ระบบปิดปรับปรุงชั่วคราวเพื่ออัปเกรดความปลอดภัย");
  const [announcementMsg, setAnnouncementMsg] = useState(
    "ทีมงาน Cyber Job กำลังดำเนินการปรับปรุงระบบโครงสร้างพื้นฐานเพื่อเพิ่มประสิทธิภาพและความปลอดภัย ขออภัยในความไม่สะดวก ระบบจะกลับมาใช้งานได้ตามปกติในเร็ว ๆ นี้"
  );
  const [estimatedDowntime, setEstimatedDowntime] = useState("2 ชั่วโมง");
  const [maintenanceStart, setMaintenanceStart] = useState("2026-09-24T01:00");
  const [maintenanceEnd, setMaintenanceEnd] = useState("2026-09-24T03:00");

  // Notifications States
  const [newOrderAlert, setNewOrderAlert] = useState(true);
  const [failedTransactionAlert, setFailedTransactionAlert] = useState(true);
  const [lowApiAlert, setLowApiAlert] = useState(true);
  const [dailyReportEmail, setDailyReportEmail] = useState(true);
  const [alertRecipients, setAlertRecipients] = useState("admin@cyberjob.in.th, ops-lead@cyberjob.in.th");
  const [dailyReportTime, setDailyReportTime] = useState("00:00");

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }, 400);
  };

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={styles.header}>
        <h1>ตั้งค่าระบบ (System Settings)</h1>
        <p>จัดการความเสถียรของแพลตฟอร์ม โหมดปิดปรับปรุงระบบ และการแจ้งเตือนอัตโนมัติถึงผู้ดูแล</p>
      </div>

      {/* ── SECTION 1: โหมดปรับปรุงระบบ (Maintenance Mode) ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>
              <GearIcon size={20} />
              โหมดปรับปรุงระบบ (Maintenance Mode)
            </div>
            <div className={styles.sectionDesc}>
              เปิดใช้งานเมื่อต้องการปิดการเข้าถึงของหน้าเว็บ Member และ Owner ชั่วคราวเพื่อดำเนินการทางเทคนิค
            </div>
          </div>
        </div>

        {/* Status Toggle Banner */}
        <div className={`${styles.maintenanceBanner} ${maintenanceMode ? styles.maintenanceOn : styles.maintenanceOff}`}>
          <div className={styles.bannerInfo}>
            <div className={`${styles.bannerIcon} ${maintenanceMode ? styles.bannerIconOn : styles.bannerIconOff}`}>
              {maintenanceMode ? "⚠️" : "✓"}
            </div>
            <div>
              <div className={styles.bannerTitle}>
                {maintenanceMode ? "ระบบอยู่ในโหมดปิดปรับปรุง (Maintenance Active)" : "ระบบเปิดให้บริการตามปกติ (Online)"}
              </div>
              <div className={styles.bannerDesc}>
                {maintenanceMode
                  ? "ผู้ใช้งานทั่วไปจะมองเห็นเฉพาะหน้าจอแจ้งเตือนปิดปรับปรุงระบบ และไม่สามารถล็อกอินได้"
                  : "ผู้สมัครและผู้ประกอบการสามารถเข้าใช้งานระบบได้ตามปกติ"}
              </div>
            </div>
          </div>

          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        {/* Inputs */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>หัวข้อประกาศปิดปรับปรุงถึงผู้ใช้</label>
          <input
            type="text"
            className={styles.formInput}
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            placeholder="เช่น กำลังดำเนินการบำรุงรักษาระบบเซิร์ฟเวอร์ประจำเดือน..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>รายละเอียดข้อความประกาศ</label>
          <textarea
            className={styles.formTextarea}
            value={announcementMsg}
            onChange={(e) => setAnnouncementMsg(e.target.value)}
            placeholder="ระบุข้อความอธิบายให้ผู้ใช้ทราบ..."
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ระยะเวลาปิดปรับปรุงโดยประมาณ</label>
            <input
              type="text"
              className={styles.formInput}
              value={estimatedDowntime}
              onChange={(e) => setEstimatedDowntime(e.target.value)}
              placeholder="เช่น 2 ชั่วโมง, 45 นาที"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>เวลาที่คาดว่าจะแล้วเสร็จ</label>
            <input
              type="datetime-local"
              className={styles.formInput}
              value={maintenanceEnd}
              onChange={(e) => setMaintenanceEnd(e.target.value)}
            />
          </div>
        </div>

        {/* Live Preview Box */}
        <div className={styles.previewSection}>
          <div className={styles.previewLabel}>
            <AlertCircleIcon size={16} /> พรีวิวข้อความประกาศที่จะแสดงต่อผู้ใช้ (Live Preview)
          </div>
          <div className={styles.previewScreen}>
            <div className={styles.previewBadge}>
              <span>🔧</span> อยู่ระหว่างการปรับปรุงระบบ
            </div>
            <h2 className={styles.previewHeading}>{announcementTitle || "ระบบปิดปรับปรุงชั่วคราว"}</h2>
            <p className={styles.previewMessage}>
              {announcementMsg || "ขออภัยในความไม่สะดวก ระบบกำลังดำเนินการปรับปรุงและจะกลับมาใช้งานได้ในเร็ว ๆ นี้"}
            </p>
            <div className={styles.previewEstimated}>
              <CalendarIcon size={16} />
              <span>
                ระยะเวลาโดยประมาณ: <strong>{estimatedDowntime || "ไม่ระบุ"}</strong> (คาดการณ์เสร็จสิ้น: {maintenanceEnd.replace("T", " ")})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: การแจ้งเตือนและระบบบริการ (Notification & Reports) ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>
              <BellIcon size={20} />
              การแจ้งเตือนและระบบบริการ (Notifications & Reports)
            </div>
            <div className={styles.sectionDesc}>
              ตั้งค่าช่องทางการรับส่งอีเมลแจ้งเตือนเหตุการณ์สำคัญและรายงานสรุปสำหรับทีมงานแอดมิน
            </div>
          </div>
        </div>

        <div className={styles.notifList}>
          {/* New Order Alert */}
          <div className={styles.notifItem}>
            <div className={styles.notifContent}>
              <div className={styles.notifIcon}>🛒</div>
              <div>
                <div className={styles.notifTitle}>New Order Alerts</div>
                <div className={styles.notifDesc}>
                  ส่งอีเมลแจ้งเตือนผู้ดูแลระบบทันทีเมื่อมีบริษัทสั่งซื้อหรือต่ออายุแพ็กเกจใหม่
                </div>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={newOrderAlert}
                onChange={(e) => setNewOrderAlert(e.target.checked)}
              />
              <span className={`${styles.slider} ${styles.sliderGreen}`} />
            </label>
          </div>

          {/* Failed Transaction Alert */}
          <div className={styles.notifItem}>
            <div className={styles.notifContent}>
              <div className={styles.notifIcon}>💳</div>
              <div>
                <div className={styles.notifTitle}>Failed Transaction Alerts</div>
                <div className={styles.notifDesc}>
                  ส่งอีเมลแจ้งเตือนเมื่อการตัดชำระเงินของบริษัทล้มเหลว หรือถูกปฏิเสธจาก Payment Gateway
                </div>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={failedTransactionAlert}
                onChange={(e) => setFailedTransactionAlert(e.target.checked)}
              />
              <span className={`${styles.slider} ${styles.sliderGreen}`} />
            </label>
          </div>

          {/* Low API Balance Alert */}
          <div className={styles.notifItem}>
            <div className={styles.notifContent}>
              <div className={styles.notifIcon}>⚡</div>
              <div>
                <div className={styles.notifTitle}>Low API Balance Alerts</div>
                <div className={styles.notifDesc}>
                  ส่งอีเมลแจ้งเตือนทันทีเมื่อยอดเครดิต API คู่ค้าหลังบ้าน (SMS, KYC, LLM) เหลือต่ำกว่าเกณฑ์
                </div>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={lowApiAlert}
                onChange={(e) => setLowApiAlert(e.target.checked)}
              />
              <span className={`${styles.slider} ${styles.sliderGreen}`} />
            </label>
          </div>

          {/* Daily Report Email */}
          <div className={styles.notifItem}>
            <div className={styles.notifContent}>
              <div className={styles.notifIcon}>📊</div>
              <div>
                <div className={styles.notifTitle}>Daily Report Email</div>
                <div className={styles.notifDesc}>
                  รับรายงานสรุปยอดขาย สถิติผู้ใช้งาน และจำนวนงานใหม่ประจำวันทุกคืนเวลา {dailyReportTime} น.
                </div>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={dailyReportEmail}
                onChange={(e) => setDailyReportEmail(e.target.checked)}
              />
              <span className={`${styles.slider} ${styles.sliderGreen}`} />
            </label>
          </div>
        </div>

        {/* Recipients and Report Time */}
        <div style={{ marginTop: 22 }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>อีเมลผู้รับการแจ้งเตือน (Notification Recipients)</label>
            <input
              type="text"
              className={styles.formInput}
              value={alertRecipients}
              onChange={(e) => setAlertRecipients(e.target.value)}
              placeholder="กรอกอีเมลคั่นด้วยเครื่องหมายจุลภาค (,)"
            />
            <div className={styles.formHelp}>ระบบจะจัดส่งอีเมลแจ้งเตือนไปยังรายชื่ออีเมลข้างต้นทั้งหมดพร้อมกัน</div>
          </div>

          <div className={styles.formGroup} style={{ maxWidth: 280 }}>
            <label className={styles.formLabel}>เวลาจัดส่งรายงานประจำวัน (Daily Report Time)</label>
            <input
              type="time"
              className={styles.formInput}
              value={dailyReportTime}
              onChange={(e) => setDailyReportTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Sticky Save Bar ── */}
      <div className={styles.saveBar}>
        <div className={styles.saveBarNotice}>
          💡 การเปลี่ยนแปลงการตั้งค่าจะมีผลทันทีต่อทั้งระบบหลังจากกดบันทึก
        </div>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
        >
          <CheckIcon size={18} />
          {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่าทั้งหมด (Save Changes)"}
        </button>
      </div>

      {/* ── Toast Notification ── */}
      {showToast && (
        <div className={styles.toast}>
          <CheckIcon size={20} />
          บันทึกการตั้งค่าระบบเรียบร้อยแล้ว
        </div>
      )}
    </div>
  );
}
