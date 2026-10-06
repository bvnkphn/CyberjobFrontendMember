"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin/auth";
import styles from "./Dashboard.module.css";
import ui from "../ui/ui.module.css";

interface DashboardData {
  stats: {
    totalCandidates: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
    totalResumes: number;
    certificatesCount: number;
    pendingVerifications: number;
    pendingTickets: number;
    pendingPayments: number;
  };
  scores: {
    matchingScore: number;
    resumeScore: number;
  };
  topSkills: Array<{ name: string; count: number }>;
  topPositions: Array<{ title: string; count: number }>;
  monthlyData: Array<{ month: string; candidates: number; companies: number }>;
}

/** สร้างเส้น SVG Curve นุ่มนวลแบบ Natural Cubic Spline */
function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function DashboardView() {
  const { adminFetch } = useAdminAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Controls for monthly chart
  const [timeRange, setTimeRange] = useState<"6m" | "12m">("6m");
  const [chartType, setChartType] = useState<"area" | "bar">("bar");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    adminFetch("/admin/dashboard/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (mounted && json) setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch]);

  const stats = data?.stats ?? {
    totalCandidates: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalResumes: 0,
    certificatesCount: 0,
    pendingVerifications: 0,
    pendingTickets: 0,
    pendingPayments: 0,
  };

  const scores = data?.scores ?? {
    matchingScore: 0,
    resumeScore: 0,
  };

  const topSkills = data?.topSkills ?? [];
  const topPositions = data?.topPositions ?? [];
  const monthlyData = data?.monthlyData ?? [];

  // Calculate highest count for skill progress bar
  const maxSkillCount = topSkills.length > 0 ? Math.max(...topSkills.map((s) => s.count), 1) : 1;

  return (
    <div className={styles.container}>
      <div className={ui.pageHead}>
        <div>
          <h1>Dashboard</h1>
          <p>ภาพรวมระบบและสถิติแพลตฟอร์ม Cyber Job {loading && "(กำลังโหลดข้อมูลสด...)"}</p>
        </div>
      </div>

      {/* ── รายการที่ต้องดำเนินการ (Action Required) ── */}
      <section className={styles.actionSection} aria-label="รายการที่ต้องดำเนินการ">
        <h2 className={styles.sectionTitle}>รายการที่ต้องดำเนินการ (Action Required)</h2>
        <div className={styles.actionGrid}>
          <Link href="/admin/companies" className={styles.actionCard}>
            <div className={styles.actionLeft}>
              <div className={`${styles.actionIconBox} ${styles.actionIconYellow}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <line x1="9" y1="22" x2="9" y2="22.01" />
                  <line x1="15" y1="22" x2="15" y2="22.01" />
                  <line x1="8" y1="6" x2="8" y2="6.01" />
                  <line x1="12" y1="6" x2="12" y2="6.01" />
                  <line x1="16" y1="6" x2="16" y2="6.01" />
                  <line x1="8" y1="10" x2="8" y2="10.01" />
                  <line x1="12" y1="10" x2="12" y2="10.01" />
                  <line x1="16" y1="10" x2="16" y2="10.01" />
                  <line x1="8" y1="14" x2="8" y2="14.01" />
                  <line x1="12" y1="14" x2="12" y2="14.01" />
                  <line x1="16" y1="14" x2="16" y2="14.01" />
                </svg>
              </div>
              <div>
                <div className={styles.actionLabel}>บริษัทรอยืนยัน</div>
                <div className={styles.actionValueRow}>
                  <span className={`${styles.actionCount} ${styles.actionCountAlert}`}>{stats.pendingVerifications}</span>
                  <span className={styles.actionUnit}>รายการ</span>
                </div>
              </div>
            </div>
            <div className={styles.actionArrow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </Link>

          <div className={styles.actionCard}>
            <div className={styles.actionLeft}>
              <div className={`${styles.actionIconBox} ${styles.actionIconGreen}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className={styles.actionLabel}>Ticket รอตอบกลับ</div>
                <div className={styles.actionValueRow}>
                  <span className={styles.actionCount}>{stats.pendingTickets}</span>
                  <span className={styles.actionUnit}>{stats.pendingTickets === 0 ? "ไม่มีรายการค้าง" : "รายการ"}</span>
                </div>
              </div>
            </div>
            <div className={styles.actionArrow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 Stat Cards (เชื่อมต่อฐานข้อมูลจริงทั้งหมด) ── */}
      <section className={styles.statsGrid} aria-label="สถิติหลัก">
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#e8effc", color: "#1d4ed8" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg>
            </div>
            <span className={styles.statTitle}>ผู้สมัครทั้งหมด</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>{stats.totalCandidates}</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>คน</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#fef8e7", color: "#f59e0b" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/></svg>
            </div>
            <span className={styles.statTitle}>บริษัททั้งหมด</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>{stats.totalCompanies}</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>บริษัท</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#f0f4f9", color: "#0f2242" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <span className={styles.statTitle}>ตำแหน่งงานเปิดรับ</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>{stats.totalJobs}</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>ตำแหน่ง</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#fef3c7", color: "#d97706" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </div>
            <span className={styles.statTitle}>Certificate / Resume</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>{stats.certificatesCount}</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>ชุด</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#f0f4f9", color: "#1e3a8a" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <span className={styles.statTitle}>ประกาศงานทั้งหมด</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>{stats.totalJobs}</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>รายการ</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#fef3c7", color: "#b45309" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span className={styles.statTitle}>การสมัครงาน</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>{stats.totalApplications}</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>ครั้ง</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Monthly Chart & Average Score Gauges ── */}
      <div className={styles.twoColGrid}>
        {(() => {
          const displayedMonthly = timeRange === "6m" ? monthlyData.slice(-6) : monthlyData;
          const periodCandidates = displayedMonthly.reduce((sum, d) => sum + d.candidates, 0);
          const periodCompanies = displayedMonthly.reduce((sum, d) => sum + d.companies, 0);

          const rawMonthlyMax = Math.max(...displayedMonthly.map((d) => Math.max(d.candidates, d.companies)), 1);
          const chartMax = Math.max(rawMonthlyMax + (rawMonthlyMax <= 3 ? 1 : 2), 4);

          const svgW = 800;
          const svgH = 240;
          const padLeft = 60;
          const padRight = 740;
          const plotW = padRight - padLeft;
          const yTop = 32;
          const yBaseline = 192;
          const plotH = yBaseline - yTop;
          const numItems = displayedMonthly.length;
          const stepX = numItems > 1 ? plotW / (numItems - 1) : plotW;

          const candPoints = displayedMonthly.map((d, i) => ({
            x: padLeft + i * stepX,
            y: yBaseline - (d.candidates / chartMax) * plotH,
          }));

          const compPoints = displayedMonthly.map((d, i) => ({
            x: padLeft + i * stepX,
            y: yBaseline - (d.companies / chartMax) * plotH,
          }));

          const candLinePath = buildSmoothPath(candPoints);
          const candAreaPath =
            candPoints.length > 0
              ? `${candLinePath} L ${candPoints[candPoints.length - 1].x.toFixed(1)} ${yBaseline} L ${candPoints[0].x.toFixed(1)} ${yBaseline} Z`
              : "";

          const compLinePath = buildSmoothPath(compPoints);
          const compAreaPath =
            compPoints.length > 0
              ? `${compLinePath} L ${compPoints[compPoints.length - 1].x.toFixed(1)} ${yBaseline} L ${compPoints[0].x.toFixed(1)} ${yBaseline} Z`
              : "";

          return (
            <div className={styles.panelCard}>
              <div className={styles.chartHeadRow}>
                <div>
                  <h3>ผู้สมัครและบริษัทใหม่รายเดือน</h3>
                  <p>จำนวนผู้สมัครและบริษัทที่สมัครใหม่ในระบบ</p>
                </div>
                <div className={styles.chartControls}>
                  {/* Range Toggle: 6 เดือน vs 12 เดือน */}
                  <div className={styles.segmentedControl}>
                    <button
                      type="button"
                      className={`${styles.segmentBtn} ${timeRange === "6m" ? styles.segmentBtnActive : ""}`}
                      onClick={() => setTimeRange("6m")}
                    >
                      6 เดือน
                    </button>
                    <button
                      type="button"
                      className={`${styles.segmentBtn} ${timeRange === "12m" ? styles.segmentBtnActive : ""}`}
                      onClick={() => setTimeRange("12m")}
                    >
                      12 เดือน
                    </button>
                  </div>


                </div>
              </div>

              {/* Quick Metrics Badges */}
              <div className={styles.metricChips}>
                <span className={`${styles.chip} ${styles.chipBlue}`}>
                  👤 ในช่วงนี้: <strong>+{periodCandidates}</strong> ผู้สมัคร
                </span>
                <span className={`${styles.chip} ${styles.chipGold}`}>
                  🏢 ในช่วงนี้: <strong>+{periodCompanies}</strong> บริษัท
                </span>
              </div>

              {/* Modern Responsive SVG Chart */}
              <div className={styles.chartWrapper}>
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ overflow: "visible", display: "block" }}
                >
                  <defs>
                    <linearGradient id="candAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e40af" stopOpacity="0.25" />
                      <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="compAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                      <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="barCandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <linearGradient id="barCompGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <filter id="glowNavy" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1e40af" floodOpacity="0.2" />
                    </filter>
                    <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1={padLeft - 10} y1={yTop} x2={padRight + 10} y2={yTop} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1={padLeft - 10} y1={yTop + plotH * 0.33} x2={padRight + 10} y2={yTop + plotH * 0.33} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1={padLeft - 10} y1={yTop + plotH * 0.66} x2={padRight + 10} y2={yTop + plotH * 0.66} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1={padLeft - 10} y1={yBaseline} x2={padRight + 10} y2={yBaseline} stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Y Axis Labels */}
                  <text x={padLeft - 16} y={yTop + 4} fontSize="11" fill="#94a3b8" textAnchor="end" fontWeight="500">
                    {chartMax}
                  </text>
                  <text x={padLeft - 16} y={yTop + plotH * 0.33 + 4} fontSize="11" fill="#94a3b8" textAnchor="end" fontWeight="500">
                    {Math.round(chartMax * 0.67)}
                  </text>
                  <text x={padLeft - 16} y={yTop + plotH * 0.66 + 4} fontSize="11" fill="#94a3b8" textAnchor="end" fontWeight="500">
                    {Math.round(chartMax * 0.33)}
                  </text>
                  <text x={padLeft - 16} y={yBaseline + 4} fontSize="11" fill="#94a3b8" textAnchor="end" fontWeight="500">
                    0
                  </text>

                  {/* ── MODE 1: AREA CURVE ── */}
                  {chartType === "area" && (
                    <>
                      {/* Candidates Area & Stroke */}
                      <path d={candAreaPath} fill="url(#candAreaGrad)" />
                      <path d={candLinePath} fill="none" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" />

                      {/* Companies Area & Stroke */}
                      <path d={compAreaPath} fill="url(#compAreaGrad)" />
                      <path d={compLinePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />

                      {/* Data Points */}
                      {candPoints.map((pt, idx) => {
                        const candVal = displayedMonthly[idx].candidates;
                        const compVal = displayedMonthly[idx].companies;
                        const compPt = compPoints[idx];
                        const isHovered = hoverIndex === idx;

                        return (
                          <g key={idx}>
                            {/* Cand Point */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={candVal > 0 ? (isHovered ? 7 : 5.5) : 3}
                              fill={candVal > 0 ? "#1e40af" : "#cbd5e1"}
                              stroke="#ffffff"
                              strokeWidth={candVal > 0 ? 2.5 : 1.5}
                              filter={candVal > 0 ? "url(#glowNavy)" : undefined}
                            />
                            {candVal > 0 && !isHovered && (
                              <text x={pt.x} y={pt.y - 9} fontSize="11" fontWeight="700" fill="#1e40af" textAnchor="middle">
                                {candVal}
                              </text>
                            )}

                            {/* Comp Point */}
                            <circle
                              cx={compPt.x}
                              cy={compPt.y}
                              r={compVal > 0 ? (isHovered ? 7 : 5.5) : 2.5}
                              fill={compVal > 0 ? "#f59e0b" : "#e2e8f0"}
                              stroke="#ffffff"
                              strokeWidth={compVal > 0 ? 2.5 : 1}
                              filter={compVal > 0 ? "url(#glowGold)" : undefined}
                            />
                            {compVal > 0 && !isHovered && (
                              <text x={compPt.x} y={compPt.y - 9} fontSize="11" fontWeight="700" fill="#b45309" textAnchor="middle">
                                {compVal}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* ── MODE 2: MODERN PILL BARS ── */}
                  {chartType === "bar" && (
                    <>
                      {displayedMonthly.map((m, idx) => {
                        const x = padLeft + idx * stepX;
                        const trackW = timeRange === "6m" ? 44 : 28;
                        const barW = timeRange === "6m" ? 16 : 10;
                        const candH = m.candidates > 0 ? (m.candidates / chartMax) * plotH : 0;
                        const compH = m.companies > 0 ? (m.companies / chartMax) * plotH : 0;
                        const candY = yBaseline - candH;
                        const compY = yBaseline - compH;

                        return (
                          <g key={idx}>
                            {/* Background subtle capsule */}
                            <rect
                              x={x - trackW / 2}
                              y={yTop}
                              width={trackW}
                              height={plotH}
                              rx={trackW / 2}
                              fill="#f8fafc"
                            />

                            {/* Candidate bar */}
                            {m.candidates > 0 ? (
                              <>
                                <rect
                                  x={x - barW - 1}
                                  y={candY}
                                  width={barW}
                                  height={candH}
                                  rx={barW / 2}
                                  fill="url(#barCandGrad)"
                                  filter="url(#glowNavy)"
                                />
                                <text
                                  x={x - barW / 2 - 1}
                                  y={candY - 6}
                                  fontSize="11"
                                  fontWeight="700"
                                  fill="#1e40af"
                                  textAnchor="middle"
                                >
                                  {m.candidates}
                                </text>
                              </>
                            ) : (
                              <circle cx={x - barW / 2 - 1} cy={yBaseline - 4} r="2.5" fill="#cbd5e1" />
                            )}

                            {/* Company bar */}
                            {m.companies > 0 ? (
                              <>
                                <rect
                                  x={x + 1}
                                  y={compY}
                                  width={barW}
                                  height={compH}
                                  rx={barW / 2}
                                  fill="url(#barCompGrad)"
                                  filter="url(#glowGold)"
                                />
                                <text
                                  x={x + barW / 2 + 1}
                                  y={compY - 6}
                                  fontSize="11"
                                  fontWeight="700"
                                  fill="#b45309"
                                  textAnchor="middle"
                                >
                                  {m.companies}
                                </text>
                              </>
                            ) : (
                              <circle cx={x + barW / 2 + 1} cy={yBaseline - 4} r="2" fill="#e2e8f0" />
                            )}
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* Month X Labels & Interactive Hover Columns */}
                  {displayedMonthly.map((m, idx) => {
                    const x = padLeft + idx * stepX;
                    const hasData = m.candidates > 0 || m.companies > 0;

                    return (
                      <g key={idx}>
                        {/* Month Label */}
                        <text
                          x={x}
                          y={yBaseline + 22}
                          fontSize="11.5"
                          fill={hasData ? "#0f172a" : "#94a3b8"}
                          fontWeight={hasData ? "700" : "500"}
                          textAnchor="middle"
                        >
                          {m.month}
                        </text>

                        {/* Interactive hover overlay target */}
                        <rect
                          x={x - stepX / 2}
                          y={yTop - 10}
                          width={stepX}
                          height={plotH + 40}
                          fill="transparent"
                          cursor="pointer"
                          onMouseEnter={() => setHoverIndex(idx)}
                          onMouseLeave={() => setHoverIndex(null)}
                        />
                      </g>
                    );
                  })}

                  {/* Hover Indicator & Floating Card Tooltip */}
                  {hoverIndex !== null && displayedMonthly[hoverIndex] && (() => {
                    const idx = hoverIndex;
                    const m = displayedMonthly[idx];
                    const x = padLeft + idx * stepX;
                    const candY = yBaseline - (m.candidates / chartMax) * plotH;
                    const compY = yBaseline - (m.companies / chartMax) * plotH;

                    // Tooltip positioning
                    const tipW = 140;
                    const tipH = 68;
                    let tipX = x - tipW / 2;
                    if (tipX < 15) tipX = 15;
                    if (tipX + tipW > svgW - 15) tipX = svgW - tipW - 15;

                    const topYPos = Math.min(candY, compY);
                    let tipY = topYPos - tipH - 12;
                    if (tipY < 5) tipY = topYPos + 18;

                    return (
                      <g pointerEvents="none">
                        {/* Vertical Highlight Band */}
                        <rect
                          x={x - 16}
                          y={yTop}
                          width={32}
                          height={plotH}
                          rx="6"
                          fill="rgba(30, 58, 138, 0.05)"
                        />
                        <line
                          x1={x}
                          y1={yTop}
                          x2={x}
                          y2={yBaseline}
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />

                        {/* Floating Tooltip Box */}
                        <g transform={`translate(${tipX}, ${tipY})`}>
                          <rect
                            width={tipW}
                            height={tipH}
                            rx="10"
                            fill="#0f172a"
                            opacity="0.96"
                            filter="drop-shadow(0 4px 14px rgba(0, 0, 0, 0.25))"
                          />
                          <text x="12" y="20" fill="#94a3b8" fontSize="11" fontWeight="700">
                            เดือน {m.month}
                          </text>
                          <circle cx="16" cy="36" r="4" fill="#3b82f6" />
                          <text x="26" y="40" fill="#ffffff" fontSize="11.5" fontWeight="600">
                            ผู้สมัคร: {m.candidates} คน
                          </text>
                          <circle cx="16" cy="52" r="4" fill="#fbbf24" />
                          <text x="26" y="56" fill="#ffffff" fontSize="11.5" fontWeight="600">
                            บริษัท: {m.companies} บริษัท
                          </text>
                        </g>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Legend and Insights Footer */}
              <div className={styles.chartLegendBar}>
                <div className={styles.legendItems}>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.legendDotCand}`} />
                    ผู้สมัคร ({stats.totalCandidates} คน)
                  </span>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.legendDotComp}`} />
                    บริษัท ({stats.totalCompanies} บริษัท)
                  </span>
                </div>
                <span className={styles.insightBadge}>
                  💡 <span>{timeRange === "6m" ? "แสดงสถิติ 6 เดือนล่าสุด" : "แสดงสถิติรอบ 12 เดือน"}</span>
                </span>
              </div>
            </div>
          );
        })()}

        {/* ── Circular Gauges for Matching Score & Resume Score ── */}
        <div className={styles.panelCard}>
          <div className={styles.cardHead}>
            <h3>คะแนนเฉลี่ยแพลตฟอร์ม</h3>
            <p>Matching Score และ Resume Score จากฐานข้อมูลจริง</p>
          </div>
          <div className={styles.gaugesContainer}>
            {/* Matching Score */}
            <div className={styles.gaugeItem}>
              <div className={styles.gaugeCircle}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#f5b700"
                    strokeWidth="10"
                    strokeDasharray="301.6"
                    strokeDashoffset={301.6 * (1 - (scores.matchingScore || 0) / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className={styles.gaugeText}>
                  <div className={styles.gaugeScore}>{scores.matchingScore}</div>
                  <div className={styles.gaugeMax}>/ 100</div>
                </div>
              </div>
              <div className={styles.gaugeLabel}>Matching Score</div>
            </div>

            {/* Resume Score */}
            <div className={styles.gaugeItem}>
              <div className={styles.gaugeCircle}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#0f2242"
                    strokeWidth="10"
                    strokeDasharray="301.6"
                    strokeDashoffset={301.6 * (1 - (scores.resumeScore || 0) / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className={styles.gaugeText}>
                  <div className={styles.gaugeScore}>{scores.resumeScore}</div>
                  <div className={styles.gaugeMax}>/ 100</div>
                </div>
              </div>
              <div className={styles.gaugeLabel}>Resume Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top 5 Skills & Top 10 Positions (ดึงจริงจากฐานข้อมูล) ── */}
      <div className={styles.bottomGrid}>
        {/* Top 5 Skills */}
        <div className={styles.panelCard}>
          <div className={styles.cardHead}>
            <h3>Top 5 Skills ที่ได้รับความนิยม</h3>
            <p>ทักษะที่มีในระบบมากที่สุด</p>
          </div>
          <div className={styles.skillsList}>
            {topSkills.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: "14px", padding: "24px 0", textAlign: "center" }}>
                ยังไม่มีข้อมูลทักษะในระบบ
              </div>
            ) : (
              topSkills.map((skill, idx) => {
                const percent = Math.min(100, Math.round((skill.count / maxSkillCount) * 100));
                return (
                  <div key={idx} className={styles.skillItem}>
                    <div className={styles.skillRowHeader}>
                      <span>{idx + 1}. {skill.name}</span>
                      <span className={styles.skillCount}>{skill.count} คน</span>
                    </div>
                    <div className={styles.skillProgressBg}>
                      <div
                        className={`${styles.skillProgressBar} ${idx === 0 ? styles.barGold : styles.barNavy}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top 10 Positions */}
        <div className={styles.panelCard}>
          <div className={styles.cardHead}>
            <h3>Top ตำแหน่งงานยอดนิยม</h3>
            <p>ตำแหน่งที่มีการเปิดรับและผู้สมัครสนใจ</p>
          </div>
          <div className={styles.rankList}>
            {topPositions.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: "14px", padding: "24px 0", textAlign: "center" }}>
                ยังไม่มีข้อมูลตำแหน่งงานในระบบ
              </div>
            ) : (
              topPositions.map((pos, idx) => (
                <div key={idx} className={styles.rankItem}>
                  <div className={styles.rankLeft}>
                    <span className={`${styles.rankBadge} ${idx < 3 ? styles.rankBadgeGold : styles.rankBadgeGray}`}>
                      {idx + 1}
                    </span>
                    <span className={styles.rankName}>{pos.title}</span>
                  </div>
                  <span className={styles.rankCount}>{pos.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
