/**
 * ภาพประกอบสำหรับ cover / แกลเลอรี / แผนที่
 * ถ้ามี URL รูปจริงจะแสดงรูปนั้น ถ้าไม่มีจะวาด SVG แทนเพื่อให้หน้าไม่ว่าง
 * เปลี่ยนไปใช้ next/image ได้ทันทีเมื่อมีไฟล์ภาพจาก Figma
 */

/** seed อาจเป็น undefined ได้ถ้าข้อมูลจาก API ยังไม่ครบ – ให้ค่าเริ่มต้นแทนการพัง */
function hash(seed?: string | null): number {
  const text = typeof seed === 'string' && seed ? seed : 'cyberjob';
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const COVER_PALETTES: [string, string, string][] = [
  ['#0A1C4A', '#17348C', '#2B5AD1'],
  ['#0F2A6B', '#1B45B8', '#4C7AE0'],
  ['#122A6E', '#2B5AD1', '#8FAEEE'],
  ['#0A1C4A', '#1B45B8', '#FFC629'],
];

/** แบนเนอร์ด้านบนของประกาศงาน / โปรไฟล์บริษัท */
export function CoverBanner({
  seed,
  src,
  className = '',
}: {
  seed?: string | null;
  src?: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`object-cover ${className}`} />;
  }

  const [a, b, c] = COVER_PALETTES[hash(seed) % COVER_PALETTES.length];
  const id = `cv-${hash(seed)}`;

  return (
    <svg
      viewBox="0 0 1200 340"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="1200" height="340" fill={`url(#${id})`} />
      <circle cx="980" cy="60" r="180" fill={c} opacity="0.18" />
      <circle cx="180" cy="320" r="200" fill={c} opacity="0.12" />
      {/* เส้นกริดจาง ๆ ให้ดูเหมือนภาพเทคโนโลยี */}
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={i}
          x1={i * 90}
          y1={0}
          x2={i * 90 - 120}
          y2={340}
          stroke="#FFFFFF"
          strokeOpacity="0.06"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/** รูปบรรยากาศบริษัท */
export function GalleryTile({
  seed,
  src,
  className = '',
}: {
  seed?: string | null;
  src?: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`object-cover ${className}`} />;
  }

  const [a, b, c] = COVER_PALETTES[hash(seed) % COVER_PALETTES.length];
  const id = `gl-${hash(seed)}`;

  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id})`} />
      <rect x="46" y="118" width="228" height="60" rx="6" fill="#FFFFFF" opacity="0.9" />
      <rect x="62" y="134" width="120" height="8" rx="4" fill={c} opacity="0.7" />
      <rect x="62" y="150" width="86" height="7" rx="3.5" fill="#94A3B8" />
      <circle cx="250" cy="150" r="14" fill={c} opacity="0.6" />
      <circle cx="238" cy="58" r="26" fill="#FFFFFF" opacity="0.18" />
    </svg>
  );
}

/** แผนที่แบบคงที่ (placeholder – เปลี่ยนเป็น Google Maps embed ได้) */
export function StaticMap({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 320" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="640" height="320" fill="#EEF1F5" />
      {/* ถนน */}
      <path d="M0 210 H640" stroke="#FFFFFF" strokeWidth="18" />
      <path d="M0 96 H640" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M170 0 V320" stroke="#FFFFFF" strokeWidth="14" />
      <path d="M430 0 V320" stroke="#FFFFFF" strokeWidth="8" />
      <path d="M0 270 H640" stroke="#FFFFFF" strokeWidth="6" />
      {/* บล็อกอาคาร */}
      <rect x="24" y="118" width="122" height="70" rx="4" fill="#E2E7EE" />
      <rect x="196" y="118" width="210" height="70" rx="4" fill="#E2E7EE" />
      <rect x="456" y="118" width="160" height="70" rx="4" fill="#E2E7EE" />
      <rect x="196" y="228" width="210" height="60" rx="4" fill="#E2E7EE" />
      <rect x="456" y="228" width="160" height="60" rx="4" fill="#DCE7DC" />
      {/* หมุดตำแหน่ง */}
      <g transform="translate(288 132)">
        <path
          d="M16 44S32 27 32 16A16 16 0 1 0 0 16c0 11 16 28 16 28Z"
          fill="#EF4444"
        />
        <circle cx="16" cy="16" r="6" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

