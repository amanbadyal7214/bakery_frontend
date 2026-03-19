import Navbar from "@/components/Navbar";
import CartSheet from "@/components/CartSheet"; 
import HeroSection from "@/components/home/HeroSection";
import FeatureStrip from "@/components/home/FeatureStrip";
import MenuSection from "@/components/home/MenuSection";
import FreshBreadSection from "@/components/home/FreshBreadSection";
import AboutSection from "@/components/home/AboutSection";
import ImageGallerySection from "@/components/home/ImageGallerySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CtaBannerSection from "@/components/home/CtaBannerSection";
import ContactSection from "@/components/home/ContactSection";
import FooterSection from "@/components/home/FooterSection";

export default function Home() {

  return (
    <div className="font-inter text-navy overflow-x-hidden">
      <Navbar /> {/* Ensure Navbar is present if it handles layout, but CartSheet is separate */}
      
      {/* Add CartSheet here so it's available on the Home page */}
      <CartSheet />

      <HeroSection />

      <FeatureStrip />

      <MenuSection />

      <FreshBreadSection />

      <AboutSection />

      <ImageGallerySection />

      <TestimonialsSection />

      <CtaBannerSection />

      <ContactSection />

      <FooterSection />
    </div>
  );
}
