import { ContactSupportBand } from "@/public-site/components/ContactSupport";
import { Footer } from "@/public-site/components/Footer";
import {
  AboutSection,
  ArticlesSection,
  EmployerCta,
  HeroSection,
  RecommendedJobs,
  ResumeAccountSection,
} from "@/public-site/components/home/HomeSections";
import { Navbar } from "@/public-site/components/Navbar";
import { jobsService } from "@/public-site/services/jobs.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recommended = await jobsService.recommended(3);

  return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <ResumeAccountSection />
          <AboutSection />
          <EmployerCta />
          <RecommendedJobs jobs={recommended} />
          <ArticlesSection />
        </main>
        <ContactSupportBand />
        <Footer />
      </div>
  );
}
