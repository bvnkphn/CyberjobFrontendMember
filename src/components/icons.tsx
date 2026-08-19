import type { SVGProps } from "react";

export type IconName = "user" | "edit" | "preview" | "briefcase" | "mail" | "logout" | "education" | "trophy" | "globe" | "skills" | "menu" | "chevron";
const paths: Record<IconName, React.ReactNode> = {
  user: <><circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  edit: <><path d="M4 3h10a2 2 0 0 1 2 2v5M8 7h5M8 11h3M5 3v18h7"/><path d="m14 18 5-5 2 2-5 5-3 1z"/></>,
  preview: <><path d="M5 3h11a2 2 0 0 1 2 2v5M8 7h6M8 11h3M5 3v18h8"/><path d="M13 17s2-3 5-3 5 3 5 3-2 3-5 3-5-3-5-3Z"/><circle cx="18" cy="17" r="1"/></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/></>,
  education: <><path d="m2 9 10-5 10 5-10 5zM6 11v5c3 3 9 3 12 0v-5M22 9v6"/></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0zM6 6H3v2a4 4 0 0 0 5 4M18 6h3v2a4 4 0 0 1-5 4M12 13v5M8 21h8M9 18h6"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>,
  skills: <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 7h8M7 8l4 8M17 8l-4 8"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>, chevron: <path d="m8 10 4 4 4-4"/>,
};
export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
