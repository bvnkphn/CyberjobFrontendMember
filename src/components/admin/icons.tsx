type IconProps = { size?: number; className?: string };

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const MenuIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const GridIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="15" width="7" height="6" rx="1.5" /></svg>
);
export const UsersIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" /></svg>
);
export const BuildingIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><rect x="5" y="3" width="11" height="18" rx="1.5" /><path d="M16 9h3v12h-3M8.5 7h1M11.5 7h1M8.5 11h1M11.5 11h1M8.5 15h1M11.5 15h1M9 21v-3h3v3" /></svg>
);
export const BriefcaseIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></svg>
);
export const LifebuoyIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9" /></svg>
);
export const GearIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const BookIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22.5zM21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5a2.5 2.5 0 0 1 2.5 2.5z" /></svg>
);
export const BellIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
);
export const ChevronIcon = ({ size, dir = "down" }: IconProps & { dir?: "down" | "up" | "left" | "right" }) => {
  const d = { down: "m6 9 6 6 6-6", up: "m6 15 6-6 6 6", left: "m15 6-6 6 6 6", right: "m9 6 6 6-6 6" }[dir];
  return <svg {...base(size)}><path d={d} /></svg>;
};
export const SearchIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const DownloadIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M12 3v12M7 10l5 5 5-5M4 21h16" /></svg>
);
export const DotsIcon = ({ size }: IconProps) => (
  <svg {...base(size)} fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
);
export const CloseIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const WarningIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" /></svg>
);
export const AwardIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><circle cx="12" cy="9" r="6" /><path d="m12 6 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5L11 8z" /><path d="M8.5 14 7 22l5-3 5 3-1.5-8" /></svg>
);
export const GradCapIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6" /></svg>
);
export const TrashIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
);
export const SortIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="m7 9 5-5 5 5M7 15l5 5 5-5" /></svg>
);
export const EditIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);
export const CheckIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><polyline points="20 6 9 17 4 12" /></svg>
);
export const PlusIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
export const CalendarIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
export const AlertCircleIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
export const CreditCardIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
);
export const EyeIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const TagIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
);
export const WrenchIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
);
export const VideoIcon = ({ size }: IconProps) => (
  <svg {...base(size)}><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" /></svg>
);

