'use client';

import { useMemo, useState } from 'react';
import type { TreeNode } from '@cyberjob/shared';
import { useI18n } from '@/public-site/i18n/LanguageProvider';
import { useDropdown } from '@/public-site/lib/useDropdown';
import { ChevronDownIcon, SearchIcon } from '@/public-site/components/Icons';

interface TreeSelectProps {
  /** ไอคอนหน้าปุ่ม */
  icon: React.ReactNode;
  placeholder: string;
  /** ข้อความของตัวเลือก "ทั้งหมด" */
  allLabel: string;
  /** placeholder ของช่องค้นหาในแผง */
  searchPlaceholder: string;
  nodes: TreeNode[];
  /** ค่าที่เลือกอยู่ ('' = ทั้งหมด) */
  value: string;
  onChange: (value: string) => void;
}

/**
 * Dropdown แบบมีช่องค้นหาและกลุ่มย่อยที่กางได้
 * ใช้กับ "สาขาอาชีพ" และ "สถานที่ทำงาน" ในแถบค้นหา (Feature 3.1)
 */
export function TreeSelect({
  icon,
  placeholder,
  allLabel,
  searchPlaceholder,
  nodes,
  value,
  onChange,
}: TreeSelectProps) {
  const { t, lang } = useI18n();
  const { open, setOpen, toggle, ref } = useDropdown();
  const [term, setTerm] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const label = (node: TreeNode) => (lang === 'en' ? node.labelEn : node.labelTh);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return nodes;
    return nodes
      .map((group) => {
        const groupHit =
          group.labelTh.toLowerCase().includes(q) ||
          group.labelEn.toLowerCase().includes(q);
        const children = (group.children ?? []).filter(
          (c) =>
            c.labelTh.toLowerCase().includes(q) ||
            c.labelEn.toLowerCase().includes(q),
        );
        if (groupHit) return group;
        if (children.length) return { ...group, children };
        return null;
      })
      .filter((g): g is TreeNode => g !== null);
  }, [nodes, term]);

  const selectedLabel = useMemo(() => {
    if (!value) return '';
    for (const group of nodes) {
      if (group.value === value) return label(group);
      const child = (group.children ?? []).find((c) => c.value === value);
      if (child) return label(child);
    }
    return value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, nodes, lang]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setTerm('');
  }

  return (
    <div ref={ref} className="relative flex-1 md:max-w-[220px]">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50"
      >
        <span className="shrink-0 text-slate-400">{icon}</span>
        <span
          className={`flex-1 truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDownIcon
          width={16}
          height={16}
          className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <SearchIcon
                width={15}
                height={15}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>

          <ul className="max-h-72 overflow-y-auto py-1 scroll-slim">
            <li>
              <button
                type="button"
                onClick={() => pick('')}
                className={`w-full px-3.5 py-2 text-left text-sm ${
                  value === ''
                    ? 'bg-brand-50 font-semibold text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {allLabel}
              </button>
            </li>

            {filtered.map((group) => {
              const isOpen = expanded.includes(group.value) || term.trim() !== '';
              return (
                <li key={group.value}>
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => pick(group.value)}
                      className={`flex-1 px-3.5 py-2 text-left text-sm ${
                        value === group.value
                          ? 'bg-brand-50 font-semibold text-brand-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {label(group)}
                    </button>
                    {(group.children?.length ?? 0) > 0 && (
                      <button
                        type="button"
                        aria-label={label(group)}
                        onClick={() =>
                          setExpanded((list) =>
                            list.includes(group.value)
                              ? list.filter((v) => v !== group.value)
                              : [...list, group.value],
                          )
                        }
                        className="px-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      >
                        <ChevronDownIcon
                          width={16}
                          height={16}
                          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {isOpen &&
                    (group.children ?? []).map((child) => (
                      <button
                        key={child.value}
                        type="button"
                        onClick={() => pick(child.value)}
                        className={`block w-full py-1.5 pl-7 pr-3.5 text-left text-[13px] ${
                          value === child.value
                            ? 'bg-brand-50 font-semibold text-brand-700'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {label(child)}
                      </button>
                    ))}
                </li>
              );
            })}

            {filtered.length === 0 && (
              <li className="px-3.5 py-4 text-center text-sm text-slate-400">
                {t('search.noResult')}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

