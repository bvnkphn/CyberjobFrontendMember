"use client";

import { useCallback, useEffect, useState } from "react";
import { readError, useAdminAuth } from "@/lib/admin/auth";
import {
  GearIcon,
  BellIcon,
  CheckIcon,
  CalendarIcon,
  AlertCircleIcon,
  BriefcaseIcon,
  UsersIcon,
  BuildingIcon,
} from "../icons";
import styles from "./Settings.module.css";
import ui from "../ui/ui.module.css";

interface SystemSettingsData {
  id: string;
  maintenanceMode: boolean;
  announcementTitle: string;
  announcementMsg: string;
  estimatedDowntime: string;
  maintenanceStart: string | null;
  maintenanceEnd: string | null;
  newOrderAlert: boolean;
  failedTransactionAlert: boolean;
  lowApiAlert: boolean;
  dailyReportEmail: boolean;
  alertRecipients: string;
  dailyReportTime: string;
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  registrationEnabled: boolean;
  jobPostingEnabled: boolean;
  updatedAt: string;
  updatedBy: string | null;
  systemInfo?: {
    nodeVersion: string;
    uptimeSeconds: number;
    memoryUsageMb: number;
    memoryTotalMb: number;
    databaseStatus: string;
    counts: {
      users: number;
      companies: number;
      jobs: number;
      pendingPayments: number;
    };
  };
}

