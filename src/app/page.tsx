import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { QuickPaySection } from "@/components/QuickPaySection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TransparencyPreview } from "@/components/TransparencyPreview";
import { GalleryPreview } from "@/components/GalleryPreview";
import { TrustSection } from "@/components/TrustSection";
import { AboutSection } from "@/components/AboutSection";
import { TeamSection } from "@/components/TeamSection";
import { ClosingCTA } from "@/components/ClosingCTA";
import { Footer } from "@/components/Footer";

// Todo Server Component salvo LanguageToggle (hoja Client dentro de Header)
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <QuickPaySection />
        <HowItWorksSection />
        <TransparencyPreview />
        <GalleryPreview />
        <TrustSection />
        <AboutSection />
        <TeamSection />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}
