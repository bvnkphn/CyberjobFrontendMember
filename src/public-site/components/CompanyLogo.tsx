import type { Company } from '@cyberjob/shared';

/** โลโก้บริษัทแบบตัวอักษรย่อ (Feature 3.3 – แสดงโลโก้บริษัท) */
export function CompanyLogo({
  company,
  size = 48,
}: {
  company: Company;
  size?: number;
}) {
  // โลโก้ที่ผู้ประกอบการอัปโหลดเองจากหลังบ้าน Owner
  if (company.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={company.logoUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-lg bg-white object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

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

