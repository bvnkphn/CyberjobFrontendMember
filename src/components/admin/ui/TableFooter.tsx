"use client";

import { ChevronIcon } from "../icons";
import styles from "./ui.module.css";

export const PAGE_SIZES = [20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

/** "แสดง [20] รายการต่อหน้า | 1–10 จาก 10" + ปุ่มก่อนหน้า/ถัดไป ตามดีไซน์ */
export function TableFooter({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: PageSize;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        <span>แสดง</span>
        <select
          className={styles.select}
          value={pageSize}
          aria-label="จำนวนรายการต่อหน้า"
          onChange={(event) => onPageSizeChange(Number(event.target.value) as PageSize)}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>
          รายการต่อหน้า | {from}–{to} จาก {total}
        </span>
      </div>
      <div className={styles.pager}>
        <button
          type="button"
          className={styles.pagerButton}
          aria-label="หน้าก่อนหน้า"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronIcon size={16} dir="left" />
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className={styles.pagerButton}
          aria-label="หน้าถัดไป"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronIcon size={16} dir="right" />
        </button>
      </div>
    </div>
  );
}
