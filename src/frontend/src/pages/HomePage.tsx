import { AboutFounders } from "../components/home/AboutFounders";
import { ClientStories } from "../components/home/ClientStories";
import { ContactSection } from "../components/home/ContactSection";
import { CourseCarouselPreview } from "../components/home/CourseCarouselPreview";
import { HeroSection } from "../components/home/HeroSection";
import { PlatformFeatures } from "../components/home/PlatformFeatures";
import { ServicesOrbitPreview } from "../components/home/ServicesOrbitPreview";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { Layout } from "../components/layout/Layout";

export function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <WhyChooseUs />
      <PlatformFeatures />
      <ServicesOrbitPreview />
      <ClientStories />
      <CourseCarouselPreview />
      <AboutFounders />
      <ContactSection />
    </Layout>
  );
}
