import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProfileEditor } from "@/components/profile/profile-editor";

export default function EditProfilePage() {
  return <div className="site-shell"><Header /><ProfileEditor /><Footer /></div>;
}
