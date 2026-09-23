"use client";

/* ---------------------------------------------------------------- */
/* ไอคอน                                                             */
/* ---------------------------------------------------------------- */

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const SearchIcon = () => (
  <svg {...iconProps} width={18} height={18}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const FilterIcon = () => (
  <svg {...iconProps}>
    <path d="M3 5h18M7 12h10M11 19h2" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...iconProps} width={14} height={14}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const FileIcon = () => (
  <svg {...iconProps} width={15} height={15}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const SendIcon = () => (
  <svg {...iconProps}>
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3l-6.5 18-4-8-8-4z" />
  </svg>
);

export const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg {...iconProps} fill={filled ? "currentColor" : "none"}>
    <path d="M19 21l-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const TrashIcon = () => (
  <svg {...iconProps}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
);

export const EyeIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const ChevronIcon = ({ dir = "right" }: { dir?: "left" | "right" }) => (
  <svg {...iconProps} width={15} height={15}>
    <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
  </svg>
);
