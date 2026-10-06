"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readError, useAdminAuth } from "@/lib/admin/auth";
import { SearchIcon, DownloadIcon, EditIcon, CloseIcon } from "../icons";
import { TableFooter, type PageSize } from "../ui/TableFooter";
import styles from "./Packages.module.css";
import ui from "../ui/ui.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = "FREE" | "GOLD" | "PLATINUM";
type SubStatus = "active" | "expiring" | "expired" | "free";
type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

interface PackageTier {
  id: string;
  plan: Plan;
  name: string;
  price: number;
  billingCycle: string;
  quotaJobs: number;
  highlightJobs: number;
  candidateViews: number;
  aiMatching: boolean;
  inviteCandidates: boolean;
  dedicatedSupport: boolean;
  popular: boolean;
  sortOrder: number;
  features: string[];
}

interface Subscriber {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  logoText: string;
  logoColor: string;
  plan: Plan;
  planExpiresAt: string | null;
  status: SubStatus;
  daysLeft: number | null;
  jobCount: number;
  paymentCount: number;
  pendingPayment: { id: string; plan: Plan; amount: number; status: string; createdAt: string } | null;
  createdAt: string;
}

interface Payment {
  id: string;
  plan: Plan;
  amount: number;
  method: string;
  proofPath: string;
  proofName: string;
  status: PaymentStatus;
  createdAt: string;
  company: { id: string; name: string; email: string; plan: Plan; logoText: string; logoColor: string };
}

interface Stats {
  total: number;
  gold: number;
  platinum: number;
  expiringIn7: number;
  pendingPayments: number;
}

interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number; totalPages: number; }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<Plan, string> = { FREE: "ฟรี", GOLD: "Gold", PLATINUM: "Platinum" };
const PLAN_COLOR: Record<Plan, string> = { FREE: "#6b7280", GOLD: "#f59e0b", PLATINUM: "#8b5cf6" };
const STATUS_LABEL: Record<SubStatus, string> = { active: "ใช้งานอยู่", expiring: "หมดอายุเร็วๆ นี้", expired: "หมดอายุ", free: "ฟรี" };
const STATUS_COLOR: Record<SubStatus, string> = { active: "var(--green)", expiring: "#f59e0b", expired: "var(--red)", free: "var(--gray-400)" };

function formatBaht(n: number) {
  return n === 0 ? "ฟรี" : `฿${n.toLocaleString()}`;
}
function formatDate(iso: string | null) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Tier Card (Read-only) ──────────────────────────────────────────────────

function TierCard({
  tier,
}: {
  tier: PackageTier;
  onSave?: (plan: Plan, data: Partial<PackageTier>) => Promise<void>;
}) {
  const planColor = PLAN_COLOR[tier.plan];

  return (
    <div className={styles.tierCard} style={{ borderTopColor: planColor }}>
      {/* Header */}
      <div className={styles.tierHeader}>
        <div>
          <span className={styles.tierBadge} style={{ background: planColor }}>{PLAN_LABEL[tier.plan]}</span>
          {tier.popular && <span className={styles.tierPopular}>ยอดนิยม</span>}
        </div>
      </div>

      <div className={styles.tierPrice}>
        <span className={styles.tierPriceNum}>{formatBaht(tier.price)}</span>
        {tier.price > 0 && <span className={styles.tierPricePer}>/{tier.billingCycle === "month" ? "เดือน" : tier.billingCycle === "year" ? "ปี" : ""}</span>}
      </div>
      <div className={styles.tierName}>{tier.name}</div>
      <div className={styles.tierQuotas}>
        <div className={styles.tierQuota}><span>📄</span> โพสต์งาน: <strong>{tier.quotaJobs}</strong> ตำแหน่ง</div>
        <div className={styles.tierQuota}><span>⭐</span> Hot Job: <strong>{tier.highlightJobs}</strong> ตำแหน่ง</div>
        <div className={styles.tierQuota}><span>👤</span> ดูโปรไฟล์: <strong>{tier.candidateViews}</strong> คน</div>
        <div className={styles.tierQuota}><span>🤖</span> AI Match: <strong>{tier.aiMatching ? "✓" : "–"}</strong></div>
        <div className={styles.tierQuota}><span>✉️</span> เชิญตรง: <strong>{tier.inviteCandidates ? "✓" : "–"}</strong></div>
        <div className={styles.tierQuota}><span>🎧</span> Dedicated: <strong>{tier.dedicatedSupport ? "✓" : "–"}</strong></div>
      </div>
      <ul className={styles.tierFeatureList}>
        {tier.features.map((f) => <li key={f}><span>✓</span>{f}</li>)}
      </ul>
    </div>
  );
}

