import Link from "next/link";

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return <Link href="/" className={`brand ${inverted ? "brand-inverted" : ""}`} aria-label="CyberJob หน้าแรก">CYBER<span>JOB</span></Link>;
}
