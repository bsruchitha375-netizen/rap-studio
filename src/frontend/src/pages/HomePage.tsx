import { ChatbotWidget } from "../components/chatbot/ChatbotWidget";
import { AboutFounders } from "../components/home/AboutFounders";
import { ContactSection } from "../components/home/ContactSection";
import { CourseCarouselPreview } from "../components/home/CourseCarouselPreview";
import { GalleryPreview } from "../components/home/GalleryPreview";
import { HeroSection } from "../components/home/HeroSection";
import { ServicesOrbitPreview } from "../components/home/ServicesOrbitPreview";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { Layout } from "../components/layout/Layout";

export function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <WhyChooseUs />
      <ServicesOrbitPreview />
      <CourseCarouselPreview />
      <GalleryPreview />
      <AboutFounders />
      <ContactSection />
      <ChatbotWidget />
    </Layout>
  );
}
