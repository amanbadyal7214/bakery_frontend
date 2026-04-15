import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Star,
  Quote,
  ChevronLeft as Prev,
  ChevronRight as Next,
  Zap,
  Ticket,
  Percent,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/home/FooterSection";
import { Link } from "react-router-dom";
import { useState } from "react";
import type { EventConfig } from "@/components/events/EventTemplate1";

// ─────────────────────────────────────────────
// Re-export the type so pages can import from either template
// ─────────────────────────────────────────────
export type { EventConfig };

interface Props {
  config: EventConfig;
}

export default function EventTemplate2({ config: c }: Props) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [hoveredOffer, setHoveredOffer] = useState<number | null>(null);

  const prev = () =>
    setActiveTestimonial((p) => (p === 0 ? c.testimonials.length - 1 : p - 1));
  const next = () =>
    setActiveTestimonial((p) => (p === c.testimonials.length - 1 ? 0 : p + 1));

  // Marquee items
  const marqueeItems = [...c.highlights, ...c.highlights];

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ 
        backgroundColor: c.darkColor,
        "--accent": c.accentColor,
        "--dark": c.darkColor,
        "--bg": c.bgColor
      } as any}
    >
      <Navbar />

      {/* ══════════════════════════════════════════════
          SECTION 1 — Cinematic Hero
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Image with Parallax-like feel */}
        <div className="absolute inset-0 z-0">
          <img 
            src={c.heroImage} 
            className="w-full h-full object-cover filter brightness-[0.4] contrast-[1.1]" 
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
        </div>

        {/* Back Link */}
        <div className="absolute top-32 left-8 md:left-16 z-20">
          <Link
            to="/"
            className="group flex items-center gap-3 text-white/40 hover:text-white transition-all"
          >
            <div className="p-3 rounded-full border border-white/10 group-hover:border-white/40 transition-all">
              <ChevronLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span 
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 border transition-all hover:bg-white hover:text-black cursor-default"
              style={{ borderColor: `${c.accentColor}40`, color: c.accentColor }}
            >
              <Zap size={10} fill="currentColor" />
              {c.badge}
            </span>
            
            <h1 className="font-playfair text-7xl md:text-[12rem] font-black leading-none mb-12 tracking-tighter">
              {c.title}
            </h1>

            <p className="text-xl md:text-3xl font-playfair italic opacity-70 mb-16 max-w-3xl mx-auto leading-relaxed">
              {c.subtitle}
            </p>

            {/* Glass Info Chips */}
            <div className="flex flex-wrap justify-center gap-4 mb-20">
              {[
                { icon: Calendar, text: `${c.startDate} — ${c.endDate}` },
                { icon: Clock, text: c.time },
                { icon: MapPin, text: c.location },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center gap-3 group hover:bg-white/10 transition-all"
                >
                  <item.icon size={16} style={{ color: c.accentColor }} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>

            <motion.a
                href={c.ctaLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-4 px-16 py-7 rounded-full text-black font-black uppercase tracking-widest text-xs shadow-[0_20px_60px_-10px_rgba(255,255,255,0.3)] transition-all hover:brightness-110"
                style={{ backgroundColor: "white" }}
              >
                Go Inside
                <ArrowRight size={18} />
            </motion.a>
          </motion.div>
        </div>

        {/* Scroll Hint */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Scroll Down</span>
          <div className="w-px h-12 bg-white/40" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — Bold Marquee Strip
      ══════════════════════════════════════════════ */}
      <div 
        className="py-8 bg-white overflow-hidden border-y border-white/10"
      >
        <motion.div
           className="flex gap-20 whitespace-nowrap"
           animate={{ x: ["0%", "-50%"] }}
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {marqueeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-8 text-black">
              <span className="text-5xl font-playfair font-black tracking-tight">{item.title}</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.accentColor }} />
              <span className="text-sm font-black uppercase tracking-[0.3em] opacity-40">{item.desc.split('.')[0]}</span>
              <div className="w-3 h-3 rounded-full opacity-20" style={{ backgroundColor: c.darkColor }} />
            </div>
          ))}
        </motion.div>
      </div>

      <main className="bg-black">
        {/* ══════════════════════════════════════════════
            SECTION 3 — Immersive Feature Showcase
        ══════════════════════════════════════════════ */}
        <section className="py-40 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-32">
              <span className="text-[11px] font-black tracking-[0.6em] uppercase text-white/30 block mb-6">Exclusives</span>
              <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] font-playfair italic">The Highlights</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-px bg-white/10">
              {c.highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="bg-black p-20 flex flex-col justify-between aspect-square lg:aspect-auto min-h-[500px] group transition-all"
                >
                  <div 
                    className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-12 group-hover:bg-white group-hover:text-black transition-all duration-500"
                  >
                    <item.icon size={32} strokeWidth={1} />
                  </div>
                  
                  <div>
                    <h3 className="text-4xl font-playfair font-black mb-6 italic">{item.title}</h3>
                    <p className="text-lg text-white/40 leading-relaxed font-medium max-w-md">{item.desc}</p>
                  </div>

                  <div className="mt-12 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.4em] opacity-20 group-hover:opacity-100 transition-all">Feature 0{i+1}</span>
                    <div className="w-12 h-px bg-white/20 group-hover:w-20 group-hover:bg-white transition-all duration-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 4 — Bento Grid Offers
        ══════════════════════════════════════════════ */}
        <section className="py-40 px-6 md:px-12 bg-white text-black rounded-t-[5rem]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
              <div className="max-w-2xl">
                <span className="text-[11px] font-black tracking-[0.4em] uppercase opacity-40 mb-6 block">Collection</span>
                <h2 className="text-6xl md:text-8xl font-playfair font-black leading-none">Curated Delights</h2>
              </div>
              <p className="text-xl md:text-2xl font-playfair italic opacity-60 max-w-sm mb-2">
                Hand-selected gems for the sophisticated palate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {c.offers.map((offer, i) => {
                const isLarge = i === 0;
                return (
                  <motion.div
                    key={i}
                    className={`relative rounded-[3rem] overflow-hidden group cursor-pointer ${isLarge ? 'md:col-span-12 lg:col-span-7' : 'md:col-span-6 lg:col-span-5'}`}
                    style={{ minHeight: isLarge ? '600px' : '400px' }}
                  >
                    <img 
                      src={offer.image} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                      alt={offer.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <span className="px-5 py-2 rounded-full border border-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">{offer.label}</span>
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white hover:text-black">
                          <ShoppingBag size={24} />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-4xl font-playfair font-black mb-4">{offer.name}</h3>
                        <div className="flex items-center gap-6">
                          <span className="text-3xl font-black">{offer.price}</span>
                          <span className="text-sm opacity-40 line-through">{offer.originalPrice}</span>
                          <div className="px-3 py-1 rounded-full bg-red-500 text-[10px] font-black uppercase tracking-widest">{offer.discount}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 5 — Fullscreen Testimonial Carousel
        ══════════════════════════════════════════════ */}
        <section className="relative py-40 overflow-hidden bg-black">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Quote size={60} className="mx-auto mb-16 text-white/10" />
                <h2 className="text-4xl md:text-6xl font-playfair italic font-black leading-tight mb-16 text-white">
                   "{c.testimonials[activeTestimonial].quote}"
                </h2>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="w-px h-12 bg-white/20 mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.5em] text-white/40">{c.testimonials[activeTestimonial].name}</p>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} fill={s <= c.testimonials[activeTestimonial].stars ? c.accentColor : 'transparent'} color={c.accentColor} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center items-center gap-12 mt-24">
              <button onClick={prev} className="p-4 rounded-full border border-white/10 hover:bg-white/10 transition-all"><Prev size={20} /></button>
              <div className="flex gap-3">
                {c.testimonials.map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: activeTestimonial === i ?'white' : 'rgba(255,255,255,0.1)',
                      transform: activeTestimonial === i ? 'scale(1.5)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
              <button onClick={next} className="p-4 rounded-full border border-white/10 hover:bg-white/10 transition-all"><Next size={20} /></button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 6 — Split Design Exit
        ══════════════════════════════════════════════ */}
        <section className="flex flex-col lg:flex-row bg-[#111]">
          <div className="lg:w-1/2 p-24 md:p-40 flex flex-col justify-center">
             <span className="text-[11px] font-black tracking-[0.4em] uppercase opacity-40 mb-10 block">End Story</span>
             <h2 className="text-6xl md:text-9xl font-playfair font-black tracking-tighter leading-none text-white italic mb-16">
              "Every ending is a new beginning."
             </h2>
             <motion.a
                href={c.ctaLink}
                whileHover={{ x: 10 }}
                className="flex items-center gap-6 group"
             >
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black shadow-2xl">
                  <ArrowRight size={32} />
                </div>
                <span className="text-xl font-playfair font-black italic group-hover:tracking-widest transition-all">Claim Your Invite</span>
             </motion.a>
          </div>
          
          <div className="lg:w-1/2 relative min-h-[600px] overflow-hidden">
            <img src={c.heroImage} className="absolute inset-0 w-full h-full object-cover filter contrast-[1.2] grayscale-[50%]" alt="Final" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            
            <div className="absolute inset-0 flex items-center justify-center p-20 text-center">
               <div className="p-12 border border-white/20 rounded-[3rem] backdrop-blur-xl">
                 <p className="text-6xl font-playfair font-black mb-8 italic">40% Off</p>
                 <p className="text-xs font-black uppercase tracking-[0.5em] opacity-60">Reserved for members</p>
               </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}

// Internal icons helper
function ShoppingBag({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
