"use client";

import { useCallback, useEffect, useState } from "react";
import { readError, useAdminAuth } from "@/lib/admin/auth";
import type { AdminJob, ExperienceLevel, JobFilterOptions, Paginated } from "@/lib/types";
import { SearchIcon, TrashIcon } from "../icons";
import { ConfirmDialog, Modal } from "../ui/Modal";
import { TableFooter, type PageSize } from "../ui/TableFooter";
import ui from "../ui/ui.module.css";
import styles from "./Jobs.module.css";

const SALARY_MAX = 100_000;
const SALARY_STEP = 5_000;

const formatBaht = (value: number) => `${value.toLocaleString("th-TH")} บาท`;
const experienceLabel = (years: number) => (years === 0 ? "0 ปี" : `${years} ปีขึ้นไป`);

/** รอให้ผู้ใช้หยุดพิมพ์/ลากก่อนค่อยยิง API */
function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Feature 5 จัดการการประกาศงาน */
export function JobsView() {
  const { adminFetch } = useAdminAuth();

  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel | "">("");
  const [title, setTitle] = useState("");
  const [salaryMin, setSalaryMin] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);

  const [options, setOptions] = useState<JobFilterOptions | null>(null);
  const [data, setData] = useState<Paginated<AdminJob> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [menuJobId, setMenuJobId] = useState<string | null>(null);
  const [detailJob, setDetailJob] = useState<AdminJob | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminJob | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const debouncedSearch = useDebounced(search);
  const debouncedSalary = useDebounced(salaryMin);

  useEffect(() => {
    void adminFetch("/admin/jobs/filters").then(async (response) => {
      if (response.ok) setOptions((await response.json()) as JobFilterOptions);
    });
  }, [adminFetch]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (experience) params.set("experience", experience);
    if (title) params.set("title", title);
    if (debouncedSalary > 0) params.set("salaryMin", String(debouncedSalary));

    try {
      const response = await adminFetch(`/admin/jobs?${params}`);
      if (!response.ok) throw await readError(response, "โหลดประกาศงานไม่สำเร็จ");
      setData((await response.json()) as Paginated<AdminJob>);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "โหลดประกาศงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [adminFetch, page, pageSize, debouncedSearch, experience, title, debouncedSalary]);

  useEffect(() => {
    void load();
  }, [load]);

  // ปิดเมนูเมื่อคลิกข้างนอก
  useEffect(() => {
    const handleOutside = () => setMenuJobId(null);
    window.addEventListener("click", handleOutside);
    return () => window.removeEventListener("click", handleOutside);
  }, []);

  // เปลี่ยนตัวกรองแล้วกลับไปหน้าแรกเสมอ
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, experience, title, debouncedSalary, pageSize]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await adminFetch(`/admin/jobs/${pendingDelete.id}`, { method: "DELETE" });
      if (!response.ok) throw await readError(response, "ลบประกาศงานไม่สำเร็จ");
      setPendingDelete(null);
      await load();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "ลบประกาศงานไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className={ui.pageHead}>
        <div>
          <h1>ดูประกาศงานทั้งหมด</h1>
          <p>ดูข้อมูลประกาศงานทั้งหมดในระบบ และลบประกาศที่ไม่เหมาะสม</p>
        </div>
      </div>

      <section className={ui.card}>
        <div className={ui.toolbar}>
          <label className={ui.search}>
            <SearchIcon size={18} />
            <input
              value={search}
              placeholder="ค้นหาชื่อบริษัทหรือตำแหน่ง..."
              aria-label="ค้นหาชื่อบริษัทหรือตำแหน่ง"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            className={ui.select}
            value={experience}
            aria-label="อายุงานที่ต้องการ"
            onChange={(event) => setExperience(event.target.value as ExperienceLevel | "")}
          >
            <option value="">อายุงานที่ต้องการ</option>
            {options?.experiences.map((option) => (
              <option key={option.value} value={option.value}>
                {experienceLabel(option.minYears)}
              </option>
            ))}
          </select>
          <select
            className={ui.select}
            value={title}
            aria-label="ตำแหน่งที่ต้องการ"
            onChange={(event) => setTitle(event.target.value)}
          >
            <option value="">ตำแหน่งที่ต้องการ</option>
            {options?.titles.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.salaryRow}>
          <label htmlFor="salary-min">
            เงินเดือนขั้นต่ำ: {salaryMin.toLocaleString("th-TH")} - {SALARY_MAX.toLocaleString("th-TH")} บาท
          </label>
          <input
            id="salary-min"
            className={styles.slider}
            type="range"
            min={0}
            max={SALARY_MAX}
            step={SALARY_STEP}
            value={salaryMin}
            style={{ ["--fill" as string]: `${(salaryMin / SALARY_MAX) * 100}%` }}
            onChange={(event) => setSalaryMin(Number(event.target.value))}
          />
        </div>

        {loadError ? (
          <div className={ui.empty} role="alert">
            {loadError}
          </div>
        ) : (
          <div className={ui.tableScroll}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>ชื่อบริษัท</th>
                  <th>ตำแหน่ง</th>
                  <th>อายุงาน</th>
                  <th>เงินเดือน</th>
                  <th>รูปแบบ</th>
                  <th>สถานะ</th>
                  <th style={{ textAlign: "right" }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className={ui.empty}>
                      {loading ? "กำลังโหลด..." : "ไม่พบประกาศงานที่ตรงกับเงื่อนไข"}
                    </td>
                  </tr>
                )}
                {data?.items.map((job) => (
                  <tr key={job.id} style={{ opacity: loading ? 0.6 : 1 }}>
                    <td className={ui.strong}>{job.companyName}</td>
                    <td>
                      {job.title}
                      {job.isUrgent && (
                        <span className={`${ui.badge} ${ui.badgeRed}`} style={{ marginLeft: 8 }}>
                          ด่วน
                        </span>
                      )}
                    </td>
                    <td>{experienceLabel(job.experienceMinYears)}</td>
                    <td className={ui.strong}>{formatBaht(job.salaryMin)}</td>
                    <td>
                      <span className={`${ui.badge} ${ui.badgeOutline}`}>{job.workStyle}</span>
                    </td>
                    <td>
                      <span className={`${ui.badge} ${job.isActive ? ui.badgeGreen : ui.badgeGray}`}>
                        {job.isActive ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {/* จุดสามจุด (3-dots) Dropdown Menu */}
                      <div
                        className={styles.actionMenuWrapper}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className={styles.dotsButton}
                          aria-label="เมนูจัดการ"
                          title="เมนูจัดการ"
                          onClick={() => setMenuJobId(menuJobId === job.id ? null : job.id)}
                        >
                          ⋮
                        </button>
                        {menuJobId === job.id && (
                          <div className={styles.dropdownMenu} role="menu">
                            <button
                              type="button"
                              className={styles.dropdownItem}
                              onClick={() => {
                                setMenuJobId(null);
                                setDetailJob(job);
                              }}
                            >
                              <span>👁️</span> ดูรายละเอียด
                            </button>
                            <button
                              type="button"
                              className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                              onClick={() => {
                                setMenuJobId(null);
                                setDeleteError("");
                                setPendingDelete(job);
                              }}
                            >
                              <span>🗑️</span> ลบประกาศ
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && (
          <TableFooter
            page={data.page}
            pageSize={pageSize}
            total={data.total}
            totalPages={data.totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </section>

      {/* Modal ดูรายละเอียดประกาศงาน */}
      {detailJob && (
        <Modal
          title={`รายละเอียดงาน: ${detailJob.title}`}
          subtitle={`บริษัท ${detailJob.companyName}`}
          wide
          onClose={() => setDetailJob(null)}
          footer={
            <button
              type="button"
              className={`${ui.button} ${ui.buttonPrimary}`}
              onClick={() => setDetailJob(null)}
            >
              ปิด
            </button>
          }
        >
          <div className={styles.detailGrid}>
            <div className={styles.detailField}>
              <small>ตำแหน่ง</small>
              <strong>{detailJob.title}</strong>
            </div>
            <div className={styles.detailField}>
              <small>ชื่อบริษัท</small>
              <strong>{detailJob.companyName}</strong>
            </div>
            <div className={styles.detailField}>
              <small>เงินเดือนขั้นต่ำ</small>
              <strong>{formatBaht(detailJob.salaryMin)}</strong>
            </div>
            <div className={styles.detailField}>
              <small>ประสบการณ์ขั้นต่ำ</small>
              <strong>{experienceLabel(detailJob.experienceMinYears)}</strong>
            </div>
            <div className={styles.detailField}>
              <small>รูปแบบการทำงาน</small>
              <strong>{detailJob.workStyle}</strong>
            </div>
            <div className={styles.detailField}>
              <small>สถานะประกาศ</small>
              <strong>{detailJob.isActive ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}</strong>
            </div>
          </div>
          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, color: "var(--navy-950)" }}>
              รายละเอียดของตำแหน่งงาน
            </h4>
            <div className={styles.detailDesc}>
              {detailJob.description || "ไม่มีรายละเอียดเพิ่มเติม"}
            </div>
          </div>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="ยืนยันการลบประกาศงาน"
          message={
            <>
              คุณแน่ใจหรือไม่ว่าต้องการลบประกาศ “{pendingDelete.title}” ของ {pendingDelete.companyName}?
              ประกาศจะหายจากหน้าเว็บทันที ส่วนประวัติการสมัครของผู้สมัครยังถูกเก็บไว้
            </>
          }
          confirmLabel="ยืนยันการลบ"
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
