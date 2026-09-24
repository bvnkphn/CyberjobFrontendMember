"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  BookIcon,
  ChevronIcon,
  WarningIcon,
  WrenchIcon,
} from "../icons";
import styles from "./Synonyms.module.css";

export interface SynonymGroup {
  id: string;
  mainKeyword: string;
  synonyms: string[];
  updatedAt: string;
  updatedBy: string;
}

const INITIAL_GROUPS: SynonymGroup[] = [
  {
    id: "SYN-001",
    mainKeyword: "โปรแกรมเมอร์",
    synonyms: ["นักเขียนโปรแกรม", "Developer", "Programmer", "Coder"],
    updatedAt: "27/7/2569",
    updatedBy: "Super Admin",
  },
  {
    id: "SYN-002",
    mainKeyword: "เครือข่าย",
    synonyms: ["Network", "ระบบเครือข่าย", "Networking"],
    updatedAt: "27/7/2569",
    updatedBy: "Super Admin",
  },
  {
    id: "SYN-003",
    mainKeyword: "นักวิเคราะห์ข้อมูล",
    synonyms: ["Data Analyst", "Data Scientist", "นักวิทยาศาสตร์ข้อมูล"],
    updatedAt: "27/7/2569",
    updatedBy: "Super Admin",
  },
  {
    id: "SYN-004",
    mainKeyword: "ความปลอดภัยไซเบอร์",
    synonyms: ["Cyber Security", "Cybersecurity", "ความมั่นคงปลอดภัยทางไซเบอร์"],
    updatedAt: "27/7/2569",
    updatedBy: "Admin",
  },
  {
    id: "SYN-005",
    mainKeyword: "ผู้ดูแลระบบ",
    synonyms: ["System Admin", "Administrator", "SysAdmin", "ผู้บริหารระบบ"],
    updatedAt: "27/7/2569",
    updatedBy: "Admin",
  },
  {
    id: "SYN-006",
    mainKeyword: "DevOps",
    synonyms: ["Development Operations", "DevOps Engineer", "วิศวกร DevOps"],
    updatedAt: "27/7/2569",
    updatedBy: "Super Admin",
  },
  {
    id: "SYN-007",
    mainKeyword: "ผู้ทดสอบระบบ",
    synonyms: ["Software Tester", "QA Engineer", "Quality Assurance", "Test Automation"],
    updatedAt: "27/7/2569",
    updatedBy: "Super Admin",
  },
  {
    id: "SYN-008",
    mainKeyword: "สถาปัตยกรรมคลาวด์",
    synonyms: ["Cloud Architect", "Cloud Solutions", "AWS Architect", "Azure Specialist"],
    updatedAt: "27/7/2569",
    updatedBy: "Admin",
  },
];

