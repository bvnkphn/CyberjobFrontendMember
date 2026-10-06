"use client";

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { readError, useAdminAuth } from "@/lib/admin/auth";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  ChevronIcon,
  WarningIcon,
  WrenchIcon,
  DownloadIcon,
} from "../icons";
import styles from "./Synonyms.module.css";
import ui from "../ui/ui.module.css";
import { TableFooter, type PageSize } from "../ui/TableFooter";

export interface SynonymGroup {
  id: string;
  mainKeyword: string;
  category: string;
  synonyms: string[];
  updatedAt: string;
  updatedBy: string;
}

const COMMON_CATEGORIES = [
  "Security",
  "Development",
  "Frontend",
  "DevOps & Cloud",
  "Data",
  "Network",
  "Infrastructure",
  "QA & Testing",
  "Cloud",
  "General",
];

export function SynonymsView() {
  const { adminFetch } = useAdminAuth();

  const [groups, setGroups] = useState<SynonymGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [aiLoading, setAiLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SynonymGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<SynonymGroup | null>(null);
  const [confirmSaveTarget, setConfirmSaveTarget] = useState<"add" | "edit" | null>(null);

  // Form States
  const [formMainKeyword, setFormMainKeyword] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formSynonyms, setFormSynonyms] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Load from backend API
  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/synonyms");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: SynonymGroup[] = data.map((d: any) => ({
            id: d.id,
            mainKeyword: d.name,
            category: d.category || "General",
            synonyms: d.synonyms || [],
            updatedAt: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString("th-TH") : "–",
            updatedBy: d.updatedBy || "Admin",
          }));
          setGroups(mapped);
        }
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  // AI Suggestion Handler
  const handleAiSuggest = async () => {
    if (!formMainKeyword.trim()) return;
    setAiLoading(true);
    try {
      const res = await adminFetch("/admin/synonyms/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: formMainKeyword.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.suggestions && Array.isArray(json.suggestions)) {
          // Merge unique suggestions
          const combined = Array.from(new Set([...formSynonyms, ...json.suggestions]));
          setFormSynonyms(combined);
          notify(`AI แนะนำ ${json.suggestions.length} คำพ้องสำหรับ "${formMainKeyword.trim()}"`);
        }
      }
    } catch {
      //
    } finally {
      setAiLoading(false);
    }
  };

  // Seed default taxonomy from server
  const handleSeedDefaults = async () => {
    if (!confirm("ต้องการโหลดคำศัพท์และทักษะเริ่มต้นสาย IT & Cyber หรือไม่?")) return;
    setLoading(true);
    try {
      const res = await adminFetch("/admin/synonyms/seed-defaults", { method: "POST" });
      if (!res.ok) throw await readError(res, "โหลดคำศัพท์เริ่มต้นไม่สำเร็จ");
      await loadGroups();
      notify("โหลดคำศัพท์และทักษะเริ่มต้นเรียบร้อยแล้ว");
    } catch (e) {
      alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const header = "Main Keyword,Category,Synonyms,วันที่แก้ไขล่าสุด,ผู้แก้ไข\r\n";
    const rows = groups
      .map((g) =>
        `"${g.mainKeyword}","${g.category}","${g.synonyms.join(", ")}","${g.updatedAt}","${g.updatedBy}"`
      )
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synonyms-dictionary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtering
  const filtered = useMemo(() => {
    let result = groups;
    if (categoryFilter !== "all") {
      result = result.filter((g) => g.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    const q = search.trim().toLowerCase();
    if (!q) return result;
    return result.filter((g) => {
      const matchMain = g.mainKeyword.toLowerCase().includes(q);
      const matchCategory = g.category.toLowerCase().includes(q);
      const matchSyn = g.synonyms.some((s) => s.toLowerCase().includes(q));
      return matchMain || matchCategory || matchSyn;
    });
  }, [groups, search, categoryFilter]);

  // Paginated
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Compute total synonyms
  const totalSynonymsCount = useMemo(() => {
    return groups.reduce((acc, g) => acc + g.synonyms.length, 0);
  }, [groups]);

  // Check if a word already exists in other groups
  const checkWordExistsInSystem = (word: string, currentGroupId?: string) => {
    const target = word.trim().toLowerCase();
    for (const g of groups) {
      if (currentGroupId && g.id === currentGroupId) {
        continue;
      }
      if (g.mainKeyword.toLowerCase() === target) {
        return `"${word.trim()}" มีอยู่ในระบบแล้ว (เป็น Main Keyword)`;
      }
      if (g.synonyms.some((s) => s.toLowerCase() === target)) {
        return `"${word.trim()}" มีอยู่ในระบบแล้ว (ในกลุ่ม ${g.mainKeyword})`;
      }
    }
    return null;
  };

  // Add Tag logic
  const handleAddTag = () => {
    const clean = tagInput.trim();
    if (!clean) return;

    // Check duplicate in current form
    if (formSynonyms.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setTagInput("");
      return;
    }

    // Check duplicate in other groups across system
    const errorMsg = checkWordExistsInSystem(clean, editingGroup?.id);
    if (errorMsg) {
      setValidationError(errorMsg);
      setFormSynonyms([...formSynonyms, clean]);
      setTagInput("");
      return;
    }

    setValidationError(null);
    setFormSynonyms([...formSynonyms, clean]);
    setTagInput("");
  };

  const handleKeyDownTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const next = formSynonyms.filter((s) => s !== tagToRemove);
    setFormSynonyms(next);
    let hasErr: string | null = null;
    for (const s of next) {
      const err = checkWordExistsInSystem(s, editingGroup?.id);
      if (err) {
        hasErr = err;
        break;
      }
    }
    setValidationError(hasErr);
  };

  // Open Add Modal
  const openAdd = () => {
    setFormMainKeyword("");
    setFormCategory("General");
    setFormSynonyms([]);
    setTagInput("");
    setValidationError(null);
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const openEdit = (group: SynonymGroup) => {
    setEditingGroup(group);
    setFormMainKeyword(group.mainKeyword);
    setFormCategory(group.category || "General");
    setFormSynonyms([...group.synonyms]);
    setTagInput("");
    setValidationError(null);
  };

  // Trigger Save Add
  const handleSaveAdd = () => {
    const mainClean = formMainKeyword.trim();
    if (!mainClean) {
      setValidationError("กรุณาระบุ Main Keyword");
      return;
    }

    const mainErr = checkWordExistsInSystem(mainClean);
    if (mainErr) {
      setValidationError(mainErr);
      return;
    }

    for (const s of formSynonyms) {
      const synErr = checkWordExistsInSystem(s);
      if (synErr) {
        setValidationError(synErr);
        return;
      }
    }

    if (validationError) return;
    setConfirmSaveTarget("add");
  };

  // Trigger Save Edit
  const handleSaveEdit = () => {
    if (!editingGroup) return;
    const mainClean = formMainKeyword.trim();
    if (!mainClean) {
      setValidationError("กรุณาระบุ Main Keyword");
      return;
    }

    const mainErr = checkWordExistsInSystem(mainClean, editingGroup.id);
    if (mainErr) {
      setValidationError(mainErr);
      return;
    }

    for (const s of formSynonyms) {
      const synErr = checkWordExistsInSystem(s, editingGroup.id);
      if (synErr) {
        setValidationError(synErr);
        return;
      }
    }

    if (validationError) return;
    setConfirmSaveTarget("edit");
  };

  // Execute Save to PostgreSQL DB
  const executeConfirmSave = async () => {
    const mainClean = formMainKeyword.trim();
    if (!mainClean) return;

    setSaving(true);
    try {
      if (confirmSaveTarget === "add") {
        const res = await adminFetch("/admin/synonyms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: mainClean,
            category: formCategory || "General",
            synonyms: formSynonyms,
          }),
        });
        if (!res.ok) throw await readError(res, "เพิ่มกลุ่มคำไม่สำเร็จ");
        notify(`เพิ่มกลุ่มคำ "${mainClean}" ลงฐานข้อมูลเรียบร้อยแล้ว`);
      } else if (confirmSaveTarget === "edit" && editingGroup) {
        const res = await adminFetch("/admin/synonyms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingGroup.id,
            name: mainClean,
            category: formCategory || editingGroup.category || "General",
            synonyms: formSynonyms,
          }),
        });
        if (!res.ok) throw await readError(res, "แก้ไขกลุ่มคำไม่สำเร็จ");
        notify(`บันทึกการแก้ไข "${mainClean}" สำเร็จ`);
      }

      setIsAddOpen(false);
      setEditingGroup(null);
      setConfirmSaveTarget(null);
      await loadGroups();
    } catch (e) {
      alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  // Confirm Delete from PostgreSQL DB
  const handleConfirmDelete = async () => {
    if (!deletingGroup) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/admin/synonyms/${deletingGroup.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw await readError(res, "ลบกลุ่มคำไม่สำเร็จ");
      notify(`ลบกลุ่มคำ "${deletingGroup.mainKeyword}" ออกจากฐานข้อมูลแล้ว`);
      setDeletingGroup(null);
      await loadGroups();
    } catch (e) {
      alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการลบ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={ui.pageHead}>
        <div>
          <h1>Synonym & Keyword Dictionary</h1>
          <p>จัดการกลุ่มคำเหมือน คำค้นหาทางเลือก และทักษะที่เกี่ยวข้องสำหรับระบบค้นหางานและ AI Matching</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={ui.statsGrid}>
        <div className={ui.statCard}>
          <span className={ui.statIcon} style={{ background: "var(--navy-900)" }}>📖</span>
          <span>
            <span className={ui.statLabel}>กลุ่มคำหลัก (Main Keywords)</span>
            <span className={ui.statValue}>{groups.length}</span>
          </span>
        </div>

        <div className={ui.statCard}>
          <span className={ui.statIcon} style={{ background: "var(--blue)" }}>🏷️</span>
          <span>
            <span className={ui.statLabel}>คำพ้องในระบบทั้งหมด</span>
            <span className={ui.statValue}>{totalSynonymsCount}</span>
          </span>
        </div>

        <div className={ui.statCard}>
          <span className={ui.statIcon} style={{ background: "var(--green)" }}>🗂️</span>
          <span>
            <span className={ui.statLabel}>หมวดหมู่สายงาน</span>
            <span className={ui.statValue}>{new Set(groups.map((g) => g.category)).size}</span>
          </span>
        </div>
      </div>

      {/* ── Table Card ── */}
      <section className={ui.card}>
        <div className={ui.toolbar}>
          <label className={ui.search}>
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="ค้นหาด้วย Main Keyword, หมวดหมู่ หรือ Synonyms..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>

          <select
            className={ui.select}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">ทุกหมวดหมู่ (All Categories)</option>
            {COMMON_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={ui.button}
            onClick={handleExportCsv}
            title="ส่งออกรายการคำพ้องเป็น CSV"
          >
            <DownloadIcon size={16} /> Export CSV
          </button>

          <button
            type="button"
            className={ui.button}
            onClick={handleSeedDefaults}
            title="รีเซ็ตหรือเติมคำศัพท์เริ่มต้น"
          >
            🔄 รีเซ็ตค่าเริ่มต้น
          </button>

          <button type="button" className={`${ui.button} ${ui.buttonGold}`} onClick={openAdd}>
            <PlusIcon size={16} /> เพิ่มกลุ่มคำใหม่
          </button>
        </div>

        <div className={ui.tableScroll}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Main Keyword</th>
                <th style={{ width: "16%" }}>หมวดหมู่</th>
                <th>Synonyms</th>
                <th style={{ width: "14%" }}>วันที่แก้ไขล่าสุด</th>
                <th style={{ width: "14%" }}>ผู้แก้ไขล่าสุด</th>
                <th style={{ width: "10%", textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading && groups.length === 0 ? (
                <tr>
                  <td colSpan={6} className={ui.empty}>
                    กำลังโหลดข้อมูลจากฐานข้อมูล...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className={ui.empty}>
                    ไม่พบกลุ่มคำพ้องที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={ui.strong}>{item.mainKeyword}</span>
                    </td>
                    <td>
                      <span className={`${ui.badge} ${ui.badgeGray}`}>{item.category}</span>
                    </td>
                    <td>
                      <div className={styles.tagsRow}>
                        {item.synonyms.map((tag, idx) => (
                          <span key={idx} className={styles.tagPill}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{item.updatedAt}</td>
                    <td>{item.updatedBy}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className={styles.actionBtns} style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="แก้ไขกลุ่มคำ"
                          onClick={() => openEdit(item)}
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          title="ลบกลุ่มคำ"
                          onClick={() => setDeletingGroup(item)}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
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
          total={filtered.length}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      {/* ── MODAL: เพิ่มกลุ่มคำใหม่ ── */}
      {isAddOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddOpen(false);
          }}
        >
          <div className={styles.modalBox}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>เพิ่มกลุ่มคำใหม่</h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsAddOpen(false)}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Main Keyword (คำหลัก)</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="คำหลัก (เช่น React, Cybersecurity, Pentester)"
                  value={formMainKeyword}
                  onChange={(e) => {
                    setFormMainKeyword(e.target.value);
                    setValidationError(null);
                  }}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="button"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={handleAiSuggest}
                    disabled={aiLoading || !formMainKeyword.trim()}
                  >
                    ✨ {aiLoading ? "AI กำลังวิเคราะห์คำพ้อง..." : "ให้ AI แนะนำคำพ้องอัตโนมัติ"}
                  </button>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>หมวดหมู่สายงาน (Category)</label>
                <select
                  className={styles.inputField}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {COMMON_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Synonyms (คำพ้อง/ทักษะที่เกี่ยวข้อง)</label>
                <div className={styles.tagContainer}>
                  {formSynonyms.map((tag, idx) => (
                    <span key={idx} className={styles.modalDarkTag}>
                      {tag}
                      <button
                        type="button"
                        className={styles.tagDeleteIcon}
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className={styles.tagInput}
                    placeholder={formSynonyms.length === 0 ? "พิมพ์แล้วกด Enter เพื่อเพิ่ม..." : "เพิ่มคำ..."}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDownTag}
                    onBlur={handleAddTag}
                  />
                </div>
                <div className={styles.helperText}>พิมพ์แล้วกด Enter หรือเครื่องหมายจุลภาค (,) เพื่อเพิ่มเป็น Tag</div>

                {validationError && (
                  <div className={styles.errorAlert}>
                    <span>🚫</span>
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              <div className={styles.modalFoot}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsAddOpen(false)}
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={styles.btnGold}
                  onClick={handleSaveAdd}
                  disabled={saving}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: แก้ไขกลุ่มคำ ── */}
      {editingGroup && (
        <div
          className={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingGroup(null);
          }}
        >
          <div className={styles.modalBox}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>แก้ไขกลุ่มคำ</h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setEditingGroup(null)}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Main Keyword (คำหลัก)</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={formMainKeyword}
                  onChange={(e) => {
                    setFormMainKeyword(e.target.value);
                    setValidationError(null);
                  }}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="button"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={handleAiSuggest}
                    disabled={aiLoading || !formMainKeyword.trim()}
                  >
                    ✨ {aiLoading ? "AI กำลังวิเคราะห์คำพ้อง..." : "ให้ AI แนะนำคำพ้องอัตโนมัติ"}
                  </button>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>หมวดหมู่สายงาน (Category)</label>
                <select
                  className={styles.inputField}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {COMMON_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Synonyms (คำพ้อง/ทักษะที่เกี่ยวข้อง)</label>
                <div className={styles.tagContainer}>
                  {formSynonyms.map((tag, idx) => (
                    <span key={idx} className={styles.modalDarkTag}>
                      {tag}
                      <button
                        type="button"
                        className={styles.tagDeleteIcon}
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className={styles.tagInput}
                    placeholder="เพิ่มคำ..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDownTag}
                    onBlur={handleAddTag}
                  />
                </div>
                <div className={styles.helperText}>พิมพ์แล้วกด Enter เพื่อเพิ่มเป็น Tag</div>

                {validationError && (
                  <div className={styles.errorAlert}>
                    <span>🚫</span>
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              <div className={styles.modalFoot}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setEditingGroup(null)}
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={styles.btnGold}
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ยืนยันการลบกลุ่มคำ ── */}
      {deletingGroup && (
        <div
          className={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingGroup(null);
          }}
        >
          <div className={styles.deleteDialog}>
            <div className={styles.deleteIconBox}>
              <WarningIcon size={26} />
            </div>

            <h3 className={styles.deleteTitle}>ยืนยันการลบกลุ่มคำ</h3>

            <p className={styles.deleteDesc}>
              คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มคำ &ldquo;{deletingGroup.mainKeyword}&rdquo; ออกจากฐานข้อมูล?
            </p>
            <p className={styles.deleteSubdesc}>การกระทำนี้จะลบข้อมูลออกจากระบบทันที</p>

            <div className={styles.deleteActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setDeletingGroup(null)}
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={styles.btnRed}
                onClick={handleConfirmDelete}
                disabled={saving}
              >
                {saving ? "กำลังลบ..." : "ยืนยันการลบ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ยืนยันการบันทึกกลุ่มคำ ── */}
      {confirmSaveTarget && (
        <div
          className={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmSaveTarget(null);
          }}
        >
          <div className={styles.deleteDialog} style={{ maxWidth: 440, padding: "32px 28px 24px" }}>
            <div className={styles.saveIconBox}>
              <WrenchIcon size={26} />
            </div>

            <h3 className={styles.deleteTitle} style={{ fontSize: 18, marginBottom: 8 }}>
              ยืนยันการบันทึกกลุ่มคำ
            </h3>

            <p className={styles.deleteDesc} style={{ marginBottom: 24, color: "#64748b", fontSize: 13.5 }}>
              คุณต้องการบันทึกกลุ่มคำ &ldquo;{formMainKeyword}&rdquo; ลงฐานข้อมูลใช่หรือไม่?
            </p>

            <div className={styles.deleteActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setConfirmSaveTarget(null)}
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={styles.btnGold}
                onClick={executeConfirmSave}
                disabled={saving}
              >
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {showToast && <div className={styles.toast}>✓ {toastMsg}</div>}
    </div>
  );
}
