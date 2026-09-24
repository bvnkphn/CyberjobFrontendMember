"use client";

import Link from "next/link";
import styles from "./Dashboard.module.css";

export function DashboardView() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>ภาพรวมระบบและสถิติแพลตฟอร์ม Cyber Job</p>
      </header>

      {/* ── รายการที่ต้องดำเนินการ (Action Required) ── */}
      <section className={styles.actionSection} aria-label="รายการที่ต้องดำเนินการ">
        <h2 className={styles.sectionTitle}>รายการที่ต้องดำเนินการ (Action Required)</h2>
        <div className={styles.actionGrid}>
          <Link href="/companies" className={styles.actionCard}>
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
                  <span className={`${styles.actionCount} ${styles.actionCountAlert}`}>12</span>
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
                  <span className={styles.actionCount}>0</span>
                  <span className={styles.actionUnit}>ไม่มีรายการค้าง</span>
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

      {/* ── 6 Stat Cards ── */}
      <section className={styles.statsGrid} aria-label="สถิติหลัก">
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#e8effc", color: "#1d4ed8" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg>
            </div>
            <span className={styles.statTitle}>ผู้สมัครทั้งหมด</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>12</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>↗ +12.5%</span>
              <span className={styles.statCompare}>เทียบเดือนก่อน</span>
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
            <span className={styles.statNumber}>14</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>↗ +8.2%</span>
              <span className={styles.statCompare}>เทียบเดือนก่อน</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#f0f4f9", color: "#0f2242" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <span className={styles.statTitle}>Resume</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>8</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>↗ +15.3%</span>
              <span className={styles.statCompare}>เทียบเดือนก่อน</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#fef3c7", color: "#d97706" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </div>
            <span className={styles.statTitle}>Certificate</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>8</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>↗ +5.7%</span>
              <span className={styles.statCompare}>เทียบเดือนก่อน</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIconBox} style={{ background: "#f0f4f9", color: "#1e3a8a" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <span className={styles.statTitle}>ประกาศงาน</span>
          </div>
          <div className={styles.statBottom}>
            <span className={styles.statNumber}>10</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendUp}`}>↗ +3.1%</span>
              <span className={styles.statCompare}>เทียบเดือนก่อน</span>
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
            <span className={styles.statNumber}>1280</span>
            <div>
              <span className={`${styles.statTrend} ${styles.trendDown}`}>↘ -2.4%</span>
              <span className={styles.statCompare}>เทียบเดือนก่อน</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Monthly Chart & Average Score Gauges ── */}
      <div className={styles.twoColGrid}>
        <div className={styles.panelCard}>
          <div className={styles.cardHead}>
            <h3>ผู้สมัครและบริษัทใหม่รายเดือน</h3>
            <p>จำนวนผู้สมัครและบริษัทที่สมัครใหม่ในรอบ 12 เดือน</p>
          </div>
          {/* Custom Responsive SVG Line Chart matching design */}
          <div style={{ width: "100%", height: "240px" }}>
            <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              <line x1="30" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1="65" x2="580" y2="65" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1="110" x2="580" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1="155" x2="580" y2="155" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1="200" x2="580" y2="200" stroke="#e2e8f0" />

              {/* Y Axis Labels */}
              <text x="15" y="24" fontSize="10" fill="#94a3b8">36</text>
              <text x="15" y="69" fontSize="10" fill="#94a3b8">27</text>
              <text x="15" y="114" fontSize="10" fill="#94a3b8">18</text>
              <text x="18" y="159" fontSize="10" fill="#94a3b8">9</text>
              <text x="18" y="204" fontSize="10" fill="#94a3b8">0</text>

              {/* Candidates Curve (Navy line) */}
              <path
                d="M 40 135 C 75 125, 110 110, 140 105 C 170 100, 200 115, 230 100 C 260 85, 290 70, 325 55 C 360 65, 395 55, 430 45 C 465 35, 500 28, 570 15"
                fill="none"
                stroke="#0f2242"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Companies Curve (Gold line) */}
              <path
                d="M 40 190 C 75 188, 110 186, 140 187 C 170 189, 200 185, 230 182 C 260 180, 290 178, 325 181 C 360 179, 395 178, 430 176 C 465 175, 500 174, 570 172"
                fill="none"
                stroke="#f5b700"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* X Axis Month Labels */}
              {[
                ["ม.ค.", 40], ["ก.พ.", 88], ["มี.ค.", 136], ["เม.ย.", 184],
                ["พ.ค.", 232], ["มิ.ย.", 280], ["ก.ค.", 328], ["ส.ค.", 376],
                ["ก.ย.", 424], ["ต.ค.", 472], ["พ.ย.", 520], ["ธ.ค.", 568],
              ].map(([m, x]) => (
                <text key={String(m)} x={Number(x)} y="222" fontSize="10" fill="#94a3b8" textAnchor="middle">{String(m)}</text>
              ))}
            </svg>
          </div>
          <div style={{ display: "flex", gap: "20px", marginTop: "12px", justifyContent: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
              <span style={{ width: "12px", height: "3px", background: "#0f2242", borderRadius: "2px" }}></span> ผู้สมัคร
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
              <span style={{ width: "12px", height: "3px", background: "#f5b700", borderRadius: "2px" }}></span> บริษัท
            </span>
          </div>
        </div>

        {/* ── Circular Gauges for Matching Score & Resume Score ── */}
        <div className={styles.panelCard}>
          <div className={styles.cardHead}>
            <h3>คะแนนเฉลี่ย</h3>
            <p>Matching Score และ Resume Score</p>
          </div>
          <div className={styles.gaugesContainer}>
            {/* Matching Score 78/100 */}
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
                    strokeDashoffset={301.6 * (1 - 0.78)}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className={styles.gaugeText}>
                  <div className={styles.gaugeScore}>78</div>
                  <div className={styles.gaugeMax}>/ 100</div>
                </div>
              </div>
              <div className={styles.gaugeLabel}>Matching Score</div>
            </div>

            {/* Resume Score 82/100 */}
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
                    strokeDashoffset={301.6 * (1 - 0.82)}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className={styles.gaugeText}>
                  <div className={styles.gaugeScore}>82</div>
                  <div className={styles.gaugeMax}>/ 100</div>
                </div>
              </div>
              <div className={styles.gaugeLabel}>Resume Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top 5 Skills & Top 10 Positions ── */}
      <div className={styles.bottomGrid}>
        {/* Top 5 Skills */}
        <div className={styles.panelCard}>
          <div className={styles.cardHead}>
            <h3>Top 5 Skills ที่ได้รับความนิยม</h3>
            <p>ทักษะที่ผู้สมัครมีมากที่สุด</p>
          </div>
          <div className={styles.skillsList}>
            <div className={styles.skillItem}>
              <div className={styles.skillRowHeader}>
                <span>1. Python</span>
                <span className={styles.skillCount}>320 คน</span>
              </div>
              <div className={styles.skillProgressBg}>
                <div className={`${styles.skillProgressBar} ${styles.barGold}`} style={{ width: "100%" }} />
              </div>
            </div>

            <div className={styles.skillItem}>
              <div className={styles.skillRowHeader}>
                <span>2. JavaScript</span>
                <span className={styles.skillCount}>285 คน</span>
              </div>
              <div className={styles.skillProgressBg}>
                <div className={`${styles.skillProgressBar} ${styles.barNavy}`} style={{ width: "89%" }} />
              </div>
            </div>

            <div className={styles.skillItem}>
              <div className={styles.skillRowHeader}>
                <span>3. SQL Database</span>
                <span className={styles.skillCount}>240 คน</span>
              </div>
              <div className={styles.skillProgressBg}>
                <div className={`${styles.skillProgressBar} ${styles.barNavy}`} style={{ width: "75%" }} />
              </div>
            </div>

            <div className={styles.skillItem}>
              <div className={styles.skillRowHeader}>
                <span>4. Network Security</span>
                <span className={styles.skillCount}>195 คน</span>
              </div>
              <div className={styles.skillProgressBg}>
                <div className={`${styles.skillProgressBar} ${styles.barNavy}`} style={{ width: "61%" }} />
              </div>
            </div>

            <div className={styles.skillItem}>
              <div className={styles.skillRowHeader}>
                <span>5. Penetration Testing</span>
                <span className={styles.skillCount}>160 คน</span>
              </div>
              <div className={styles.skillProgressBg}>
                <div className={`${styles.skillProgressBar} ${styles.barNavy}`} style={{ width: "50%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top 10 Positions */}
        <div className={styles.panelCard}>
          <div className={styles.cardHead}>
            <h3>Top 10 ตำแหน่งงาน</h3>
            <p>ตำแหน่งที่มีผู้สนใจมากที่สุด</p>
          </div>
          <div className={styles.rankList}>
            <div className={styles.rankItem}>
              <div className={styles.rankLeft}>
                <span className={`${styles.rankBadge} ${styles.rankBadgeGold}`}>1</span>
                <span className={styles.rankName}>นักพัฒนาซอฟต์แวร์</span>
              </div>
              <span className={styles.rankCount}>145</span>
            </div>

            <div className={styles.rankItem}>
              <div className={styles.rankLeft}>
                <span className={`${styles.rankBadge} ${styles.rankBadgeGold}`}>2</span>
                <span className={styles.rankName}>วิศวกรระบบเครือข่าย</span>
              </div>
              <span className={styles.rankCount}>98</span>
            </div>

            <div className={styles.rankItem}>
              <div className={styles.rankLeft}>
                <span className={`${styles.rankBadge} ${styles.rankBadgeGold}`}>3</span>
                <span className={styles.rankName}>นักวิเคราะห์ความปลอดภัย</span>
              </div>
              <span className={styles.rankCount}>87</span>
            </div>

            <div className={styles.rankItem}>
              <div className={styles.rankLeft}>
                <span className={`${styles.rankBadge} ${styles.rankBadgeGray}`}>4</span>
                <span className={styles.rankName}>ผู้ดูแลระบบ IT</span>
              </div>
              <span className={styles.rankCount}>76</span>
            </div>

            <div className={styles.rankItem}>
              <div className={styles.rankLeft}>
                <span className={`${styles.rankBadge} ${styles.rankBadgeGray}`}>5</span>
                <span className={styles.rankName}>นักพัฒนา Backend</span>
              </div>
              <span className={styles.rankCount}>65</span>
            </div>

            <div className={styles.rankItem}>
              <div className={styles.rankLeft}>
                <span className={`${styles.rankBadge} ${styles.rankBadgeGray}`}>6</span>
                <span className={styles.rankName}>นักพัฒนา Frontend</span>
              </div>
              <span className={styles.rankCount}>58</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
