import { Link } from "react-router-dom";
import { navLinks, useProductActions } from "./home-data";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ChevronUp, Clock } from "lucide-react";
import bakeryIllustrations from "@/assets/bakery-illustrations.png";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/api";

interface StoreProfile {
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  openingTime?: string;
  closingTime?: string;
}

export default function FooterSection() {
  const { scrollTo } = useProductActions();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setProfileLoading(true);
        const res = await axiosInstance.get('/store');
        const data = res?.data || {};
        const p = data.profile || data;
        if (mounted && p && Object.keys(p).length > 0) {
          setProfile({
            address: p.address,
            phone: p.phone,
            email: p.email,
            hours: p.hours,
            openingTime: p.openingTime,
            closingTime: p.closingTime,
          });
        }
      } catch {
        // silently fail — footer shows fallback text
      } finally {
        if (mounted) setProfileLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#2D1B08] text-[#FDFBF7] pt-24 pb-12 overflow-hidden border-t-8 border-[#D4A373]">
      {/* Decorative Flour Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${bakeryIllustrations})`, backgroundSize: '400px' }}
      />
      
      {/* Texture Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

      <div className="container mx-auto relative z-10 px-6">
        {/* Middle Section: Info Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          {/* Logo Column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-8 group">
              <span className="font-playfair text-3xl font-black tracking-tight text-white group-hover:text-[#D4A373] transition-colors">
                Hangary? <span className="text-[#D4A373]">Sweet.</span>
              </span>
            </Link>
            <p className="text-[#FDFBF7]/40 text-sm leading-loose mb-8 font-light italic">
              "Crafting joy, one crumb at a time. Our bakery is more than just bread—it's a home for lovers of honest, soulful food."
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4A373] hover:bg-[#D4A373] hover:text-[#2D1B08] transition-all duration-300 shadow-sm"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-10">
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-8">Navigation</h4>
            <div className="space-y-4">
              {navLinks.map((link) => (
                <button 
                  key={link} 
                  onClick={() => scrollTo(link)} 
                  className="block text-[#FDFBF7]/50 hover:text-[#D4A373] transition-all text-sm font-medium bg-transparent border-none p-0 cursor-pointer text-left"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-8">Visit The Hearth</h4>
            {profileLoading ? (
              <div className="space-y-6 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-5 h-5 rounded bg-white/10 shrink-0" />
                    <div className="h-3 bg-white/10 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {profile?.address && (
                  <div className="flex gap-3">
                    <MapPin className="text-[#D4A373] shrink-0" size={18} />
                    <span className="text-sm text-[#FDFBF7]/60 leading-relaxed font-light whitespace-pre-line">
                      {profile.address}
                    </span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex gap-3">
                    <Phone className="text-[#D4A373] shrink-0" size={18} />
                    <span className="text-sm text-[#FDFBF7]/60 font-light">{profile.phone}</span>
                  </div>
                )}
                {profile?.email && (
                  <div className="flex gap-3">
                    <Mail className="text-[#D4A373] shrink-0" size={18} />
                    <span className="text-sm text-[#FDFBF7]/60 font-light">{profile.email}</span>
                  </div>
                )}
                {!profile?.address && !profile?.phone && !profile?.email && (
                  <p className="text-sm text-[#FDFBF7]/30 italic">Contact info not available</p>
                )}
              </div>
            )}
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-8">Bakery Hours</h4>
            {profileLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-white/10 rounded w-24" />
                    <div className="h-3 bg-white/10 rounded w-28" />
                  </div>
                ))}
              </div>
            ) : (profile?.hours || profile?.openingTime || profile?.closingTime) ? (
              <div className="flex gap-3 items-start">
                <Clock className="text-[#D4A373] shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-[#FDFBF7]/60 font-light whitespace-pre-line leading-relaxed">
                  {profile.hours
                    ? profile.hours
                    : [profile.openingTime, profile.closingTime].filter(Boolean).join(' – ')}
                </span>
              </div>
            ) : (
              <p className="text-sm text-[#FDFBF7]/30 italic">Hours not available</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-white/20 text-[11px] font-medium tracking-wide">
              © 2026 HANGARY? SWEET. ALL RIGHTS RESERVED.
            </p>
            <p className="text-white text-[10px] mt-1 font-light italic">
              Crafted with soul by <a href="https://pisoftinformatics.com" target="_blank" className="hover:text-[#D4A373] underline transition-colors">Pisoft Informatics</a>
            </p>
          </div>

          <div className="flex items-center gap-10">
             <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
                <a href="#" className="hover:text-[#D4A373] transition-colors">Privacy</a>
             </div>
             
             <button 
                onClick={backToTop}
                className="w-12 h-12 rounded-2xl border-2 border-white/5 flex items-center justify-center text-white/20 hover:text-[#D4A373] hover:border-[#D4A373] group transition-all duration-500 bg-transparent p-0 cursor-pointer"
             >
                <ChevronUp className="group-hover:-translate-y-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
