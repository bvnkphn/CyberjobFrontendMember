/**
 * ภาพประกอบแบบ SVG (placeholder แทนรูปถ่ายในไฟล์ Figma)
 * เปลี่ยนเป็น <Image /> ที่ชี้ไปยังรูปจริงได้ทันทีเมื่อมีไฟล์ภาพ
 */

export function ResumeIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 280" className={className} role="img" aria-label="Resume profile">
      <defs>
        <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8FAFF" />
          <stop offset="100%" stopColor="#E3ECFD" />
        </linearGradient>
      </defs>
      <rect x="40" y="24" width="340" height="200" rx="12" fill="#0F2A6B" />
      <rect x="50" y="34" width="320" height="180" rx="8" fill="url(#screen)" />
      <rect x="18" y="228" width="384" height="14" rx="7" fill="#17348C" />
      <circle cx="110" cy="86" r="24" fill="#FFC629" />
      <rect x="150" y="70" width="120" height="12" rx="6" fill="#1B45B8" />
      <rect x="150" y="92" width="80" height="9" rx="4.5" fill="#8FAEEE" />
      <rect x="76" y="130" width="268" height="9" rx="4.5" fill="#C3D4F7" />
      <rect x="76" y="150" width="230" height="9" rx="4.5" fill="#C3D4F7" />
      <rect x="76" y="170" width="180" height="9" rx="4.5" fill="#C3D4F7" />
      <rect x="76" y="190" width="70" height="12" rx="6" fill="#FFC629" />
    </svg>
  );
}

export function TeamIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 300" className={className} role="img" aria-label="Team meeting">
      <rect width="420" height="300" rx="16" fill="#E8EFFB" />
      <rect x="40" y="52" width="200" height="120" rx="10" fill="#FFFFFF" />
      <rect x="58" y="72" width="120" height="10" rx="5" fill="#1B45B8" />
      <rect x="58" y="94" width="164" height="8" rx="4" fill="#C3D4F7" />
      <rect x="58" y="112" width="140" height="8" rx="4" fill="#C3D4F7" />
      <rect x="58" y="134" width="80" height="18" rx="9" fill="#FFC629" />
      <circle cx="300" cy="96" r="30" fill="#1B45B8" />
      <path d="M258 176c0-23 19-42 42-42s42 19 42 42z" fill="#17348C" />
      <circle cx="122" cy="220" r="24" fill="#FFC629" />
      <path d="M88 288c0-19 15-34 34-34s34 15 34 34z" fill="#E8A800" />
      <circle cx="212" cy="228" r="20" fill="#4C7AE0" />
      <path d="M184 288c0-15 13-28 28-28s28 13 28 28z" fill="#2B5AD1" />
      <circle cx="308" cy="228" r="20" fill="#8FAEEE" />
      <path d="M280 288c0-15 13-28 28-28s28 13 28 28z" fill="#4C7AE0" />
    </svg>
  );
}

const ARTICLE_PALETTES = [
  ['#1B45B8', '#4C7AE0'],
  ['#FFC629', '#E8A800'],
  ['#17348C', '#2B5AD1'],
];

export function ArticleThumb({
  index = 0,
  className = '',
}: {
  index?: number;
  className?: string;
}) {
  const [a, b] = ARTICLE_PALETTES[index % ARTICLE_PALETTES.length];
  const id = `art-${index}`;
  return (
    <svg viewBox="0 0 400 220" className={className} role="img" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#${id})`} />
      <circle cx="330" cy="40" r="70" fill="#FFFFFF" opacity="0.12" />
      <circle cx="70" cy="200" r="90" fill="#FFFFFF" opacity="0.1" />
      <rect x="40" y="86" width="150" height="10" rx="5" fill="#FFFFFF" opacity="0.85" />
      <rect x="40" y="108" width="110" height="8" rx="4" fill="#FFFFFF" opacity="0.6" />
      <rect x="40" y="126" width="130" height="8" rx="4" fill="#FFFFFF" opacity="0.45" />
    </svg>
  );
}

export function HeroPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="1200" height="420" fill="#0F2A6B" />
      <circle cx="1040" cy="70" r="210" fill="#17348C" />
      <circle cx="140" cy="400" r="240" fill="#122A6E" />
      <circle cx="880" cy="360" r="120" fill="#1B45B8" opacity="0.5" />
      <circle cx="300" cy="60" r="90" fill="#FFC629" opacity="0.14" />
      <path d="M0 420 Q300 300 600 380 T1200 330 V420Z" fill="#0A1C4A" opacity="0.6" />
    </svg>
  );
}

