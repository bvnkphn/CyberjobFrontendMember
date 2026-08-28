import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

/** โลโก้ CYBERJOB – CYBER น้ำเงิน / JOB เหลือง (สลับเป็นขาวบนพื้นเข้ม) */
export function Logo({ variant = 'light', className = '' }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="CyberJob"
      className={`inline-flex select-none items-center text-[22px] font-extrabold tracking-tight ${className}`}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      <span className={variant === 'dark' ? 'text-white' : 'text-brand-800'}>
        CYBER
      </span>
      <span className="text-accent-500">JOB</span>
    </Link>
  );
}

