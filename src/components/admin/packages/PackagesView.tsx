"use client";

import { useMemo, useState } from "react";
import {
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  EditIcon,
  CloseIcon,
  DotsIcon,
} from "../icons";
import { Modal } from "../ui/Modal";
import styles from "./Packages.module.css";

export type PackageTier = "free" | "gold" | "platinum";
export type PackageStatus = "active" | "expiring" | "expired" | "suspended";
export type PaymentStatus = "paid" | "failed" | "none";

export interface CompanyPackageItem {
  id: string;
  companyName: string;
  avatarText: string;
  avatarBg: string;
  imageUrl?: string;
  email: string;
  tier: PackageTier;
  startDateEn: string;
  startDateTh: string;
  expiryDateEn: string;
  expiryDateTh: string;
  expiryDateInput: string; // YYYY-MM-DD
  countdownEn: string;
  countdownTh: string;
  countdownType: "expired" | "warning" | "normal";
  status: PackageStatus;
  paymentStatus: PaymentStatus;
  taxId: string;
  contactPerson: string;
  phone: string;
  autoRenew: boolean;
  history: Array<{ date: string; event: string; detail: string }>;
  activityLog: Array<{ timestamp: string; action: string; ip: string }>;
}

const INITIAL_SUBSCRIBERS: CompanyPackageItem[] = [
  {
    id: "PKG-001",
    companyName: "Lumen Biotech",
    avatarText: "LB",
    avatarBg: "#f59e0b",
    email: "ap@lumenbio.com",
    tier: "gold",
    startDateEn: "Mar 20, 2025",
    startDateTh: "20 มี.ค. 2025",
    expiryDateEn: "Mar 20, 2026",
    expiryDateTh: "20 มี.ค. 2026",
    expiryDateInput: "2026-03-20",
    countdownEn: "Expired 144d ago",
    countdownTh: "หมดอายุเมื่อ 144 วันก่อน",
    countdownType: "expired",
    status: "expired",
    paymentStatus: "failed",
    taxId: "0105561008123",
    contactPerson: "คุณกิตติศักดิ์ เจริญพร",
    phone: "02-555-0199",
    autoRenew: false,
    history: [
      { date: "20 มี.ค. 2025", event: "เริ่มต้นใช้งาน Gold Plan", detail: "ยอดชำระ ฿12,900 / ปี" },
    ],
    activityLog: [
      { timestamp: "20 มี.ค. 2026 00:00", action: "ตัดเงินต่ออายุอัตโนมัติล้มเหลว (Payment Failed)", ip: "System" },
    ],
  },
  {
    id: "PKG-002",
    companyName: "Quanta Cloud",
    avatarText: "QC",
    avatarBg: "#f59e0b",
    email: "finance@quantacloud.dev",
    tier: "platinum",
    startDateEn: "May 22, 2025",
    startDateTh: "22 พ.ค. 2025",
    expiryDateEn: "May 22, 2026",
    expiryDateTh: "22 พ.ค. 2026",
    expiryDateInput: "2026-05-22",
    countdownEn: "Expired 81d ago",
    countdownTh: "หมดอายุเมื่อ 81 วันก่อน",
    countdownType: "expired",
    status: "expired",
    paymentStatus: "failed",
    taxId: "0105562099312",
    contactPerson: "คุณวิภาดา อริยะกุล",
    phone: "089-123-4567",
    autoRenew: false,
    history: [
      { date: "22 พ.ค. 2025", event: "สมัครแพ็กเกจ Platinum Plan", detail: "ยอดชำระ ฿24,900 / ปี" },
    ],
    activityLog: [
      { timestamp: "22 พ.ค. 2026 00:00", action: "ตัดเงินล้มเหลว (Card Expired)", ip: "System" },
    ],
  },
  {
    id: "PKG-003",
    companyName: "Vertex Robotics",
    avatarText: "VR",
    avatarBg: "#8b5cf6",
    email: "finance@vertexrobotics.ai",
    tier: "platinum",
    startDateEn: "Aug 1, 2024",
    startDateTh: "1 ส.ค. 2024",
    expiryDateEn: "Aug 9, 2026",
    expiryDateTh: "9 ส.ค. 2026",
    expiryDateInput: "2026-08-09",
    countdownEn: "Expired 2d ago",
    countdownTh: "หมดอายุเมื่อ 2 วันก่อน",
    countdownType: "expired",
    status: "expiring",
    paymentStatus: "paid",
    taxId: "0105559098712",
    contactPerson: "คุณภาณุวัชร วงศ์ษา",
    phone: "02-987-6543",
    autoRenew: true,
    history: [
      { date: "01 ส.ค. 2025", event: "ต่ออายุ Platinum Plan", detail: "ยอดชำระ ฿24,900 / ปี" },
    ],
    activityLog: [
      { timestamp: "09 ส.ค. 2026 12:00", action: "ส่งอีเมลแจ้งเตือนหมดอายุรอบบิล", ip: "System" },
    ],
  },
  {
    id: "PKG-004",
    companyName: "Harbor Logistics",
    avatarText: "HL",
    avatarBg: "#0f766e",
    email: "accounts@harborlog.co",
    tier: "gold",
    startDateEn: "Jun 1, 2025",
    startDateTh: "1 มิ.ย. 2025",
    expiryDateEn: "Aug 15, 2026",
    expiryDateTh: "15 ส.ค. 2026",
    expiryDateInput: "2026-08-15",
    countdownEn: "4d left",
    countdownTh: "เหลือ 4 วัน",
    countdownType: "warning",
    status: "expiring",
    paymentStatus: "paid",
    taxId: "0105560044556",
    contactPerson: "คุณประวิทย์ สุทธิชัย",
    phone: "02-777-8899",
    autoRenew: true,
    history: [
      { date: "01 มิ.ย. 2025", event: "สมัคร Gold Plan", detail: "ยอดชำระ ฿12,900" },
    ],
    activityLog: [
      { timestamp: "20 ส.ค. 2026 10:30", action: "เข้าสู่ระบบตรวจสอบสถานะประกาศงาน", ip: "119.46.12.5" },
    ],
  },
  {
    id: "PKG-005",
    companyName: "Cascade Digital",
    avatarText: "CD",
    avatarBg: "#10b981",
    email: "team@cascadedigital.studio",
    tier: "free",
    startDateEn: "Jul 1, 2026",
    startDateTh: "1 ก.ค. 2026",
    expiryDateEn: "Aug 20, 2026",
    expiryDateTh: "20 ส.ค. 2026",
    expiryDateInput: "2026-08-20",
    countdownEn: "9d left",
    countdownTh: "เหลือ 9 วัน",
    countdownType: "warning",
    status: "active",
    paymentStatus: "none",
    taxId: "0105558012399",
    contactPerson: "คุณอารียา ปรีดากุล",
    phone: "081-445-6677",
    autoRenew: false,
    history: [
      { date: "01 ก.ค. 2026", event: "เริ่มต้นใช้งาน Free Tier", detail: "สิทธิประโยชน์ทดลองใช้" },
    ],
    activityLog: [
      { timestamp: "15 ส.ค. 2026 14:15", action: "สร้างประกาศงานตำแหน่ง Frontend Engineer", ip: "49.228.10.42" },
    ],
  },
  {
    id: "PKG-006",
    companyName: "Ironforge Manufacturing",
    avatarText: "IM",
    avatarBg: "#ea580c",
    email: "billing@ironforgemfg.com",
    tier: "gold",
    startDateEn: "Sep 15, 2025",
    startDateTh: "15 ก.ย. 2025",
    expiryDateEn: "Sep 15, 2026",
    expiryDateTh: "15 ก.ย. 2026",
    expiryDateInput: "2026-09-15",
    countdownEn: "35d left",
    countdownTh: "เหลือ 35 วัน",
    countdownType: "normal",
    status: "suspended",
    paymentStatus: "failed",
    taxId: "0105557088211",
    contactPerson: "คุณธนพล สมบูรณ์",
    phone: "02-333-4455",
    autoRenew: false,
    history: [
      { date: "15 ก.ย. 2025", event: "สมัคร Gold Plan", detail: "ยอดชำระ ฿12,900" },
      { date: "10 ก.ย. 2026", event: "แอดมินระงับการเข้าใช้งาน", detail: "เหตุผล: ค้างชำระค่าบริการเกินกำหนด" },
    ],
    activityLog: [
      { timestamp: "10 ก.ย. 2026 11:00", action: "ระงับการเข้าใช้งานชั่วคราว", ip: "Admin" },
    ],
  },
  {
    id: "PKG-007",
    companyName: "Meridian Foods",
    avatarText: "MF",
    avatarBg: "#3b82f6",
    email: "billing@meridianfoods.com",
    tier: "free",
    startDateEn: "Jun 15, 2026",
    startDateTh: "15 มิ.ย. 2026",
    expiryDateEn: "Sep 15, 2026",
    expiryDateTh: "15 ก.ย. 2026",
    expiryDateInput: "2026-09-15",
    countdownEn: "35d left",
    countdownTh: "เหลือ 35 วัน",
    countdownType: "normal",
    status: "active",
    paymentStatus: "none",
    taxId: "0105563012948",
    contactPerson: "คุณสมหมาย มั่นคง",
    phone: "084-555-1234",
    autoRenew: false,
    history: [
      { date: "15 มิ.ย. 2026", event: "เริ่มต้นใช้งาน Free Tier", detail: "ฟรี" },
    ],
    activityLog: [
      { timestamp: "12 ก.ย. 2026 09:10", action: "ดูรายการผู้สมัครงาน 8 คน", ip: "171.96.220.14" },
    ],
  },
  {
    id: "PKG-008",
    companyName: "Solstice Media",
    avatarText: "SM",
    avatarBg: "#16a34a",
    email: "accounts@solsticemedia.co",
    tier: "gold",
    startDateEn: "Oct 5, 2025",
    startDateTh: "5 ต.ค. 2025",
    expiryDateEn: "Oct 5, 2026",
    expiryDateTh: "5 ต.ค. 2026",
    expiryDateInput: "2026-10-05",
    countdownEn: "55d left",
    countdownTh: "เหลือ 55 วัน",
    countdownType: "normal",
    status: "active",
    paymentStatus: "paid",
    taxId: "0105564019283",
    contactPerson: "คุณนภัสสร รัตนโชติ",
    phone: "02-123-9988",
    autoRenew: true,
    history: [
      { date: "05 ต.ค. 2025", event: "สมัคร Gold Plan", detail: "ยอดชำระ ฿12,900" },
    ],
    activityLog: [
      { timestamp: "18 ก.ย. 2026 15:40", action: "ดาวน์โหลดเอกสารใบกำกับภาษี", ip: "182.52.88.19" },
    ],
  },
  {
    id: "PKG-009",
    companyName: "Nimbus Systems",
    avatarText: "NS",
    avatarBg: "#1e40af",
    email: "billing@nimbussys.io",
    tier: "platinum",
    startDateEn: "Nov 12, 2025",
    startDateTh: "12 พ.ย. 2025",
    expiryDateEn: "Nov 12, 2026",
    expiryDateTh: "12 พ.ย. 2026",
    expiryDateInput: "2026-11-12",
    countdownEn: "93d left",
    countdownTh: "เหลือ 93 วัน",
    countdownType: "normal",
    status: "active",
    paymentStatus: "paid",
    taxId: "0105562088190",
    contactPerson: "คุณชานนท์ วงศ์วัฒนา",
    phone: "02-888-9900",
    autoRenew: true,
    history: [
      { date: "12 พ.ย. 2025", event: "สมัคร Platinum Plan", detail: "ยอดชำระ ฿24,900" },
    ],
    activityLog: [
      { timestamp: "22 ก.ย. 2026 16:00", action: "เชื่อมต่อ Webhook ระบบ Matching", ip: "119.46.12.5" },
    ],
  },
  {
    id: "PKG-010",
    companyName: "Polaris Analytics",
    avatarText: "PA",
    avatarBg: "#0f172a",
    email: "ops@polarisanalytics.io",
    tier: "platinum",
    startDateEn: "Dec 10, 2025",
    startDateTh: "10 ธ.ค. 2025",
    expiryDateEn: "Dec 10, 2026",
    expiryDateTh: "10 ธ.ค. 2026",
    expiryDateInput: "2026-12-10",
    countdownEn: "121d left",
    countdownTh: "เหลือ 121 วัน",
    countdownType: "normal",
    status: "active",
    paymentStatus: "paid",
    taxId: "0107563000124",
    contactPerson: "คุณธนารักษ์ ภูริทัศน์",
    phone: "02-444-5566",
    autoRenew: true,
    history: [
      { date: "10 ธ.ค. 2025", event: "สมัคร Platinum Plan", detail: "ยอดชำระ ฿24,900" },
    ],
    activityLog: [
      { timestamp: "23 ก.ย. 2026 11:20", action: "ค้นหาผู้สมัครงาน Security Operations", ip: "49.228.10.42" },
    ],
  },
];

