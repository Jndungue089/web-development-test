import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/landing/AboutSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HeroSection } from "@/components/landing/Hero";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </>
  );
}
// ...existing code...
