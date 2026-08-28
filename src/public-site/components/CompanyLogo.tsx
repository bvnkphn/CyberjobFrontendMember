import type { Company } from '@cyberjob/shared';

/** โลโก้บริษัทแบบตัวอักษรย่อ (Feature 3.3 – แสดงโลโก้บริษัท) */
export function CompanyLogo({
  company,
  size = 48,
}: {
  company: Company;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-lg font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: company.logoColor,
        fontSize: size * 0.42,
        color: company.logoColor === '#FFC629' ? '#0F2A6B' : '#fff',
      }}
    >
      {company.logoText}
    </span>
  );
}