// ─── Edit Subscriber Modal ─────────────────────────────────────────────────

function EditSubscriberModal({
  sub,
  onClose,
  onSaved,
}: {
  sub: Subscriber;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { adminFetch } = useAdminAuth();
  const [plan, setPlan] = useState<Plan>(sub.plan);
  const [expiresAt, setExpiresAt] = useState(sub.planExpiresAt?.slice(0, 10) ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      const r = await adminFetch(`/admin/packages/subscribers/${sub.id}`, {
        method: "PATCH",
        body: JSON.stringify({ plan, planExpiresAt: expiresAt || null }),
      });
      if (!r.ok) throw await readError(r, "บันทึกไม่สำเร็จ");
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const suspend = async () => {
    if (!confirm(`ระงับ ${sub.name}?\nบริษัทจะถูกลดเป็น Free ทันที`)) return;
    setSaving(true);
    try {
      const r = await adminFetch(`/admin/packages/subscribers/${sub.id}`, {
        method: "PATCH",
        body: JSON.stringify({ suspend: true }),
      });
      if (!r.ok) throw await readError(r, "ระงับบัญชีไม่สำเร็จ");
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ระงับบัญชีไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={ui.backdrop} onClick={onClose}>
      <div className={ui.modal} onClick={(e) => e.stopPropagation()}>
        <div className={ui.modalHead}>
          <h2>แก้ไขแพ็กเกจ — {sub.name}</h2>
          <button type="button" className={ui.closeButton} onClick={onClose}><CloseIcon size={18} /></button>
        </div>
        <div className={ui.modalBody}>
          {err && <p className={ui.error}>{err}</p>}
          <div className={styles.editSubGrid}>
            <div className={styles.editSubField}>
              <label>แพ็กเกจ</label>
              <select className={styles.editSelect} value={plan} onChange={(e) => setPlan(e.target.value as Plan)}>
                <option value="FREE">ฟรี</option>
                <option value="GOLD">Gold</option>
                <option value="PLATINUM">Platinum</option>
              </select>
            </div>
            <div className={styles.editSubField}>
              <label>วันหมดอายุ</label>
              <input type="date" className={styles.editInput} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} disabled={plan === "FREE"} />
            </div>
          </div>
          <p className={styles.editSubNote}>
            บริษัท: {sub.name} · อีเมล: {sub.email}<br />
            งานที่ประกาศ: {sub.jobCount} ตำแหน่ง · สถานะปัจจุบัน: {STATUS_LABEL[sub.status]}
          </p>
        </div>
        <div className={ui.modalFoot}>
          <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={suspend} disabled={saving}>ระงับบัญชี</button>
          <button type="button" className={ui.button} onClick={onClose} disabled={saving}>ยกเลิก</button>
          <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={save} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Review Payment Modal ──────────────────────────────────────────────────

function ReviewPaymentModal({
  payment,
  onClose,
  onDone,
}: {
  payment: Payment;
  onClose: () => void;
  onDone: () => void;
}) {
  const { adminFetch } = useAdminAuth();
  const [days, setDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const review = async (status: "APPROVED" | "REJECTED") => {
    setSaving(true);
    setErr("");
    try {
      const r = await adminFetch(`/admin/packages/payments/${payment.id}/review`, {
        method: "POST",
        body: JSON.stringify({ status, durationDays: days }),
      });
      if (!r.ok) throw await readError(r, "ดำเนินการไม่สำเร็จ");
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={ui.backdrop} onClick={onClose}>
      <div className={ui.modal} onClick={(e) => e.stopPropagation()}>
        <div className={ui.modalHead}>
          <h2>ตรวจสอบการชำระเงิน</h2>
          <button type="button" className={ui.closeButton} onClick={onClose}><CloseIcon size={18} /></button>
        </div>
        <div className={ui.modalBody}>
          {err && <p className={ui.error}>{err}</p>}
          <div className={styles.paymentDetail}>
            <div className={styles.paymentCompany}>
              <span className={styles.companyAvatar} style={{ background: payment.company.logoColor }}>
                {payment.company.logoText}
              </span>
              <div>
                <strong>{payment.company.name}</strong>
                <p>{payment.company.email}</p>
              </div>
            </div>
            <div className={styles.paymentInfo}>
              <div><span>แพ็กเกจที่สมัคร:</span><strong>{PLAN_LABEL[payment.plan]}</strong></div>
              <div><span>ยอดชำระ:</span><strong>฿{payment.amount.toLocaleString()}</strong></div>
              <div><span>วิธีชำระ:</span><strong>{payment.method}</strong></div>
              <div><span>วันที่แจ้ง:</span><strong>{formatDate(payment.createdAt)}</strong></div>
              <div><span>หลักฐาน:</span><strong>{payment.proofName}</strong></div>
            </div>
            {payment.status === "PENDING" && (
              <div className={styles.editSubField} style={{ marginTop: 16 }}>
                <label>ระยะเวลาเมื่ออนุมัติ (วัน)</label>
                <input type="number" min={1} max={365} className={styles.editInput} value={days} onChange={(e) => setDays(Number(e.target.value))} />
              </div>
            )}
          </div>
        </div>
        <div className={ui.modalFoot}>
          <button type="button" className={ui.button} onClick={onClose} disabled={saving}>ปิด</button>
          {payment.status === "PENDING" && (
            <>
              <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => review("REJECTED")} disabled={saving}>ปฏิเสธ</button>
              <button type="button" className={`${ui.button} ${ui.buttonGold}`} onClick={() => review("APPROVED")} disabled={saving}>
                {saving ? "กำลังอนุมัติ..." : "อนุมัติ"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function PackagesView() {
  const { adminFetch } = useAdminAuth();

  // Package Tier Definitions
  const [tiers, setTiers] = useState<PackageTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tierError, setTierError] = useState("");

  // Subscribers
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscribers, setSubscribers] = useState<Paginated<Subscriber> | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("soonest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);

  // Payments
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentFilter, setPaymentFilter] = useState("PENDING");

  // Modals
  const [editSub, setEditSub] = useState<Subscriber | null>(null);
  const [reviewPayment, setReviewPayment] = useState<Payment | null>(null);

  // Active tab
  const [tab, setTab] = useState<"subscribers" | "tiers" | "payments">("subscribers");

  // ─── Load Tiers ───────────────────────────────────────────────────────────
  const loadTiers = useCallback(async () => {
    setTiersLoading(true);
    setTierError("");
    try {
      const r = await adminFetch("/admin/packages/tiers");
      if (!r.ok) throw await readError(r, "โหลดข้อมูลแพ็กเกจไม่สำเร็จ");
      setTiers(await r.json());
    } catch (e) {
      setTierError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    } finally {
      setTiersLoading(false);
    }
  }, [adminFetch]);

  // ─── Load Stats + Subscribers ─────────────────────────────────────────────
  const loadSubscribers = useCallback(async () => {
    setSubLoading(true);
    setSubError("");
    try {
      const qs = new URLSearchParams({ sort, page: String(page), pageSize: String(pageSize) });
      if (search) qs.set("q", search);
      if (planFilter !== "all") qs.set("plan", planFilter);
      if (statusFilter !== "all") qs.set("status", statusFilter);

      const [statsR, subsR] = await Promise.all([
        adminFetch("/admin/packages/stats"),
        adminFetch(`/admin/packages/subscribers?${qs}`),
      ]);
      if (!statsR.ok) throw await readError(statsR, "โหลดสถิติไม่สำเร็จ");
      if (!subsR.ok) throw await readError(subsR, "โหลดรายชื่อบริษัทไม่สำเร็จ");
      setStats(await statsR.json());
      setSubscribers(await subsR.json());
    } catch (e) {
      setSubError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    } finally {
      setSubLoading(false);
    }
  }, [adminFetch, search, planFilter, statusFilter, sort, page, pageSize]);

  // ─── Load Payments ────────────────────────────────────────────────────────
  const loadPayments = useCallback(async () => {
    try {
      const r = await adminFetch(`/admin/packages/payments?status=${paymentFilter}`);
      if (!r.ok) throw await readError(r, "โหลดการชำระเงินไม่สำเร็จ");
      setPayments(await r.json());
    } catch (_) {
      // silently fail for payments
    }
  }, [adminFetch, paymentFilter]);

  useEffect(() => { void loadTiers(); }, [loadTiers]);
  useEffect(() => { void loadSubscribers(); }, [loadSubscribers]);
  useEffect(() => { void loadPayments(); }, [loadPayments]);

  // Save tier
  const saveTier = async (plan: Plan, data: Partial<PackageTier>) => {
    const r = await adminFetch(`/admin/packages/tiers/${plan}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!r.ok) throw await readError(r, "บันทึกไม่สำเร็จ");
    await loadTiers();
  };

  // Export CSV
  const exportCsv = () => {
    const items = subscribers?.items ?? [];
    const header = "ชื่อบริษัท,อีเมล,แพ็กเกจ,วันหมดอายุ,สถานะ,จำนวนงาน\r\n";
    const rows = items.map((s) =>
      `"${s.name}","${s.email}",${s.plan},${s.planExpiresAt?.slice(0, 10) ?? ""},${s.status},${s.jobCount}`
    ).join("\r\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.root}>
      {/* ─── Page Header ─────────────────────────────────────── */}
      <div className={ui.pageHead}>
        <div>
          <h1>จัดการแพ็กเกจ</h1>
          <p>กำหนดคำนิยาม Package Tier, ติดตามสมาชิก Owner, และตรวจสอบการชำระเงิน</p>
        </div>
      </div>

      {/* ─── Stat Cards ──────────────────────────────────────── */}
      <div className={ui.statsGrid}>
        {[
          { label: "สมาชิกที่ชำระเงิน", value: stats?.total ?? "–", icon: "💼", color: "var(--navy-900)" },
          { label: "สมาชิก Gold", value: stats?.gold ?? "–", icon: "🎖️", color: "#f59e0b" },
          { label: "สมาชิก Platinum", value: stats?.platinum ?? "–", icon: "👑", color: "#8b5cf6" },
          { label: "หมดอายุใน 7 วัน", value: stats?.expiringIn7 ?? "–", icon: "⏰", color: "var(--red)" },
          { label: "รอตรวจสอบชำระเงิน", value: stats?.pendingPayments ?? "–", icon: "💳", color: "#0ea5e9" },
        ].map((c) => (
          <div key={c.label} className={ui.statCard}>
            <span className={ui.statIcon} style={{ background: c.color }}>{c.icon}</span>
            <span>
              <span className={ui.statLabel}>{c.label}</span>
              <span className={ui.statValue}>{c.value}</span>
            </span>
          </div>
        ))}
      </div>

      {/* ─── Tab Bar ─────────────────────────────────────────── */}
      <div className={ui.tabList}>
        {(["subscribers", "tiers", "payments"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`${ui.tabBtn} ${tab === t ? ui.tabBtnActive : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "subscribers" ? "🏢 รายชื่อบริษัทสมาชิก" : t === "tiers" ? "⚙️ กำหนด Package Tier" : "💳 ตรวจสอบการชำระเงิน"}
            {t === "payments" && stats && stats.pendingPayments > 0 && (
              <span className={styles.badge}>{stats.pendingPayments}</span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          TAB: Subscribers
         ════════════════════════════════════════ */}
      {tab === "subscribers" && (
        <section className={ui.card}>
          {/* Filter Bar */}
          <div className={ui.toolbar}>
            <label className={ui.search}>
              <SearchIcon size={18} />
              <input value={search} placeholder="ค้นหาชื่อบริษัทหรืออีเมล..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </label>
            <select className={ui.select} value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}>
              <option value="all">แพ็กเกจทั้งหมด</option>
              <option value="FREE">ฟรี</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
            </select>
            <select className={ui.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">ใช้งานอยู่</option>
              <option value="expiring">หมดอายุเร็วๆ นี้</option>
              <option value="expired">หมดอายุ</option>
            </select>
            <select className={ui.select} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="soonest">หมดอายุ: เร็วสุด</option>
              <option value="latest">หมดอายุ: ช้าสุด</option>
              <option value="name_asc">ชื่อ A → Z</option>
            </select>
            <button type="button" className={ui.button} onClick={exportCsv}>
              <DownloadIcon size={16} /> Export CSV
            </button>
          </div>

          {subError ? (
            <div className={ui.empty} role="alert">{subError}</div>
          ) : (
            <div className={ui.tableScroll}>
              <table className={ui.table}>
                <thead>
                  <tr>
                    <th>บริษัท</th>
                    <th>แพ็กเกจ</th>
                    <th>วันหมดอายุ</th>
                    <th>คงเหลือ</th>
                    <th>สถานะ</th>
                    <th>งาน</th>
                    <th style={{ textAlign: "right" }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers?.items.length === 0 && (
                    <tr><td colSpan={7} className={ui.empty}>{subLoading ? "กำลังโหลด..." : "ไม่พบบริษัทที่ตรงกับเงื่อนไข"}</td></tr>
                  )}
                  {subscribers?.items.map((s) => (
                    <tr key={s.id} style={{ opacity: subLoading ? 0.6 : 1 }}>
                      <td>
                        <div className={styles.subCompany}>
                          <span className={styles.companyAvatar} style={{ background: s.logoColor }}>{s.logoText}</span>
                          <div>
                            <div className={ui.strong}>{s.name}</div>
                            <div className={styles.companyEmail}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.planBadge} style={{ background: PLAN_COLOR[s.plan] + "22", color: PLAN_COLOR[s.plan], border: `1px solid ${PLAN_COLOR[s.plan]}44` }}>
                          {PLAN_LABEL[s.plan]}
                        </span>
                        {s.pendingPayment && <span className={styles.pendingDot} title="มีการชำระเงินรอตรวจสอบ">●</span>}
                      </td>
                      <td>{formatDate(s.planExpiresAt)}</td>
                      <td>
                        {s.daysLeft === null ? "–" : s.daysLeft < 0
                          ? <span style={{ color: "var(--red)" }}>หมดอายุ {Math.abs(s.daysLeft)} วัน</span>
                          : s.daysLeft <= 7
                            ? <span style={{ color: "#f59e0b" }}>เหลือ {s.daysLeft} วัน</span>
                            : <span>เหลือ {s.daysLeft} วัน</span>
                        }
                      </td>
                      <td>
                        <span className={styles.statusDot} style={{ color: STATUS_COLOR[s.status] }}>● {STATUS_LABEL[s.status]}</span>
                      </td>
                      <td>{s.jobCount} ตำแหน่ง</td>
                      <td style={{ textAlign: "right" }}>
                        <button type="button" className={styles.actionBtn} onClick={() => setEditSub(s)} title="แก้ไขแพ็กเกจ">
                          <EditIcon size={15} /> แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {subscribers && (
            <TableFooter
              page={subscribers.page}
              pageSize={pageSize}
              total={subscribers.total}
              totalPages={subscribers.totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </section>
      )}

      {/* ════════════════════════════════════════
          TAB: Tier Definitions
         ════════════════════════════════════════ */}
      {tab === "tiers" && (
        <div>
          <p className={styles.tierNote}>
            ⚙️ กำหนดรายละเอียดแต่ละ Package Tier ที่ Owner เห็นบนหน้าเลือกแพ็กเกจ การเปลี่ยนแปลงมีผลทันทีกับหน้าแสดงราคา
          </p>
          {tierError ? (
            <div className={ui.empty}>{tierError}</div>
          ) : tiersLoading ? (
            <div className={ui.empty}>กำลังโหลด...</div>
          ) : (
            <div className={styles.tierGrid}>
              {tiers.map((tier) => (
                <TierCard key={tier.plan} tier={tier} onSave={saveTier} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB: Payments
         ════════════════════════════════════════ */}
      {tab === "payments" && (
        <section className={ui.card}>
          <div className={ui.toolbar}>
            <select className={ui.select} value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="PENDING">รอตรวจสอบ</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="REJECTED">ปฏิเสธแล้ว</option>
              <option value="all">ทั้งหมด</option>
            </select>
          </div>
          <div className={ui.tableScroll}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>บริษัท</th>
                  <th>แพ็กเกจ</th>
                  <th>ยอดชำระ</th>
                  <th>วิธีชำระ</th>
                  <th>วันที่แจ้ง</th>
                  <th>สถานะ</th>
                  <th style={{ textAlign: "right" }}>ตรวจสอบ</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr><td colSpan={7} className={ui.empty}>ไม่มีรายการที่ตรงกับเงื่อนไข</td></tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.subCompany}>
                        <span className={styles.companyAvatar} style={{ background: p.company.logoColor }}>{p.company.logoText}</span>
                        <div>
                          <div className={ui.strong}>{p.company.name}</div>
                          <div className={styles.companyEmail}>{p.company.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.planBadge} style={{ background: PLAN_COLOR[p.plan] + "22", color: PLAN_COLOR[p.plan] }}>{PLAN_LABEL[p.plan]}</span></td>
                    <td className={ui.strong}>฿{p.amount.toLocaleString()}</td>
                    <td>{p.method}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      {p.status === "PENDING" && <span className={`${ui.badge} ${ui.badgeGold}`}>รอตรวจสอบ</span>}
                      {p.status === "APPROVED" && <span className={`${ui.badge} ${ui.badgeGreen}`}>อนุมัติแล้ว</span>}
                      {p.status === "REJECTED" && <span className={`${ui.badge} ${ui.badgeRed}`}>ปฏิเสธแล้ว</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className={styles.actionBtn} onClick={() => setReviewPayment(p)}>
                        {p.status === "PENDING" ? "ตรวจสอบ" : "ดูรายละเอียด"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── Modals ────────────────────────────────────── */}
      {editSub && (
        <EditSubscriberModal
          sub={editSub}
          onClose={() => setEditSub(null)}
          onSaved={() => { setEditSub(null); void loadSubscribers(); }}
        />
      )}
      {reviewPayment && (
        <ReviewPaymentModal
          payment={reviewPayment}
          onClose={() => setReviewPayment(null)}
          onDone={() => { setReviewPayment(null); void loadSubscribers(); void loadPayments(); }}
        />
      )}
    </div>
  );
}
