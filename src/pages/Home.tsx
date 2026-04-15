import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeatureStrip from "@/components/home/FeatureStrip";
import MenuSection from "@/components/home/MenuSection";
import FreshBreadSection from "@/components/home/FreshBreadSection";
import ImageGallerySection from "@/components/home/ImageGallerySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CtaBannerSection from "@/components/home/CtaBannerSection";
import ContactSection from "@/components/home/ContactSection";
import FooterSection from "@/components/home/FooterSection";
import OriginStorySection from "@/components/home/OriginStorySection";

export default function Home() {

  return (
    <div className="font-inter text-[#D4A373] overflow-x-hidden">
      <Navbar /> {/* Ensure Navbar is present if it handles layout, but CartSheet is separate */}

      <HeroSection />

      <FeatureStrip />

      <MenuSection />

      <FreshBreadSection />

     <OriginStorySection/>

      <ImageGallerySection />

      <TestimonialsSection />

      <CtaBannerSection />

      <ContactSection />

      <FooterSection />
    </div>
  );
}