export function PackagesView() {
  const [lang, setLang] = useState<"th" | "en">("th");
  const [subscribers, setSubscribers] = useState<CompanyPackageItem[]>(INITIAL_SUBSCRIBERS);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("soonest");

  // Modals state
  const [editItem, setEditItem] = useState<CompanyPackageItem | null>(null);
  const [suspendItem, setSuspendItem] = useState<CompanyPackageItem | null>(null);
  const [detailItem, setDetailItem] = useState<CompanyPackageItem | null>(null);

  // Edit form states
  const [newTier, setNewTier] = useState<PackageTier>("platinum");
  const [newExpiryDate, setNewExpiryDate] = useState("2026-03-31");
  const [editReason, setEditReason] = useState("");

  // Suspend form states
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendNote, setSuspendNote] = useState("");

  // Stats calculation
  const stats = useMemo(() => {
    const total = subscribers.length;
    const gold = subscribers.filter((s) => s.tier === "gold").length;
    const platinum = subscribers.filter((s) => s.tier === "platinum").length;
    const expiringIn7 = subscribers.filter((s) => s.status === "expiring" && s.countdownType === "warning").length;
    const failed = subscribers.filter((s) => s.paymentStatus === "failed").length;
    return { total, gold, platinum, expiringIn7, failed };
  }, [subscribers]);

  // Filtering
  const filtered = useMemo(() => {
    return subscribers.filter((item) => {
      const matchSearch =
        search.trim() === "" ||
        item.companyName.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase());

      const matchTier = tierFilter === "all" || item.tier === tierFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchPayment = paymentFilter === "all" || item.paymentStatus === paymentFilter;

      return matchSearch && matchTier && matchStatus && matchPayment;
    });
  }, [subscribers, search, tierFilter, statusFilter, paymentFilter]);

  // Open Edit Modal
  const openEdit = (item: CompanyPackageItem) => {
    setEditItem(item);
    setNewTier(item.tier);
    setNewExpiryDate(item.expiryDateInput || "2026-03-31");
    setEditReason("");
  };

  // Save Edit Modal
  const handleSaveEdit = () => {
    if (!editItem) return;
    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id !== editItem.id) return s;
        return {
          ...s,
          tier: newTier,
          expiryDateInput: newExpiryDate,
          expiryDateEn: newExpiryDate,
          expiryDateTh: newExpiryDate,
        };
      })
    );
    setEditItem(null);
  };

  // Open Suspend Modal
  const openSuspend = (item: CompanyPackageItem) => {
    setSuspendItem(item);
    setSuspendReason("");
    setSuspendNote("");
  };

  // Confirm Suspend
  const handleConfirmSuspend = () => {
    if (!suspendItem) return;
    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id !== suspendItem.id) return s;
        return {
          ...s,
          status: "suspended",
        };
      })
    );
    setSuspendItem(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Subscriber",
      "Email",
      "Plan",
      "Start Date",
      "Expiry Date",
      "Status",
      "Payment",
    ];
    const rows = filtered.map((s) => [
      `"${s.companyName}"`,
      s.email,
      s.tier.toUpperCase(),
      s.startDateEn,
      s.expiryDateEn,
      s.status.toUpperCase(),
      s.paymentStatus.toUpperCase(),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isTh = lang === "th";

  return (
    <div className={styles.container}>
      {/* ── Page Header Row ── */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>{isTh ? "การจัดการแพ็กเกจของบริษัท" : "Subscription Management"}</h1>
          <p>
            {isTh
              ? "ติดตามและจัดการการสมัครสมาชิกของนายจ้างทั่ว Cyber Job."
              : "Monitor and manage employer subscriptions across Cyber Job."}
          </p>
        </div>

        <div className={styles.langToggle}>
          <button
            type="button"
            className={`${styles.langBtn} ${isTh ? styles.langBtnActive : ""}`}
            onClick={() => setLang("th")}
          >
            ไทย
          </button>
          <button
            type="button"
            className={`${styles.langBtn} ${!isTh ? styles.langBtnActive : ""}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </div>

      {/* ── 5 Stat Cards (Matching Screenshots) ── */}
      <div className={styles.statsGrid}>
        {/* Total Subscribers */}
        <div className={styles.statCard}>
          <div className={styles.statCardHead}>
            <span className={styles.statCardLabel}>
              {isTh ? "จำนวนสมาชิกทั้งหมด" : "Total Subscribers"}
            </span>
            <span className={`${styles.statIconBox} ${styles.statIconBlue}`}>
              👥
            </span>
          </div>
          <div className={styles.statNumber}>{stats.total}</div>
        </div>

        {/* Gold Members */}
        <div className={styles.statCard}>
          <div className={styles.statCardHead}>
            <span className={styles.statCardLabel}>
              {isTh ? "สมาชิกทอง" : "Gold Members"}
            </span>
            <span className={`${styles.statIconBox} ${styles.statIconGold}`}>
              🎖️
            </span>
          </div>
          <div className={styles.statNumber}>{stats.gold}</div>
        </div>

        {/* Platinum Members */}
        <div className={styles.statCard}>
          <div className={styles.statCardHead}>
            <span className={styles.statCardLabel}>
              {isTh ? "สมาชิกแพลตตินัม" : "Platinum Members"}
            </span>
            <span className={`${styles.statIconBox} ${styles.statIconPurple}`}>
              👑
            </span>
          </div>
          <div className={styles.statNumber}>{stats.platinum}</div>
        </div>

        {/* Expiring in 7 Days */}
        <div className={styles.statCard}>
          <div className={styles.statCardHead}>
            <span className={styles.statCardLabel}>
              {isTh ? "หมดอายุใน 7 วัน" : "Expiring in 7 Days"}
            </span>
            <span className={`${styles.statIconBox} ${styles.statIconOrange}`}>
              🕒
            </span>
          </div>
          <div className={styles.statNumber}>{stats.expiringIn7}</div>
        </div>

        {/* Failed Payments */}
        <div className={styles.statCard}>
          <div className={styles.statCardHead}>
            <span className={styles.statCardLabel}>
              {isTh ? "การชำระเงินที่ล้มเหลว" : "Failed Payments"}
            </span>
            <span className={`${styles.statIconBox} ${styles.statIconRed}`}>
              ⚠️
            </span>
          </div>
          <div className={styles.statNumber}>{stats.failed}</div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={isTh ? "ค้นหาบริษัทหรืออีเมล" : "Search company or email"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="all">{isTh ? "แพ็กเกจ" : "All plans"}</option>
          <option value="gold">{isTh ? "โกลด์" : "Gold"}</option>
          <option value="platinum">{isTh ? "แพลตตินัม" : "Platinum"}</option>
          <option value="free">{isTh ? "ฟรี" : "Free"}</option>
        </select>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">{isTh ? "สถานะทั้งหมด" : "All statuses"}</option>
          <option value="active">{isTh ? "ใช้งานอยู่" : "Active"}</option>
          <option value="expiring">{isTh ? "หมดอายุเร็ว ๆ นี้" : "Expiring Soon"}</option>
          <option value="expired">{isTh ? "หมดอายุ" : "Expired"}</option>
          <option value="suspended">{isTh ? "ถูกระงับ" : "Suspended"}</option>
        </select>

        <select
          className={styles.filterSelect}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">{isTh ? "การชำระเงินทั้งหมด" : "All payments"}</option>
          <option value="paid">{isTh ? "ชำระเงินแล้ว" : "Paid"}</option>
          <option value="failed">{isTh ? "ล้มเหลว" : "Failed"}</option>
          <option value="none">{isTh ? "ไม่มี" : "None"}</option>
        </select>

        <select
          className={styles.filterSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="soonest">
            {isTh ? "☵ หมดอายุ: เร็วที่สุด" : "☵ Expiry: soonest"}
          </option>
          <option value="latest">
            {isTh ? "☵ หมดอายุ: ช้าที่สุด" : "☵ Expiry: latest"}
          </option>
        </select>

        <button type="button" className={styles.exportBtn} onClick={handleExportCSV}>
          <DownloadIcon size={16} />
          {isTh ? "ส่งออก CSV" : "Export CSV"}
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{isTh ? "สมาชิก" : "SUBSCRIBER"}</th>
                <th>{isTh ? "แผน" : "PLAN"}</th>
                <th>{isTh ? "วันที่เริ่มต้น" : "START DATE"}</th>
                <th>{isTh ? "วันที่หมดอายุ" : "EXPIRY DATE"}</th>
                <th>{isTh ? "สถานะ" : "STATUS"}</th>
                <th>{isTh ? "การชำระเงิน" : "PAYMENT"}</th>
                <th style={{ textAlign: "right" }}>{isTh ? "การดำเนินการ" : "ACTIONS"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  {/* Subscriber */}
                  <td>
                    <div className={styles.subscriberCell}>
                      <div
                        className={styles.avatarCircle}
                        style={{ backgroundColor: item.avatarBg }}
                      >
                        {item.avatarText}
                      </div>
                      <div>
                        <div className={styles.companyName}>{item.companyName}</div>
                        <div className={styles.companyEmail}>{item.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td>
                    {item.tier === "gold" && (
                      <span className={`${styles.planBadge} ${styles.planGold}`}>
                        <span className={styles.planDot} />
                        {isTh ? "โกลด์" : "Gold"}
                      </span>
                    )}
                    {item.tier === "platinum" && (
                      <span className={`${styles.planBadge} ${styles.planPlatinum}`}>
                        <span className={styles.planDot} />
                        {isTh ? "แพลตตินัม" : "Platinum"}
                      </span>
                    )}
                    {item.tier === "free" && (
                      <span className={`${styles.planBadge} ${styles.planFree}`}>
                        <span className={styles.planDot} />
                        {isTh ? "ฟรี" : "Free"}
                      </span>
                    )}
                  </td>

                  {/* Start Date */}
                  <td>
                    <span className={styles.startDateText}>
                      {isTh ? item.startDateTh : item.startDateEn}
                    </span>
                  </td>

                  {/* Expiry Date */}
                  <td>
                    <div className={styles.expiryCell}>
                      <span className={styles.expiryDateText}>
                        {isTh ? item.expiryDateTh : item.expiryDateEn}
                      </span>
                      <span
                        className={`${styles.countdownText} ${
                          item.countdownType === "expired"
                            ? styles.countdownExpired
                            : item.countdownType === "warning"
                            ? styles.countdownWarning
                            : styles.countdownNormal
                        }`}
                      >
                        {isTh ? item.countdownTh : item.countdownEn}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    {item.status === "expired" && (
                      <span className={`${styles.statusBadge} ${styles.statusExpired}`}>
                        <span className={styles.statusDot} />
                        {isTh ? "หมดอายุ" : "Expired"}
                      </span>
                    )}
                    {item.status === "expiring" && (
                      <span className={`${styles.statusBadge} ${styles.statusExpiring}`}>
                        <span className={styles.statusDot} />
                        {isTh ? "หมดอายุเร็ว ๆ นี้" : "Expiring Soon"}
                      </span>
                    )}
                    {item.status === "active" && (
                      <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                        <span className={styles.statusDot} />
                        {isTh ? "ใช้งานอยู่" : "Active"}
                      </span>
                    )}
                    {item.status === "suspended" && (
                      <span className={`${styles.statusBadge} ${styles.statusSuspended}`}>
                        <span className={styles.statusDot} />
                        {isTh ? "ถูกระงับ" : "Suspended"}
                      </span>
                    )}
                  </td>

                  {/* Payment */}
                  <td>
                    {item.paymentStatus === "failed" && (
                      <span className={`${styles.paymentBadge} ${styles.paymentFailed}`}>
                        {isTh ? "ล้มเหลว" : "Failed"}
                      </span>
                    )}
                    {item.paymentStatus === "paid" && (
                      <span className={`${styles.paymentBadge} ${styles.paymentPaid}`}>
                        {isTh ? "ชำระเงินแล้ว" : "Paid"}
                      </span>
                    )}
                    {item.paymentStatus === "none" && (
                      <span className={`${styles.paymentBadge} ${styles.paymentNone}`}>
                        {isTh ? "ไม่มี" : "None"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className={styles.actionsRow} style={{ justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className={styles.actionIconBtn}
                        title={isTh ? "ดูรายละเอียด" : "View details"}
                        onClick={() => setDetailItem(item)}
                      >
                        <EyeIcon size={18} />
                      </button>
                      <button
                        type="button"
                        className={styles.actionIconBtn}
                        title={isTh ? "แก้ไขแผนและวันหมดอายุ" : "Edit plan & expiry"}
                        onClick={() => openEdit(item)}
                      >
                        <EditIcon size={18} />
                      </button>
                      <button
                        type="button"
                        className={styles.actionIconBtn}
                        title={isTh ? "ระงับการสมัครสมาชิก" : "Suspend subscription"}
                        onClick={() => openSuspend(item)}
                      >
                        <DotsIcon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Footer Bar */}
        <div className={styles.tableBottomBar}>
          <div>
            {isTh
              ? `แสดง ${filtered.length} จาก ${subscribers.length} สมาชิก`
              : `Showing ${filtered.length} of ${subscribers.length} subscribers`}
          </div>
          <div>
            {isTh
              ? "การระงับอัตโนมัติ & การเตือนจะทำงานโดยอัตโนมัติในพื้นหลัง"
              : "Auto-suspend & reminders run automatically in the background"}
          </div>
        </div>
      </div>

      {/* ── MODAL 1: แก้ไขแผนและวันหมดอายุ (media_1790170209375.png) ── */}
      {editItem && (
        <div
          className={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditItem(null);
          }}
        >
          <div className={styles.modalBox}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>แก้ไขแผนและวันหมดอายุ</h2>
              <p className={styles.modalSubtitle}>
                ปรับระดับการสมัครสมาชิกและวันหมดอายุด้วยตนเอง
              </p>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setEditItem(null)}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Company Info Box */}
              <div className={styles.modalCompanyCard}>
                <div
                  className={styles.avatarCircle}
                  style={{ backgroundColor: editItem.avatarBg }}
                >
                  {editItem.avatarText}
                </div>
                <div>
                  <div className={styles.companyName}>{editItem.companyName}</div>
                  <div className={styles.companyEmail}>{editItem.email}</div>
                </div>
              </div>

              {/* ระดับ */}
              <div className={styles.modalFieldGroup}>
                <label className={styles.modalFieldLabel}>ระดับ</label>
                <select
                  className={styles.modalSelect}
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as PackageTier)}
                >
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="free">Free</option>
                </select>
              </div>

              {/* วันหมดอายุ */}
              <div className={styles.modalFieldGroup}>
                <label className={styles.modalFieldLabel}>วันหมดอายุ</label>
                <div className={styles.dateInputWrap}>
                  <input
                    type="date"
                    className={styles.modalInput}
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              {/* เหตุผล */}
              <div className={styles.modalFieldGroup}>
                <label className={styles.modalFieldLabel}>เหตุผล</label>
                <select
                  className={styles.modalSelect}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                >
                  <option value="" disabled>
                    เลือกเหตุผล
                  </option>
                  <option value="promo">โปรโมชั่นพิเศษ (Special Promotion)</option>
                  <option value="comp">ชดเชยระบบขัดข้อง (System Compensation)</option>
                  <option value="partner">สิทธิพิเศษพันธมิตร (Partner Privilege)</option>
                  <option value="trial">ขยายเวลาทดลองใช้งาน (Trial Extension)</option>
                  <option value="other">อื่น ๆ (Other)</option>
                </select>
              </div>

              {/* Actions */}
              <div className={styles.modalFoot}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.btnBlue}
                  onClick={handleSaveEdit}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ระงับการสมัครสมาชิก (media_1790170209395.png) ── */}
      {suspendItem && (
        <div
          className={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSuspendItem(null);
          }}
        >
          <div className={styles.modalBox}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>ระงับการสมัครสมาชิก</h2>
              <p className={styles.modalSubtitle}>
                เพิกถอนสิทธิ์การเข้าถึงสำหรับสมาชิกรายนี้ด้วยตนเอง
                {"\n"}การดำเนินการนี้จะไม่คืนเงินให้
              </p>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSuspendItem(null)}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Company Info Box */}
              <div className={styles.modalCompanyCard}>
                <div
                  className={styles.avatarCircle}
                  style={{ backgroundColor: suspendItem.avatarBg }}
                >
                  {suspendItem.avatarText}
                </div>
                <div>
                  <div className={styles.companyName}>{suspendItem.companyName}</div>
                  <div className={styles.companyEmail}>{suspendItem.email}</div>
                </div>
              </div>

              {/* เหตุผล */}
              <div className={styles.modalFieldGroup}>
                <label className={styles.modalFieldLabel}>เหตุผล</label>
                <select
                  className={styles.modalSelect}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                >
                  <option value="" disabled>
                    เลือกเหตุผล
                  </option>
                  <option value="tos">ละเมิดข้อตกลงและเงื่อนไขการใช้งาน</option>
                  <option value="payment">ค้างชำระค่าบริการเกินกำหนด</option>
                  <option value="fraud">ตรวจพบพฤติกรรมน่าสงสัย</option>
                  <option value="request">ลูกค้าร้องขอให้ระงับบัญชี</option>
                  <option value="other">อื่น ๆ</option>
                </select>
              </div>

              {/* หมายเหตุเพิ่มเติม */}
              <div className={styles.modalFieldGroup}>
                <label className={styles.modalFieldLabel}>หมายเหตุเพิ่มเติม</label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="หมายเหตุเพิ่มเติม"
                  value={suspendNote}
                  onChange={(e) => setSuspendNote(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className={styles.modalFoot}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setSuspendItem(null)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={styles.btnCoral}
                  onClick={handleConfirmSuspend}
                >
                  ระงับการเข้าถึง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── POPUP: รายละเอียดผู้สมัครสมาชิก (View Details) ── */}
      {detailItem && (
        <Modal
          title={isTh ? "รายละเอียดผู้สมัครสมาชิกและประวัติแพ็กเกจ" : "Subscriber & Subscription Details"}
          wide
          onClose={() => setDetailItem(null)}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setDetailItem(null)}
              >
                {isTh ? "ปิดหน้าต่าง" : "Close"}
              </button>
              <button
                type="button"
                className={styles.btnBlue}
                onClick={() => {
                  const target = detailItem;
                  setDetailItem(null);
                  openEdit(target);
                }}
              >
                {isTh ? "แก้ไขแผนสมาชิก" : "Edit Subscription"}
              </button>
            </div>
          }
        >
          <div>
            <div className={styles.modalCompanyCard} style={{ background: "#f8fafc", padding: 18 }}>
              <div
                className={styles.avatarCircle}
                style={{ backgroundColor: detailItem.avatarBg, width: 48, height: 48, fontSize: 16 }}
              >
                {detailItem.avatarText}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a", fontWeight: 800 }}>
                  {detailItem.companyName}
                </h3>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  {detailItem.email} · {detailItem.phone}
                </div>
              </div>
              <div>
                {detailItem.tier === "platinum" && (
                  <span className={`${styles.planBadge} ${styles.planPlatinum}`}>
                    <span className={styles.planDot} /> Platinum
                  </span>
                )}
                {detailItem.tier === "gold" && (
                  <span className={`${styles.planBadge} ${styles.planGold}`}>
                    <span className={styles.planDot} /> Gold
                  </span>
                )}
                {detailItem.tier === "free" && (
                  <span className={`${styles.planBadge} ${styles.planFree}`}>
                    <span className={styles.planDot} /> Free
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "16px 0 20px" }}>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{isTh ? "เลขประจำตัวผู้เสียภาษี" : "Tax ID"}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{detailItem.taxId}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{isTh ? "ผู้ติดต่อหลัก" : "Contact Person"}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{detailItem.contactPerson}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{isTh ? "สถานะการชำระเงิน" : "Payment Status"}</div>
                <div style={{ fontWeight: 700, color: detailItem.paymentStatus === "paid" ? "#16a34a" : "#dc2626", fontSize: 14 }}>
                  {detailItem.paymentStatus === "paid" ? "✓ Paid (ชำระแล้ว)" : detailItem.paymentStatus === "failed" ? "✕ Failed (ล้มเหลว)" : "None"}
                </div>
              </div>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{isTh ? "ต่ออายุอัตโนมัติ" : "Auto-Renew"}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                  {detailItem.autoRenew ? "เปิดใช้งาน (Auto-Renew On)" : "ปิดใช้งาน (Off)"}
                </div>
              </div>
            </div>

            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {isTh ? "ประวัติแพ็กเกจ (Plan History)" : "Plan History"}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {detailItem.history.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 13 }}>
                  <span style={{ color: "#2563eb", fontWeight: 700 }}>●</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{h.event} · <span style={{ color: "#64748b", fontWeight: 400 }}>{h.date}</span></div>
                    <div style={{ color: "#64748b" }}>{h.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {isTh ? "บันทึกกิจกรรมล่าสุด (Activity Log)" : "Recent Activity"}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {detailItem.activityLog.map((act, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 13 }}>
                  <span style={{ color: "#94a3b8" }}>○</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{act.action}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>{act.timestamp} · IP: {act.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
