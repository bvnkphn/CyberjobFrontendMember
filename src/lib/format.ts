const DAY = 86_400_000;

export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY));
}

/** "วันนี้" / "3 วันที่แล้ว" / "Today" / "3 days ago" */
export function relativeDay(iso: string, isEn: boolean): string {
  const days = daysSince(iso);
  if (days === 0) return isEn ? "Today" : "วันนี้";
  if (days === 1) return isEn ? "Yesterday" : "เมื่อวาน";
  return isEn ? `${days} days ago` : `${days} วันที่แล้ว`;
}

/** "5 นาทีที่แล้ว" สำหรับการแจ้งเตือน */
export function relativeTime(iso: string, isEn: boolean): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return isEn ? "Just now" : "เมื่อสักครู่";
  if (minutes < 60) return isEn ? `${minutes} min ago` : `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isEn ? `${hours} h ago` : `${hours} ชั่วโมงที่แล้ว`;
  return relativeDay(iso, isEn);
}

/** วัน/เดือน/ปี ค.ศ. ตามชีตสเปก */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatBaht(value: number, isEn: boolean): string {
  return `${value.toLocaleString("th-TH")} ${isEn ? "THB" : "บาท"}`;
}

export function salaryRange(min: number, max: number, isEn: boolean): string {
  return `${min.toLocaleString("th-TH")} - ${max.toLocaleString("th-TH")} ${isEn ? "THB" : "บาท"}`;
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export const WORK_STYLE_LABEL = {
  onsite: { th: "ทำงานที่สำนักงาน", en: "On-site" },
  hybrid: { th: "ไฮบริด", en: "Hybrid" },
  remote: { th: "ทำงานจากระยะไกล", en: "Remote" },
} as const;

export const EMPLOYMENT_LABEL = {
  fulltime: { th: "งานเต็มเวลา", en: "Full-time" },
  contract: { th: "สัญญาจ้าง", en: "Contract" },
  temporary: { th: "งานชั่วคราว", en: "Temporary" },
  parttime: { th: "พาร์ทไทม์", en: "Part-time" },
  internship: { th: "ฝึกงาน", en: "Internship" },
} as const;

export const COMPANY_TYPE_LABEL = {
  private: { th: "ภาคเอกชน", en: "Private sector" },
  government: { th: "ภาครัฐ", en: "Government" },
  state_enterprise: { th: "รัฐวิสาหกิจ", en: "State enterprise" },
} as const;
