import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CompanyProfile } from "@/components/company/company-profile";

export default function CompanyProfilePage() {
  return <div className="company-site-shell"><Header /><CompanyProfile /><Footer /></div>;
}