const DEFAULT_SETTINGS: SystemSettingsData = {
  id: "default",
  maintenanceMode: false,
  announcementTitle: "ระบบปิดปรับปรุงชั่วคราวเพื่ออัปเกรดความปลอดภัย",
  announcementMsg:
    "ทีมงาน Cyber Job กำลังดำเนินการปรับปรุงระบบโครงสร้างพื้นฐานเพื่อเพิ่มประสิทธิภาพและความปลอดภัย ขออภัยในความไม่สะดวก ระบบจะกลับมาใช้งานได้ตามปกติในเร็ว ๆ นี้",
  estimatedDowntime: "2 ชั่วโมง",
  maintenanceStart: "2026-09-24T01:00",
  maintenanceEnd: "2026-09-24T03:00",
  newOrderAlert: true,
  failedTransactionAlert: true,
  lowApiAlert: true,
  dailyReportEmail: true,
  alertRecipients: "admin@cyberjob.asia, support@cyberjob.asia",
  dailyReportTime: "00:00",
  platformName: "CyberJob Asia",
  supportEmail: "support@cyberjob.asia",
  supportPhone: "02-123-4567",
  registrationEnabled: true,
  jobPostingEnabled: true,
  updatedAt: new Date().toISOString(),
  updatedBy: null,
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d} วัน ${h} ชม.`;
  if (h > 0) return `${h} ชม. ${m} นาที`;
  return `${m} นาที ${seconds % 60} วิ`;
}

export function SettingsView() {
  const { adminFetch } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("บันทึกการตั้งค่าระบบเรียบร้อยแล้ว");

  // Form State
  const [data, setData] = useState<SystemSettingsData>(DEFAULT_SETTINGS);
  const [savedData, setSavedData] = useState<SystemSettingsData>(DEFAULT_SETTINGS);

  // Test Email State
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Load Settings from API & DB
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/admin/settings");
      if (!res.ok) throw await readError(res, "โหลดการตั้งค่าระบบไม่สำเร็จ");
      const json: SystemSettingsData = await res.json();
      setData(json);
      setSavedData(json);
      if (json.alertRecipients && !testEmailAddress) {
        const firstEmail = json.alertRecipients.split(",")[0]?.trim();
        if (firstEmail) setTestEmailAddress(firstEmail);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดการตั้งค่าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [adminFetch, testEmailAddress]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Save Settings to API & DB
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { systemInfo, id, updatedAt, updatedBy, ...payload } = data;
      const res = await adminFetch("/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw await readError(res, "บันทึกการตั้งค่าไม่สำเร็จ");
      const updated: SystemSettingsData = await res.json();
      setData((prev) => ({ ...prev, ...updated }));
      setSavedData((prev) => ({ ...prev, ...updated }));
      setToastMessage("บันทึกการตั้งค่าระบบลงฐานข้อมูลสำเร็จแล้ว");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกการตั้งค่าไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setData(savedData);
    setError(null);
  };

  // Test Email Dispatch
  const handleTestEmail = async () => {
    const recipient = testEmailAddress.trim() || data.alertRecipients.split(",")[0]?.trim();
    if (!recipient) {
      setTestEmailResult({ success: false, msg: "กรุณาระบุอีเมลที่ต้องการทดสอบ" });
      return;
    }

    setTestEmailSending(true);
    setTestEmailResult(null);
    try {
      const res = await adminFetch("/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "ส่งอีเมลทดสอบไม่สำเร็จ");
      setTestEmailResult({
        success: true,
        msg: result.message || `ส่งสัญญาณทดสอบไปยัง ${recipient} สำเร็จ`,
      });
    } catch (e) {
      setTestEmailResult({
        success: false,
        msg: e instanceof Error ? e.message : "ส่งอีเมลทดสอบไม่สำเร็จ",
      });
    } finally {
      setTestEmailSending(false);
    }
  };

  const isDirty = JSON.stringify(data) !== JSON.stringify(savedData);

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={ui.pageHead}>
        <div>
          <h1>ตั้งค่าระบบ (System Settings)</h1>
          <p>จัดการความเสถียรของแพลตฟอร์ม โหมดปิดปรับปรุงระบบ นโยบายการใช้งาน และการแจ้งเตือนอัตโนมัติ</p>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 8, background: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48", fontSize: 14, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── SECTION 0: สถานะระบบและสถิติ (System Health & Server Metrics) ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>
              <GearIcon size={20} />
              สถานะเซิร์ฟเวอร์และฐานข้อมูล (System Health)
            </div>
            <div className={styles.sectionDesc}>
              ข้อมูลความพร้อมใช้งานของ Backend, Database และจำนวนข้อมูลในระบบปัจจุบัน
            </div>
          </div>
          {data.updatedAt && (
            <div className={styles.healthMeta}>
              อัปเดตล่าสุด: {new Date(data.updatedAt).toLocaleString("th-TH")}{data.updatedBy ? ` โดย ${data.updatedBy}` : ""}
            </div>
          )}
        </div>

        <div className={styles.healthGrid}>
          <div className={styles.healthCard}>
            <div className={styles.healthLabel}>สถานะฐานข้อมูล</div>
            <div className={styles.healthValue}>
              <span className={styles.statusConnected}>
                <span className={styles.statusDot} /> PostgreSQL Online
              </span>
            </div>
            <div className={styles.healthMeta}>Supabase AWS (Singapore)</div>
          </div>

          <div className={styles.healthCard}>
            <div className={styles.healthLabel}>หน่วยความจำเซิร์ฟเวอร์</div>
            <div className={styles.healthValue}>
              {data.systemInfo?.memoryUsageMb ?? "–"} MB
            </div>
            <div className={styles.healthMeta}>จากที่จัดสรรไว้ {data.systemInfo?.memoryTotalMb ?? "–"} MB</div>
          </div>

          <div className={styles.healthCard}>
            <div className={styles.healthLabel}>เวลาทำงานต่อเนื่อง (Uptime)</div>
            <div className={styles.healthValue} style={{ fontSize: 17 }}>
              {data.systemInfo ? formatUptime(data.systemInfo.uptimeSeconds) : "–"}
            </div>
            <div className={styles.healthMeta}>Node.js {data.systemInfo?.nodeVersion ?? process.version}</div>
          </div>

          <div className={styles.healthCard}>
            <div className={styles.healthLabel}>ข้อมูลในระบบทั้งหมด</div>
            <div className={styles.healthValue} style={{ fontSize: 15, gap: 12 }}>
              <span>👥 {data.systemInfo?.counts.users ?? 0} สมาชิก</span>
              <span>🏢 {data.systemInfo?.counts.companies ?? 0} บริษัท</span>
            </div>
            <div className={styles.healthMeta}>
              💼 {data.systemInfo?.counts.jobs ?? 0} งาน · 💳 {data.systemInfo?.counts.pendingPayments ?? 0} รอตรวจชำระ
            </div>
          </div>
        </div>
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
        <div className={`${styles.maintenanceBanner} ${data.maintenanceMode ? styles.maintenanceOn : styles.maintenanceOff}`}>
          <div className={styles.bannerInfo}>
            <div className={`${styles.bannerIcon} ${data.maintenanceMode ? styles.bannerIconOn : styles.bannerIconOff}`}>
              {data.maintenanceMode ? "⚠️" : "✓"}
            </div>
            <div>
              <div className={styles.bannerTitle}>
                {data.maintenanceMode ? "ระบบอยู่ในโหมดปิดปรับปรุง (Maintenance Active)" : "ระบบเปิดให้บริการตามปกติ (Online)"}
              </div>
              <div className={styles.bannerDesc}>
                {data.maintenanceMode
                  ? "ผู้ใช้งานทั่วไปจะมองเห็นเฉพาะหน้าจอแจ้งเตือนปิดปรับปรุงระบบ และไม่สามารถล็อกอินหรือใช้งานได้"
                  : "ผู้สมัครและผู้ประกอบการสามารถเข้าใช้งานระบบได้ตามปกติทุกฟังก์ชัน"}
              </div>
            </div>
          </div>

          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={data.maintenanceMode}
              onChange={(e) => setData({ ...data, maintenanceMode: e.target.checked })}
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
            value={data.announcementTitle}
            onChange={(e) => setData({ ...data, announcementTitle: e.target.value })}
            placeholder="เช่น กำลังดำเนินการบำรุงรักษาระบบเซิร์ฟเวอร์ประจำเดือน..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>รายละเอียดข้อความประกาศ</label>
          <textarea
            className={styles.formTextarea}
            value={data.announcementMsg}
            onChange={(e) => setData({ ...data, announcementMsg: e.target.value })}
            placeholder="ระบุข้อความอธิบายให้ผู้ใช้ทราบ..."
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ระยะเวลาปิดปรับปรุงโดยประมาณ</label>
            <input
              type="text"
              className={styles.formInput}
              value={data.estimatedDowntime}
              onChange={(e) => setData({ ...data, estimatedDowntime: e.target.value })}
              placeholder="เช่น 2 ชั่วโมง, 45 นาที"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>เวลาที่คาดว่าจะแล้วเสร็จ</label>
            <input
              type="datetime-local"
              className={styles.formInput}
              value={data.maintenanceEnd ? data.maintenanceEnd.slice(0, 16) : ""}
              onChange={(e) => setData({ ...data, maintenanceEnd: e.target.value })}
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
            <h2 className={styles.previewHeading}>{data.announcementTitle || "ระบบปิดปรับปรุงชั่วคราว"}</h2>
            <p className={styles.previewMessage}>
              {data.announcementMsg || "ขออภัยในความไม่สะดวก ระบบกำลังดำเนินการปรับปรุงและจะกลับมาใช้งานได้ในเร็ว ๆ นี้"}
            </p>
            <div className={styles.previewEstimated}>
              <CalendarIcon size={16} />
              <span>
                ระยะเวลาโดยประมาณ: <strong>{data.estimatedDowntime || "ไม่ระบุ"}</strong>
                {data.maintenanceEnd ? ` (คาดการณ์เสร็จสิ้น: ${data.maintenanceEnd.replace("T", " ")})` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: นโยบายและข้อมูลแพลตฟอร์ม (Platform Policies & Info) ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>
              <BuildingIcon size={20} />
              นโยบายและการควบคุมแพลตฟอร์ม (Platform Policies)
            </div>
            <div className={styles.sectionDesc}>
              กำหนดข้อมูลติดต่อส่วนกลาง และควบคุมการเปิด/ปิดสิทธิ์การสมัครสมาชิกและลงประกาศงาน
            </div>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ชื่อแพลตฟอร์ม (Platform Name)</label>
            <input
              type="text"
              className={styles.formInput}
              value={data.platformName}
              onChange={(e) => setData({ ...data, platformName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>อีเมลติดต่อฝ่ายสนับสนุน (Support Email)</label>
            <input
              type="email"
              className={styles.formInput}
              value={data.supportEmail}
              onChange={(e) => setData({ ...data, supportEmail: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>เบอร์โทรศัพท์ติดต่อ (Support Phone)</label>
            <input
              type="text"
              className={styles.formInput}
              value={data.supportPhone}
              onChange={(e) => setData({ ...data, supportPhone: e.target.value })}
            />
          </div>
        </div>

        {/* Feature Policy Switches */}
        <div className={styles.notifList} style={{ marginTop: 12 }}>
          <div className={styles.notifItem}>
            <div className={styles.notifContent}>
              <div className={styles.notifIcon}>👤</div>
              <div>
                <div className={styles.notifTitle}>เปิดให้ผู้ใช้ใหม่สมัครสมาชิก (Allow New Registrations)</div>
                <div className={styles.notifDesc}>
                  อนุญาตให้ผู้สมัครงานและผู้ประกอบการรายใหม่สร้างบัญชีในระบบได้
                </div>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={data.registrationEnabled}
                onChange={(e) => setData({ ...data, registrationEnabled: e.target.checked })}
              />
              <span className={`${styles.slider} ${styles.sliderGreen}`} />
            </label>
          </div>

          <div className={styles.notifItem}>
            <div className={styles.notifContent}>
              <div className={styles.notifIcon}>💼</div>
              <div>
                <div className={styles.notifTitle}>เปิดให้ลงประกาศงานใหม่ (Allow New Job Postings)</div>
                <div className={styles.notifDesc}>
                  อนุญาตให้บริษัท/Owner สร้างและเผยแพร่ตำแหน่งงานใหม่บนหน้าเว็บไซต์
                </div>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={data.jobPostingEnabled}
                onChange={(e) => setData({ ...data, jobPostingEnabled: e.target.checked })}
              />
              <span className={`${styles.slider} ${styles.sliderGreen}`} />
            </label>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: การแจ้งเตือนและระบบบริการ (Notification & Reports) ── */}
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
                checked={data.newOrderAlert}
                onChange={(e) => setData({ ...data, newOrderAlert: e.target.checked })}
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
                  ส่งอีเมลแจ้งเตือนเมื่อการชำระเงินของบริษัทล้มเหลว หรือถูกปฏิเสธจาก Payment Gateway
                </div>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={data.failedTransactionAlert}
                onChange={(e) => setData({ ...data, failedTransactionAlert: e.target.checked })}
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
                checked={data.lowApiAlert}
                onChange={(e) => setData({ ...data, lowApiAlert: e.target.checked })}
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
                  รับรายงานสรุปยอดขาย สถิติผู้ใช้งาน และจำนวนงานใหม่ประจำวันทุกคืนเวลา {data.dailyReportTime} น.
                </div>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={data.dailyReportEmail}
                onChange={(e) => setData({ ...data, dailyReportEmail: e.target.checked })}
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
              value={data.alertRecipients}
              onChange={(e) => setData({ ...data, alertRecipients: e.target.value })}
              placeholder="กรอกอีเมลคั่นด้วยเครื่องหมายจุลภาค (,)"
            />
            <div className={styles.formHelp}>ระบบจะจัดส่งอีเมลแจ้งเตือนไปยังรายชื่ออีเมลข้างต้นทั้งหมดพร้อมกัน</div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ maxWidth: 280 }}>
              <label className={styles.formLabel}>เวลาจัดส่งรายงานประจำวัน (Daily Report Time)</label>
              <input
                type="time"
                className={styles.formInput}
                value={data.dailyReportTime}
                onChange={(e) => setData({ ...data, dailyReportTime: e.target.value })}
              />
            </div>

            {/* Test Email Dispatch Tool */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ทดสอบระบบส่งการแจ้งเตือน (Test Dispatch)</label>
              <div className={styles.testEmailRow}>
                <input
                  type="email"
                  className={styles.formInput}
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="ใส่อีเมลที่ต้องการทดสอบ..."
                />
                <button
                  type="button"
                  className={styles.testButton}
                  onClick={handleTestEmail}
                  disabled={testEmailSending}
                >
                  {testEmailSending ? "กำลังทดสอบ..." : "ส่งอีเมลทดสอบ"}
                </button>
              </div>

              {testEmailResult && (
                <div
                  className={`${styles.testResult} ${
                    testEmailResult.success ? styles.testSuccess : styles.testError
                  }`}
                >
                  {testEmailResult.success ? "✓ " : "✕ "}
                  {testEmailResult.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Save Bar ── */}
      <div className={styles.saveBar}>
        <div className={styles.saveBarNotice}>
          {isDirty
            ? "⚠️ มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก — กรุณากดบันทึกเพื่อให้มีผลต่อระบบ"
            : "💡 การเปลี่ยนแปลงการตั้งค่าจะมีผลทันทีต่อทั้งระบบหลังจากกดบันทึก"}
        </div>
        <div className={styles.saveActions}>
          {isDirty && (
            <button
              type="button"
              className={styles.discardButton}
              onClick={handleDiscard}
              disabled={saving}
            >
              ยกเลิกการแก้ไข
            </button>
          )}
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving || loading}
          >
            <CheckIcon size={18} />
            {saving ? "กำลังบันทึกลงฐานข้อมูล..." : "บันทึกการตั้งค่าทั้งหมด (Save Changes)"}
          </button>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {showToast && (
        <div className={styles.toast}>
          <CheckIcon size={20} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
