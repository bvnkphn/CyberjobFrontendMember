import { MemberRouteGuard } from "@/components/member-route-guard";


export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <MemberRouteGuard>{children}</MemberRouteGuard>;
}
