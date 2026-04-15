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

  // Define dark chocolate color
  const darkChocolate = '#3E2723';
  const accent = c.accentColor || '#D2B48C'; // tan/gold accent fallback
  const dark = c.darkColor || darkChocolate;
  const bg = c.bgColor || darkChocolate;

  // Marquee items
  const marqueeItems = [...c.highlights, ...c.highlights];

  // Remove unwanted testimonial if present
  if (Array.isArray(c.testimonials)) {
    c.testimonials = c.testimonials.filter(t =>
      !(
        (t.quote && t.quote.includes("The festival cakes were absolutely divine") && t.name && t.name.includes("Priya S")) ||
        (t.quote && t.quote.includes("Amazing deals and packaging. Will definitely order every year!") && t.name && t.name.includes("Rahul M."))
      )
    );
  }

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ 
        backgroundColor: bg,
        color: dark,
        '--accent': accent,
        '--dark': dark,
        '--bg': bg
      } as React.CSSProperties}
    >
      <Navbar />

      {/* SECTION 1 — Cinematic Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Image with Parallax-like feel */}
        <div className="absolute inset-0 z-0">
          <img 
            src={c.heroImage} 
            className="w-full h-full object-cover" 
            style={{ filter: 'brightness(0.4) contrast(1.1)' }}
            alt="Hero"
          />
          <div className="absolute inset-0" style={{background: `linear-gradient(to bottom, ${dark}CC, transparent, ${dark})`}} />
        </div>

        {/* Back Link */}
        <div className="absolute top-32 left-8 md:left-16 z-20">
          <Link
            to="/"
            className="group flex items-center gap-3 text-white/40 hover:text-white transition-all"
          >
            <div className="p-3 rounded-full border group-hover:border-white/40 transition-all" style={{borderColor: accent + '40'}}>
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
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-8 border transition-all hover:bg-white hover:text-black cursor-default"
              style={{ borderColor: `${accent}40`, color: accent, background: bg }}
            >
              <Zap size={9} fill="currentColor" />
              {c.badge}
            </span>
            
            <h1 className="font-playfair text-4xl md:text-7xl font-black leading-none mb-8 tracking-tighter" style={{color: dark}}>
              {c.title}
            </h1>

            <p className="text-base md:text-xl font-playfair italic opacity-70 mb-10 max-w-2xl mx-auto leading-relaxed" style={{color: dark}}>
              {c.subtitle}
            </p>

            {/* Glass Info Chips */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                { icon: Calendar, text: `${c.startDate} — ${c.endDate}` },
                { icon: Clock, text: c.time },
                { icon: MapPin, text: c.location },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="px-5 py-2 rounded-full backdrop-blur-2xl border flex items-center gap-2 group transition-all"
                  style={{background: bg + 'CC', borderColor: accent + '40'}}
                >
                  <item.icon size={13} style={{ color: accent }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{color: dark}}>{item.text}</span>
                </div>
              ))}
            </div>

            <motion.a
                href={c.ctaLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow transition-all hover:brightness-110"
                style={{ backgroundColor: accent, color: bg }}
              >
                Go Inside
                <ArrowRight size={15} />
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
          <div className="w-px h-12" style={{background: accent + '40'}} />
        </motion.div>
      </section>

      {/* SECTION 2 — Bold Marquee Strip */}
      <div 
        className="py-8 overflow-hidden border-y"
        style={{background: bg, borderColor: accent + '20'}}
      >
        <motion.div
           className="flex gap-20 whitespace-nowrap"
           animate={{ x: ["0%", "-50%"] }}
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {marqueeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-8" style={{color: dark}}>
              <span className="text-5xl font-playfair font-black tracking-tight">{item.title}</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
              <span className="text-sm font-black uppercase tracking-[0.3em] opacity-40">{item.desc.split('.')[0]}</span>
              <div className="w-3 h-3 rounded-full opacity-20" style={{ backgroundColor: dark }} />
            </div>
          ))}
        </motion.div>
      </div>

      <main style={{background: bg}}>
        {/* SECTION 3 — Immersive Feature Showcase */}
        <section>
          <div className="max-w-7xl mx-auto">
            <div className="mb-2">
              <span className="text-[11px] font-black tracking-[0.4em] uppercase opacity-40 mb-4 block" style={{color: accent + '99'}}>Exclusives</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9] font-playfair italic" style={{color: dark}}>The Highlights</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-px" style={{background: accent + '20'}}>
              {c.highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="p-8 md:p-10 flex flex-col justify-between aspect-square lg:aspect-auto min-h-[250px] group transition-all"
                  style={{background: darkChocolate, color: accent}}
                >
                  <div 
                    className="w-14 h-14 rounded-full border flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all duration-500"
                    style={{borderColor: accent + '40', color: accent, background: darkChocolate}}
                  >
                    <item.icon size={24} strokeWidth={1} />
                  </div>
                  <div>
                    <h3 className="text-xl font-playfair font-black mb-2 italic">{item.title}</h3>
                    <p className="text-sm leading-relaxed font-medium max-w-md" style={{color: accent + '99'}}>{item.desc}</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.4em] opacity-20 group-hover:opacity-100 transition-all">Feature 0{i+1}</span>
                    <div className="w-8 h-px group-hover:w-16 transition-all duration-500" style={{background: accent + '40'}} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — Bento Grid Offers */}
        <section className="py-16 px-6 md:px-12 rounded-t-[5rem]" style={{background: accent, color: bg}}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
              <div className="max-w-2xl">
                <span className="text-[11px] font-black tracking-[0.4em] uppercase opacity-40 mb-4 block">Collection</span>
                <h2 className="text-3xl md:text-5xl font-playfair font-black leading-none">Curated Delights</h2>
              </div>
              <p className="text-base md:text-lg font-playfair italic opacity-60 max-w-sm mb-2">
                Hand-selected gems for the sophisticated palate.
              </p>
            </div>

            {/* Responsive grid for Curated Delights cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {c.offers.map((offer, i) => (
                <div
                  key={i}
                  className="bg-[#FCFAFA] rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(62,39,35,0.05)] hover:shadow-[0_20px_50px_rgba(62,39,35,0.12)] transition-all duration-500 border border-[#3E2723]/5 flex flex-col h-full group"
                >
                  {/* Emoji or Image */}
                  <div className="relative aspect-square w-full rounded-t-[2rem] overflow-hidden mb-4 bg-[#F5F1ED] flex items-center justify-center text-5xl">
                    {offer.emoji ? offer.emoji : (
                      <img src={offer.image} alt={offer.name} className="w-full h-full object-cover" />
                    )}
                    {offer.label && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm flex items-center gap-1">
                        <Star size={10} className="fill-[#D4A373] text-[#D4A373]" />
                        <span className="text-[#3E2723] text-[0.6rem] font-playfair uppercase tracking-wider">
                          {offer.label}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Content Section */}
                  <div className="flex-1 flex flex-col px-4 pb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-playfair text-base font-bold text-[#3E2723] group-hover:text-[#D4A373] transition-colors line-clamp-1">
                        {offer.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2 text-[#D4A373]">
                      <Star size={12} className="fill-[#D4A373] text-[#D4A373]" />
                      <span className="text-[#3E2723] text-xs font-playfair">4.8</span>
                    </div>
                    {/* Price & Action */}
                    <div className="mt-auto pt-3 border-t border-[#3E2723]/5 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-playfair uppercase tracking-widest text-[#3E2723]/40 italic">Price</span>
                        <span className="text-sm font-playfair text-[#3E2723]">{offer.price}</span>
                        <span className="text-xs opacity-40 line-through">{offer.originalPrice}</span>
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-[9px] font-black uppercase tracking-widest text-white mt-1">{offer.discount}</span>
                      </div>
                      <button
                        className="bg-[#3E2723] text-white font-playfair py-2 px-4 text-[9px] rounded-xl hover:bg-[#D4A373] hover:text-[#3E2723] transition-all shadow-md hover:shadow-lg active:scale-95 duration-200 uppercase tracking-widest"
                      >
                        Add To Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 — Fullscreen Testimonial Carousel */}
        {/* <section className="relative py-40 overflow-hidden" style={{background: bg}}>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Quote size={60} className="mx-auto mb-16" style={{color: accent + '20'}} />
                <h2 className="text-2xl md:text-3xl font-playfair italic font-black leading-tight mb-10" style={{color: dark}}>
                   "{c.testimonials[activeTestimonial].quote}"
                </h2>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="w-px h-12 mb-4" style={{background: accent + '40'}} />
                  <p className="text-xs font-black uppercase tracking-[0.5em]" style={{color: accent + '99'}}>{c.testimonials[activeTestimonial].name}</p>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} fill={s <= c.testimonials[activeTestimonial].stars ? accent : 'transparent'} color={accent} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center items-center gap-12 mt-24">
              <button onClick={prev} className="p-4 rounded-full border hover:bg-white/10 transition-all" style={{borderColor: accent + '40', color: accent}}><Prev size={20} /></button>
              <div className="flex gap-3">
                {c.testimonials.map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: activeTestimonial === i ? accent : accent + '20',
                      transform: activeTestimonial === i ? 'scale(1.5)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
              <button onClick={next} className="p-4 rounded-full border hover:bg-white/10 transition-all" style={{borderColor: accent + '40', color: accent}}><Next size={20} /></button>
            </div>
          </div>
        </section> */}

        {/* SECTION 6 — Split Design Exit */}
        <section className="flex flex-col lg:flex-row" style={{background: dark}}>
          <div className="lg:w-1/2 p-6 md:p-10 flex flex-col justify-center">
             <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 mb-4 block" style={{color: accent + '99'}}>End Story</span>
             <h2 className="text-2xl md:text-5xl font-playfair font-black tracking-tighter leading-none italic mb-6" style={{color: bg}}>
              "Every ending is a new beginning."
             </h2>
             <motion.a
                href={c.ctaLink}
                whileHover={{ x: 10 }}
                className="flex items-center gap-6 group"
             >
                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl" style={{background: accent, color: bg}}>
                  <ArrowRight size={20} />
                </div>
                <span className="text-base font-playfair font-black italic group-hover:tracking-widest transition-all" style={{color: bg}}>Claim Your Invite</span>
             </motion.a>
          </div>
          
          <div className="lg:w-1/2 relative min-h-[350px] overflow-hidden">
            <img src={c.heroImage} className="absolute inset-0 w-full h-full object-cover" style={{filter: 'contrast(1.2) grayscale(50%)'}} alt="Final" />
            <div className="absolute inset-0" style={{background: dark + '66', backdropFilter: 'blur(4px)'}} />
            
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
               <div className="p-8 border rounded-[2rem] backdrop-blur-xl" style={{borderColor: accent + '40', background: bg + 'CC'}}>
                 <p className="text-2xl font-playfair font-black mb-2 italic" style={{color: accent}}>40% Off</p>
                 <p className="text-xs font-black uppercase tracking-[0.5em] opacity-60" style={{color: accent + '99'}}>Reserved for members</p>
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
