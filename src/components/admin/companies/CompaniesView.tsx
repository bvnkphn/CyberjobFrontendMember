"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin/auth";
import { BuildingIcon, SearchIcon } from "../icons";
import { TableFooter, type PageSize } from "../ui/TableFooter";
import ui from "../ui/ui.module.css";
import styles from "./Companies.module.css";

export interface CompanyItem {
  id: string;
  name: string;
  legalName?: string;
  province?: string;
  district?: string;
  verificationStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  verified: boolean;
  createdAt: string;
  owner?: {
    name: string;
    email: string;
  };
}

export function CompaniesView() {
  const { adminFetch } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"pending" | "details">("pending");
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === "pending" ? "PENDING" : "ALL";
      const params = new URLSearchParams({
        status: statusParam,
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await adminFetch(`/admin/companies?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.items || []);
        setCounts(json.counts || { pending: 0, approved: 0, rejected: 0, total: 0 });
        setTotalCount(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [adminFetch, activeTab, page, pageSize, search]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={ui.pageHead}>
        <div>
          <h1>จัดการบริษัท</h1>
          <p>จัดการข้อมูลบริษัท ตรวจสอบเอกสารนิติบุคคล และสถานะการยืนยันตัวตน</p>
        </div>
      </div>

      {/* ── Tabs Bar ── */}
      <div className={ui.tabList}>
        <button
          type="button"
          className={`${ui.tabBtn} ${activeTab === "pending" ? ui.tabBtnActive : ""}`}
          onClick={() => {
            setActiveTab("pending");
            setPage(1);
          }}
        >
          <span>⏳</span> บริษัทรอยืนยัน ({counts.pending})
        </button>
        <button
          type="button"
          className={`${ui.tabBtn} ${activeTab === "details" ? ui.tabBtnActive : ""}`}
          onClick={() => {
            setActiveTab("details");
            setPage(1);
          }}
        >
          <span>🏢</span> บริษัททั้งหมด ({counts.total})
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className={ui.statsGrid}>
        <div className={ui.statCard}>
          <span className={ui.statIcon} style={{ background: "var(--gold)" }}>
            ⏳
          </span>
          <span>
            <span className={ui.statLabel}>รอดำเนินการยืนยัน</span>
            <span className={ui.statValue}>{counts.pending}</span>
          </span>
        </div>

        <div className={ui.statCard}>
          <span className={ui.statIcon} style={{ background: "var(--green)" }}>
            ✓
          </span>
          <span>
            <span className={ui.statLabel}>ยืนยันตัวตนแล้ว</span>
            <span className={ui.statValue}>{counts.approved}</span>
          </span>
        </div>

        <div className={ui.statCard}>
          <span className={ui.statIcon} style={{ background: "var(--navy-900)" }}>
            🏢
          </span>
          <span>
            <span className={ui.statLabel}>บริษัททั้งหมดในระบบ</span>
            <span className={ui.statValue}>{counts.total}</span>
          </span>
        </div>
      </div>

      {/* ── Data Table Card ── */}
      <section className={ui.card}>
        <div className={ui.toolbar}>
          <label className={ui.search}>
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อบริษัท, นิติบุคคล, หรือที่ตั้ง..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>

        <div className={ui.tableScroll}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>ชื่อบริษัท</th>
                <th>ที่ตั้ง</th>
                <th>วันที่ลงทะเบียน</th>
                <th>สถานะการยืนยัน</th>
                <th style={{ textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading && companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className={ui.empty}>
                    กำลังโหลดข้อมูลจากฐานข้อมูล...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className={ui.empty}>
                    ไม่พบรายการบริษัทในหมวดนี้
                  </td>
                </tr>
              ) : (
                companies.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <span className={ui.strong}>{item.name}</span>
                        {item.legalName && (
                          <div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "2px" }}>
                            {item.legalName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{item.province ? `${item.province}${item.district ? ` (${item.district})` : ""}` : "ไม่ระบุ"}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString("th-TH")}</td>
                    <td>
                      {item.verificationStatus === "PENDING" && (
                        <span className={`${ui.badge} ${ui.badgeGold}`}>รอดำเนินการ</span>
                      )}
                      {item.verificationStatus === "APPROVED" && (
                        <span className={`${ui.badge} ${ui.badgeGreen}`}>ยืนยันแล้ว</span>
                      )}
                      {item.verificationStatus === "REJECTED" && (
                        <span className={`${ui.badge} ${ui.badgeRed}`}>ปฏิเสธ</span>
                      )}
                      {item.verificationStatus === "NOT_SUBMITTED" && (
                        <span className={`${ui.badge} ${ui.badgeGray}`}>ยังไม่ยื่นเอกสาร</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/admin/companies/${item.id}`} className={styles.actionLink}>
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TableFooter
          page={page}
          pageSize={pageSize}
          total={totalCount || counts.total}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </div>
  );
}
