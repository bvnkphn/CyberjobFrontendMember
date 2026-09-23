import { ContactSupportBand } from "@/public-site/components/ContactSupport";
import {
  AboutSection,
  ArticlesSection,
  EmployerCta,
  HeroSection,
  RecommendedJobs,
  ResumeAccountSection,
} from "@/public-site/components/home/HomeSections";
import { jobsService } from "@/public-site/services/jobs.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recommended = await jobsService.recommended(3);

  return (
      <>
        <main data-no-translate>
          <HeroSection />
          <ResumeAccountSection />
          <AboutSection />
          <EmployerCta />
          <RecommendedJobs jobs={recommended} />
          <ArticlesSection />
        </main>
        <ContactSupportBand />
      </>
  );
}
