"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readError, useAdminAuth } from "@/lib/admin/auth";
import type { AdminUser, CandidateSource, Paginated, UserStats } from "@/lib/admin/types";
import { BuildingIcon, DotsIcon, DownloadIcon, GradCapIcon, SearchIcon, UsersIcon } from "../icons";
import { ConfirmDialog } from "../ui/Modal";
import { TableFooter, type PageSize } from "../ui/TableFooter";
import ui from "../ui/ui.module.css";
import { CertificatesModal, EditUserModal, ResumeModal } from "./UserModals";
import styles from "./Users.module.css";

type Sort = "newest" | "experience_desc" | "experience_asc";
type Dialog = { kind: "resume" | "certificates" | "edit" | "delete"; user: AdminUser } | null;

const SORT_LABEL: Record<Sort, string> = {
  newest: "เรียงตาม: ล่าสุด",
  experience_desc: "อายุงาน: มาก → น้อย",
  experience_asc: "อายุงาน: น้อย → มาก",
};

/** เขียว 80+, เหลือง 60-79, แดงต่ำกว่า 60 ตามดีไซน์ */
const scoreColor = (score: number) => (score >= 80 ? "var(--green)" : score >= 60 ? "var(--gold)" : "var(--red)");

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Feature 3 จัดการผู้ใช้ */
export function UsersView() {
  const { adminFetch } = useAdminAuth();

  const [search, setSearch] = useState("");
  const [source, setSource] = useState<CandidateSource | "">("");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [data, setData] = useState<Paginated<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [exporting, setExporting] = useState(false);

  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounced(search);

  const queryString = useCallback(
    (withPaging: boolean) => {
      const params = new URLSearchParams({ sort });
      if (withPaging) {
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
      }
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (source) params.set("source", source);
      return params.toString();
    },
    [sort, page, pageSize, debouncedSearch, source],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [listResponse, statsResponse] = await Promise.all([
        adminFetch(`/admin/users?${queryString(true)}`),
        adminFetch("/admin/users/stats"),
      ]);
      if (!listResponse.ok) throw await readError(listResponse, "โหลดรายชื่อผู้สมัครไม่สำเร็จ");
      setData((await listResponse.json()) as Paginated<AdminUser>);
      if (statsResponse.ok) setStats((await statsResponse.json()) as UserStats);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "โหลดรายชื่อผู้สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [adminFetch, queryString]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, source, sort, pageSize]);

  // ปิดเมนู ⋮ เมื่อคลิกนอกเมนู
  useEffect(() => {
    if (!menuFor) return;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuFor(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuFor]);

  /** ปุ่มดาวน์โหลดต้องแนบ token จึงโหลดเป็น blob แล้วค่อยสั่งบันทึกไฟล์ */
  const exportCsv = async () => {
    setExporting(true);
    try {
      const response = await adminFetch(`/admin/users/export.csv?${queryString(false)}`);
      if (!response.ok) throw await readError(response, "Export ไม่สำเร็จ");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `cyberjob-candidates-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Export ไม่สำเร็จ");
    } finally {
      setExporting(false);
    }
  };

  const confirmDelete = async () => {
    if (dialog?.kind !== "delete") return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await adminFetch(`/admin/users/${dialog.user.id}`, { method: "DELETE" });
      if (!response.ok) throw await readError(response, "ลบผู้สมัครไม่สำเร็จ");
      setDialog(null);
      await load();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "ลบผู้สมัครไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  };

  const open = (kind: NonNullable<Dialog>["kind"], user: AdminUser) => {
    setMenuFor(null);
    setDeleteError("");
    setDialog({ kind, user });
  };

  const statCards = [
    { label: "ผู้สมัครทั้งหมด", value: stats ? String(stats.total) : "–", icon: <UsersIcon size={24} />, color: "var(--navy-900)" },
    {
      label: "เด็กฝึก Cyberpay",
      value: stats ? `${stats.cyberpayIntern.count} (${stats.cyberpayIntern.percent}%)` : "–",
      icon: <GradCapIcon size={24} />,
      color: "var(--gold)",
    },
    {
      label: "เด็กฝึกภายนอก",
      value: stats ? `${stats.outsider.count} (${stats.outsider.percent}%)` : "–",
      icon: <BuildingIcon size={24} />,
      color: "var(--blue)",
    },
  ];

  return (
    <>
      <div className={ui.pageHead}>
        <div>
          <h1>จัดการผู้ใช้</h1>
          <p>จัดการข้อมูลผู้สมัครทั้งเด็กฝึก Cyberpay และคนภายนอก</p>
        </div>
        <button type="button" className={ui.button} onClick={exportCsv} disabled={exporting}>
          <DownloadIcon size={18} />
          {exporting ? "กำลัง Export..." : "Export CSV"}
        </button>
      </div>

      <div className={styles.stats}>
        {statCards.map((card) => (
          <article key={card.label} className={`${ui.card} ${styles.stat}`}>
            <span className={styles.statIcon} style={{ background: card.color }} aria-hidden>
              {card.icon}
            </span>
            <span>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statValue}>{card.value}</span>
            </span>
          </article>
        ))}
      </div>

      <section className={ui.card}>
        <div className={ui.toolbar}>
          <label className={ui.search}>
            <SearchIcon size={18} />
            <input
              value={search}
              placeholder="ค้นหาด้วย UserID, ชื่อ, หรือ Email..."
              aria-label="ค้นหาผู้สมัคร"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            className={ui.select}
            value={source}
            aria-label="ประเภทผู้สมัคร"
            onChange={(event) => setSource(event.target.value as CandidateSource | "")}
          >
            <option value="">ทั้งหมด</option>
            <option value="CYBERPAY_INTERN">เด็กฝึก Cyberpay</option>
            <option value="OUTSIDER">คนภายนอก</option>
          </select>
          <select
            className={ui.select}
            value={sort}
            aria-label="เรียงลำดับ"
            onChange={(event) => setSort(event.target.value as Sort)}
          >
            {(Object.keys(SORT_LABEL) as Sort[]).map((value) => (
              <option key={value} value={value}>
                {SORT_LABEL[value]}
              </option>
            ))}
          </select>
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
                  <th>UserID</th>
                  <th>ชื่อผู้สมัคร</th>
                  <th>อายุงาน</th>
                  <th>ตำแหน่งที่สนใจ</th>
                  <th>ประเภท</th>
                  <th>คะแนน Resume</th>
                  <th style={{ textAlign: "right" }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className={ui.empty}>
                      {loading ? "กำลังโหลด..." : "ไม่พบผู้สมัครที่ตรงกับเงื่อนไข"}
                    </td>
                  </tr>
                )}
                {data?.items.map((user) => (
                  <tr key={user.id} style={{ opacity: loading ? 0.6 : 1 }}>
                    <td>{user.code}</td>
                    <td className={ui.strong}>{user.name}</td>
                    <td>{user.experienceYears} ปี</td>
                    <td>{user.desiredPosition ?? "-"}</td>
                    <td>
                      <span className={`${ui.badge} ${user.source === "CYBERPAY_INTERN" ? ui.badgeGold : ui.badgeGray}`}>
                        {user.source === "CYBERPAY_INTERN" ? "Cyberpay" : "ภายนอก"}
                      </span>
                    </td>
                    <td>
                      {user.resumeScore === null ? (
                        <span className={styles.pending}>ยังไม่ประเมิน</span>
                      ) : (
                        <span className={styles.score}>
                          <span className={styles.scoreTrack} aria-hidden>
                            <span
                              className={styles.scoreFill}
                              style={{ display: "block", width: `${user.resumeScore}%`, background: scoreColor(user.resumeScore) }}
                            />
                          </span>
                          <span className={styles.scoreValue}>{user.resumeScore}</span>
                        </span>
                      )}
                    </td>
                    <td className={styles.menuCell}>
                      <button
                        type="button"
                        className={styles.menuButton}
                        aria-haspopup="menu"
                        aria-expanded={menuFor === user.id}
                        aria-label={`จัดการ ${user.name}`}
                        onClick={() => setMenuFor(menuFor === user.id ? null : user.id)}
                      >
                        <DotsIcon size={18} />
                      </button>
                      {menuFor === user.id && (
                        <div ref={menuRef} className={styles.menu} role="menu">
                          <button type="button" role="menuitem" onClick={() => open("resume", user)}>
                            ดู Resume
                          </button>
                          <button type="button" role="menuitem" onClick={() => open("certificates", user)}>
                            ดูใบประกาศนียบัตร ({user.certificateCount})
                          </button>
                          <button type="button" role="menuitem" onClick={() => open("edit", user)}>
                            แก้ไขข้อมูลผู้สมัคร
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className={styles.menuDanger}
                            onClick={() => open("delete", user)}
                          >
                            ลบผู้สมัคร
                          </button>
                        </div>
                      )}
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

      {dialog?.kind === "resume" && <ResumeModal user={dialog.user} onClose={() => setDialog(null)} />}
      {dialog?.kind === "certificates" && <CertificatesModal user={dialog.user} onClose={() => setDialog(null)} />}
      {dialog?.kind === "edit" && (
        <EditUserModal
          user={dialog.user}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            void load();
          }}
        />
      )}
      {dialog?.kind === "delete" && (
        <ConfirmDialog
          title="ยืนยันการลบผู้สมัคร"
          message={
            <>
              คุณแน่ใจหรือไม่ว่าต้องการลบ “{dialog.user.name}” ({dialog.user.code})? การกระทำนี้ไม่สามารถยกเลิกได้
            </>
          }
          confirmLabel="ยืนยันการลบ"
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setDialog(null)}
        />
      )}
    </>
  );
}
