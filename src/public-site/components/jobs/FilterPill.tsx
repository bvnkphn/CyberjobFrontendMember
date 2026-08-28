'use client';

import type { ReactNode } from 'react';
import { useDropdown } from '@/public-site/lib/useDropdown';
import { ChevronDownIcon } from '@/public-site/components/Icons';

interface FilterPillProps {
  label: string;
  /** ข้อความสรุปเมื่อมีการเลือกแล้ว (แทนที่ label) */
  summary?: string;
  active?: boolean;
  children: ReactNode;
  /** ความกว้างของแผงที่เปิดออกมา */
  panelWidth?: string;
}

/**
 * ปุ่มตัวกรองแบบ pill บนแถบสีน้ำเงิน (Feature 3.2)
 * กดแล้วเปิดแผงตัวเลือกด้านล่าง
 */
export function FilterPill({
  label,
  summary,
  active,
  children,
  panelWidth = 'w-72',
}: FilterPillProps) {
  const { open, toggle, ref } = useDropdown();
  const isOn = Boolean(active);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex max-w-[260px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          isOn
            ? 'border-accent-500 bg-accent-500 text-brand-900'
            : 'border-white/40 bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        <span className="truncate">{summary || label}</span>
        <ChevronDownIcon
          width={16}
          height={16}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          className={`absolute left-0 top-full z-50 mt-2 ${panelWidth} rounded-xl border border-slate-200 bg-white p-4 text-slate-700 shadow-pop`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** แถวเช็กบ็อกซ์ในแผงตัวกรอง */
export function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
      />
      {label}
    </label>
  );
}

