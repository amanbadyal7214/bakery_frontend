import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Gift,
  Tag,
  Ticket,
  Star,
  Calendar,
  Clock3,
  MapPin,
  ArrowRight,
  ChevronLeft,
  Quote,
  ShoppingBag as LucideShoppingBag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/home/FooterSection";
import { Link } from "react-router-dom";
import { useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface EventHighlight {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface EventOffer {
  label: string;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: string;
  emoji?: string;
}

export interface EventTestimonial {
  name: string;
  quote: string;
  avatar?: string;
  stars: number;
}

export interface EventFaq {
  q: string;
  a: string;
}

export interface EventConfig {
  // Hero
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  accentColor: string;
  darkColor: string;
  bgColor: string;
  heroImage: string;

  // Date & Venue
  startDate: string;
  endDate: string;
  time: string;
  location: string;

  // Countdown
  countdown: { days: number; hours: number; mins: number; secs: number };

  // Floating decorative emojis (4 items)
  floatingEmojis: [string, string, string, string];

  // Highlight cards (up to 4)
  highlights: EventHighlight[];

  // Featured product/offer cards
  offers: EventOffer[];

  // Testimonials
  testimonials: EventTestimonial[];

  // FAQ
  faqs: EventFaq[];
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

interface Props {
  config: EventConfig;
}

// Decorative background accent
const AccentBg = ({ color, className = "" }: { color: string; className?: string }) => (
  <div
    className={`absolute rounded-full blur-[120px] opacity-20 pointer-events-none ${className}`}
    style={{ backgroundColor: color }}
  />
);

export default function EventTemplate1({ config: c }: Props) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen overflow-x-hidden selection:bg-opacity-30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-sans relative"
      style={{ 
        backgroundColor: c.bgColor, 
        color: c.darkColor,
        "--accent": c.accentColor,
        "--dark": c.darkColor 
      } as any}
    >
      <AccentBg color={c.accentColor} className="top-0 right-0 w-[400px] h-[400px] -translate-y-1/2 translate-x-1/2" />
      <AccentBg color={c.darkColor} className="bottom-0 left-0 w-[250px] h-[250px] translate-y-1/2 -translate-x-1/2" />
      <Navbar />

      <main className="pt-20 pb-0">
        {/* Header Controls */}
        <div className="px-4 md:px-8 max-w-6xl mx-auto flex justify-between items-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 group transition-all"
          >
            <div
              className="p-2 rounded-xl border border-current opacity-20 group-hover:opacity-100 group-hover:bg-white transition-all duration-300"
            >
              <ChevronLeft size={16} />
            </div>
            <span className="text-xs font-black tracking-[0.18em] uppercase opacity-40 group-hover:opacity-100">Home</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-current opacity-20 text-[9px] font-bold uppercase tracking-widest bg-white/60 backdrop-blur-md">
            <Sparkles size={12} className="text-yellow-400 animate-pulse" />
            Event Live Now
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative px-4 md:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="z-10"
              >
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-2 text-[9px] font-black tracking-[0.4em] uppercase mb-3 px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/20 shadow-sm"
                  style={{ color: c.accentColor }}
                >
                  <Sparkles size={10} className="text-yellow-400" />
                  {c.badge}
                </motion.span>
                <h1 className="font-playfair text-3xl md:text-5xl font-black leading-[1.1] mb-5 tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                  {c.title.split(" ").map((word, i) => (
                    <span key={i} className="inline-block mr-1 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>{word}</span>
                  ))}
                </h1>
                <p className="text-base md:text-lg opacity-70 leading-relaxed mb-8 max-w-md font-medium">
                  {c.subtitle}
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  <motion.a
                    href={c.ctaLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-3 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-2xl transition-all flex items-center gap-2 bg-gradient-to-r from-[#D4A373] to-[#b07d4a] hover:brightness-110"
                  >
                    <ArrowRight size={14} />
                    {c.ctaLabel}
                  </motion.a>
                  <div className="flex items-center gap-2 px-4 border-l border-current opacity-20">
                    <span className="text-xl">{c.floatingEmojis[0]}</span>
                    <span className="text-xl">{c.floatingEmojis[1]}</span>
                  </div>
                </div>
                {/* Event Stats Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: Calendar, text: `${c.startDate} - ${c.endDate}` },
                    { icon: Clock3, text: c.time },
                    { icon: MapPin, text: c.location },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-black/10 text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <item.icon size={12} className="text-[#D4A373]" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </motion.div>
              {/* Right Hero Image Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.93, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative aspect-[4/5] lg:aspect-square"
              >
                {/* Image Container */}
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-10px_rgba(0,0,0,0.13)] border-4 border-white">
                  <img 
                    src={c.heroImage} 
                    alt={c.title}
                    className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                </div>
                {/* Floating Countdown Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-7 -left-7 md:left-14 right-7 md:right-auto bg-white p-5 rounded-[1.5rem] shadow-2xl z-20 flex flex-col items-center border border-[#D4A373]"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-50 flex items-center gap-1"><Clock3 size={10} /> Closing Soon</p>
                  <div className="flex gap-4">
                    {Object.entries(c.countdown).map(([k, v], i) => (
                      <div key={k} className="flex flex-col items-center">
                        <span className="text-lg font-black text-[#D4A373]">{v}</span>
                        <span className="text-[9px] uppercase opacity-40">{k}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                {/* Decorative Elements */}
                <div 
                  className="absolute -top-7 -right-7 w-28 h-28 rounded-full blur-[60px] opacity-40 pointer-events-none" 
                  style={{ backgroundColor: c.accentColor }} 
                />
                <div className="absolute top-6 right-6 text-3xl animate-bounce-slow">{c.floatingEmojis[2]}</div>
                <div className="absolute bottom-6 left-6 text-3xl animate-bounce-slow2">{c.floatingEmojis[3]}</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Marquee Strip for Highlights (distinct style) */}
        <section className="py-6 bg-gradient-to-r from-[#fff8f0] to-[#f7e7d1] border-y border-[#D4A373]/20 overflow-hidden">
          <motion.div
            className="flex gap-16 whitespace-nowrap animate-marquee"
            initial={{ x: 0 }}
            animate={{ x: [0, -400] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...c.highlights, ...c.highlights].map((item, i) => (
              <div key={i} className="flex items-center gap-6">
                <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/80 border border-[#D4A373]/30 text-[#D4A373] font-black text-xs uppercase tracking-widest shadow-sm">
                  <item.icon size={14} />
                  {item.title}
                </span>
                <span className="text-xs opacity-40 font-bold">{item.desc.split('.')[0]}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Highlights Grid (with animated cards and SVG divider) */}
        <section className="py-20 px-4 md:px-8 bg-white/50 backdrop-blur-xl relative">
          <AccentBg color={c.accentColor} className="top-1/2 left-1/2 w-[180px] h-[180px] -translate-x-1/2 -translate-y-1/2 opacity-10" />
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.4em] uppercase opacity-40 mb-2"><Gift size={12} className="text-[#D4A373]" />Experiences</span>
                <h2 className="text-2xl md:text-4xl font-playfair font-black leading-none">Why attend our celebration?</h2>
              </div>
              <p className="text-xs opacity-60 max-w-xs font-medium">
                We've curated these special features to make this event truly unforgettable for you.
              </p>
            </div>
            {/* Decorative SVG divider */}
            <div className="w-full flex justify-center -mb-8">
              <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 12 Q60 32 120 12" stroke={c.accentColor} strokeWidth="3" fill="none" />
              </svg>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-12">
              {c.highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-7 rounded-2xl bg-gradient-to-br from-[#fff8f0] to-[#f7e7d1] border border-[#D4A373] hover:scale-105 hover:shadow-2xl transition-all duration-400 overflow-hidden flex flex-col items-start"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-400 bg-white/80 border border-[#D4A373]"
                    style={{ color: c.accentColor }}
                  >
                    <item.icon size={18} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-bold mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-xs opacity-50 leading-relaxed font-medium mb-3">{item.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-all"><Sparkles size={10} /> Special</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Offers (modernized, animated cards) */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 bg-gradient-to-r from-[#D4A373] to-[#b07d4a] text-white shadow-lg"
              >
                <LucideShoppingBag size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Limited Series</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-playfair font-black leading-tight mb-3">Featured Items</h2>
              <p className="text-xs opacity-50 font-medium max-w-lg mx-auto">
                Discover our exclusive collection specially crafted for this celebration.
              </p>
            </div>
            {/* Responsive grid for Featured Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {c.offers.map((offer, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(62,39,35,0.18)" }}
                  transition={{ type: "spring", stiffness: 300 }}
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
      

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div 
              className="relative p-8 md:p-16 rounded-[2.5rem] text-center overflow-hidden border border-white/20 shadow-[-10px_-10px_30px_rgba(255,255,255,1),10px_10px_30px_rgba(0,0,0,0.05)] bg-gradient-to-br from-[#fff8f0] to-[#f7e7d1]"
            >
              {/* Background Accents */}
              <AccentBg color={c.accentColor} className="top-0 right-0 w-[200px] h-[200px]" />
              <AccentBg color={c.darkColor} className="bottom-0 left-0 w-[200px] h-[200px]" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex gap-2 mb-6">
                  <span className="text-2xl animate-bounce">{c.floatingEmojis[1]}</span>
                  <span className="text-2xl animate-bounce-slow">{c.floatingEmojis[2]}</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-playfair font-black mb-6 max-w-2xl leading-none">
                  Savor the moments of this celebration.
                </h2>
                <motion.a
                  href={c.ctaLink}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-10 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-3 hover:bg-[#D4A373] hover:text-black transition-all"
                  style={{ backgroundColor: c.darkColor }}
                >
                  {c.ctaLabel}
                  <ArrowRight size={14} />
                </motion.a>
                <p className="mt-8 text-[9px] font-black uppercase tracking-[0.5em] opacity-30">
                  Offers active until {c.endDate}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
