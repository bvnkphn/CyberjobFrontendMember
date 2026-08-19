import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProfileDashboard } from "@/components/profile/profile-dashboard";

export default function ProfilePage() {
  return <div className="site-shell"><Header /><ProfileDashboard /><Footer /></div>;
}