export function SynonymsView() {
  const [groups, setGroups] = useState<SynonymGroup[]>(INITIAL_GROUPS);
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SynonymGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<SynonymGroup | null>(null);
  const [confirmSaveTarget, setConfirmSaveTarget] = useState<"add" | "edit" | null>(null);

  // Form States
  const [formMainKeyword, setFormMainKeyword] = useState("");
  const [formSynonyms, setFormSynonyms] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filtering
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const matchMain = g.mainKeyword.toLowerCase().includes(q);
      const matchSyn = g.synonyms.some((s) => s.toLowerCase().includes(q));
      return matchMain || matchSyn;
    });
  }, [groups, search]);

  // Paginated
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Check if a word already exists in other groups
  const checkWordExistsInSystem = (word: string, currentGroupId?: string) => {
    const target = word.trim().toLowerCase();
    for (const g of groups) {
      if (currentGroupId && g.id === currentGroupId) {
        // In the same group, check duplicate inside synonyms
        continue;
      }
      if (g.mainKeyword.toLowerCase() === target) {
        return `"${word.trim()}" มีอยู่ในระบบแล้ว`;
      }
      if (g.synonyms.some((s) => s.toLowerCase() === target)) {
        return `"${word.trim()}" มีอยู่ในระบบแล้ว`;
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
      // still add tag so user sees error banner as shown in media_1790170323408.png
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
    // Re-check validation
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
    setFormSynonyms([]);
    setTagInput("");
    setValidationError(null);
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const openEdit = (group: SynonymGroup) => {
    setEditingGroup(group);
    setFormMainKeyword(group.mainKeyword);
    setFormSynonyms([...group.synonyms]);
    setTagInput("");
    setValidationError(null);
  };

  // Trigger Save Add (Validates and opens confirmation dialog)
  const handleSaveAdd = () => {
    const mainClean = formMainKeyword.trim();
    if (!mainClean) return;

    // Check if main keyword exists
    const mainErr = checkWordExistsInSystem(mainClean);
    if (mainErr) {
      setValidationError(mainErr);
      return;
    }

    // Check if any synonym exists
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

  // Trigger Save Edit (Validates and opens confirmation dialog)
  const handleSaveEdit = () => {
    if (!editingGroup) return;
    const mainClean = formMainKeyword.trim();
    if (!mainClean) return;

    // Check main keyword duplicate
    const mainErr = checkWordExistsInSystem(mainClean, editingGroup.id);
    if (mainErr) {
      setValidationError(mainErr);
      return;
    }

    // Check synonyms duplicate
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

  // Execute Save after confirmation in media_1790170329104.png
  const executeConfirmSave = () => {
    const mainClean = formMainKeyword.trim();
    if (!mainClean) return;

    if (confirmSaveTarget === "add") {
      const newGroup: SynonymGroup = {
        id: `SYN-${String(groups.length + 1).padStart(3, "0")}`,
        mainKeyword: mainClean,
        synonyms: formSynonyms,
        updatedAt: "27/7/2569",
        updatedBy: "Admin",
      };
      setGroups([newGroup, ...groups]);
      setIsAddOpen(false);
      setConfirmSaveTarget(null);
    } else if (confirmSaveTarget === "edit" && editingGroup) {
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id !== editingGroup.id) return g;
          return {
            ...g,
            mainKeyword: mainClean,
            synonyms: formSynonyms,
            updatedAt: "27/7/2569",
            updatedBy: "Super Admin",
          };
        })
      );
      setEditingGroup(null);
      setConfirmSaveTarget(null);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingGroup) return;
    setGroups((prev) => prev.filter((g) => g.id !== deletingGroup.id));
    setDeletingGroup(null);
  };

  return (
    <div className={styles.container}>
      {/* ── Page Header (Matching Screenshot 1 & 4) ── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Synonym & Keyword Dictionary</h1>
        <p className={styles.subtitle}>จัดการกลุ่มคำเหมือนและคำสำคัญสำหรับระบบค้นหา</p>
      </div>

      {/* ── Stat Card (Matching Screenshot 1 & 4) ── */}
      <div className={styles.statCard}>
        <div className={styles.statIconBox}>
          📖
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>กลุ่มคำทั้งหมด</span>
          <span className={styles.statValue}>{groups.length}</span>
        </div>
      </div>

      {/* ── Search Bar & Add Button Row ── */}
      <div className={styles.actionBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ค้นหาด้วย Main Keyword หรือ Synonyms..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <button type="button" className={styles.addBtn} onClick={openAdd}>
          <PlusIcon size={16} />
          เพิ่มกลุ่มคำใหม่
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Main Keyword</th>
                <th>Synonyms</th>
                <th style={{ width: "16%" }}>วันที่แก้ไขล่าสุด</th>
                <th style={{ width: "16%" }}>ผู้แก้ไขล่าสุด</th>
                <th style={{ width: "10%" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id}>
                  {/* Main Keyword */}
                  <td>
                    <span className={styles.mainKeywordText}>{item.mainKeyword}</span>
                  </td>

                  {/* Synonyms Pills */}
                  <td>
                    <div className={styles.tagsRow}>
                      {item.synonyms.map((tag, idx) => (
                        <span key={idx} className={styles.tagPill}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* วันที่แก้ไขล่าสุด */}
                  <td>
                    <span className={styles.dateText}>{item.updatedAt}</span>
                  </td>

                  {/* ผู้แก้ไขล่าสุด */}
                  <td>
                    <span className={styles.userText}>{item.updatedBy}</span>
                  </td>

                  {/* จัดการ (Actions) */}
                  <td>
                    <div className={styles.actionBtns}>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer (Matching Screenshot) ── */}
        <div className={styles.tableFooter}>
          <div className={styles.footerLeft}>
            <span>แสดง</span>
            <select
              className={styles.pageSelect}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              รายการต่อหน้า | 1–{filtered.length} จาก {groups.length}
            </span>
          </div>

          <div className={styles.pager}>
            <button
              type="button"
              className={styles.pagerBtn}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronIcon size={14} dir="left" />
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className={styles.pagerBtn}
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronIcon size={14} dir="right" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL: เพิ่มกลุ่มคำใหม่ (media_1790170323418.png) ── */}
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
                <label className={styles.fieldLabel}>Main Keyword</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="คำหลัก"
                  value={formMainKeyword}
                  onChange={(e) => {
                    setFormMainKeyword(e.target.value);
                    setValidationError(null);
                  }}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Synonyms</label>
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
                  onClick={() => setIsAddOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={styles.btnGold}
                  onClick={handleSaveAdd}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: แก้ไขกลุ่มคำ (media_1790170323405.png & media_1790170323408.png) ── */}
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
                <label className={styles.fieldLabel}>Main Keyword</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={formMainKeyword}
                  onChange={(e) => {
                    setFormMainKeyword(e.target.value);
                    setValidationError(null);
                  }}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Synonyms</label>
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
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={styles.btnGold}
                  onClick={handleSaveEdit}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ยืนยันการลบกลุ่มคำ (media_1790170323411.png) ── */}
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
              คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มคำ &ldquo;{deletingGroup.mainKeyword}&rdquo; ?
            </p>
            <p className={styles.deleteSubdesc}>การกระทำนี้ไม่สามารถยกเลิกได้</p>

            <div className={styles.deleteActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setDeletingGroup(null)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={styles.btnRed}
                onClick={handleConfirmDelete}
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ยืนยันการบันทึกกลุ่มคำ (media_1790170329104.png) ── */}
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
              คุณต้องการบันทึกกลุ่มคำ {formMainKeyword} ใช่หรือไม่
            </p>

            <div className={styles.deleteActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setConfirmSaveTarget(null)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={styles.btnGold}
                onClick={executeConfirmSave}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
