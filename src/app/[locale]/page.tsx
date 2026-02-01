import { Header } from './_components/header';
import { HeroSection } from './_components/hero-section';
import { FeaturesSection } from './_components/features-section';
import { WhySection } from './_components/why-section';
import { CtaSection } from './_components/cta-section';
import { Footer } from './_components/footer';


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <WhySection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
