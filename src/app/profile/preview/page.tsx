import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ResumePreview } from "@/components/profile/resume-preview";

export default function ResumePreviewPage() {
  return <div className="site-shell resume-site-shell"><Header /><ResumePreview /><Footer /></div>;
}
