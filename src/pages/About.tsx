import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/home/FooterSection";
import CartSheet from "@/components/CartSheet";
import { Link } from "react-router-dom";
import {
  Award, Heart, Leaf, Clock, Users, Star, ChefHat, MapPin,
  Phone, ArrowRight, CheckCircle2, Flame, Wheat, Quote,
  Instagram, Twitter, Facebook, Moon, Thermometer, BadgeCheck, DoorOpen,
  Home, Store, Croissant, Trophy, Cake, Smartphone, Tv, Rocket
} from "lucide-react";

/* ─── Framer variants ─── */
const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};
const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } },
};
const slideRight = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

/* ─── Data ─── */
const stats = [
  { value: "40+",  label: "Years of Passion",  icon: "⏳" },
  { value: "120+", label: "Unique Recipes",     icon: "📖" },
  { value: "50K+", label: "Happy Customers",    icon: "❤️" },
  { value: "4.9★", label: "Average Rating",     icon: "⭐" },
];

const values = [
  {
    icon: <Leaf size={26} />,
    title: "100% Natural Ingredients",
    desc: "We source only the finest organic flour, dairy, and seasonal produce from local farms within 50km. No artificial colours, flavours, or preservatives — ever.",
    accent: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0",
  },
  {
    icon: <Flame size={26} />,
    title: "Freshly Baked Every Morning",
    desc: "Our bakers arrive at 3:00 AM every single day. By the time you walk in, everything is fresh out of the oven — still warm, still perfect.",
    accent: "#EA580C", bg: "#FFF7ED", border: "#FED7AA",
  },
  {
    icon: <Heart size={26} />,
    title: "Made with Love",
    desc: "Every croissant is hand-laminated, every cake is hand-decorated. We believe the care put into making something is what makes it truly special.",
    accent: "#E11D48", bg: "#FFF1F2", border: "#FECDD3",
  },
  {
    icon: <Wheat size={26} />,
    title: "Traditional Techniques",
    desc: "We use slow fermentation, stone-milled heritage grains, and time-honoured recipes passed through four generations of our family.",
    accent: "#D97706", bg: "#FFFBEB", border: "#FDE68A",
  },
  {
    icon: <Users size={26} />,
    title: "Community First",
    desc: "We donate unsold goods to local shelters every evening, and hire locally — 95% of our team lives within 5 minutes of the bakery.",
    accent: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE",
  },
  {
    icon: <Award size={26} />,
    title: "Award-Winning Quality",
    desc: "Named 'Best Artisan Bakery' by City Food Awards 5 years running. Our sourdough has been featured in national magazines and food shows.",
    accent: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE",
  },
];

const team = [
  {
    name: "Margaret Howell",
    role: "Founder & Head Baker",
    since: "Est. 1984",
    quote: "Baking is not a job. It is how I say 'I love you' to the world.",
    desc: "Margaret started Hangary Sweet in her home kitchen with nothing but a wooden spoon and a dream. 40 years later, she still personally oversees every sourdough batch.",
    img: "/about-baker.png",
    badge: "🏆 Founder",
    badgeBg: "bg-amber-100 text-amber-800",
  },
  {
    name: "James Howell",
    role: "Master Pastry Chef",
    since: "Since 1998",
    quote: "A perfect croissant is 729 layers of pure patience.",
    desc: "Margaret's son, trained at Le Cordon Bleu Paris. James brought French pastry techniques to Hangary Sweet, creating our legendary croissants and mille-feuilles.",
    img: "/bread.png",
    badge: "🥐 Pastry Chef",
    badgeBg: "bg-orange-100 text-orange-800",
  },
  {
    name: "Priya Sharma",
    role: "Cake Design Director",
    since: "Since 2012",
    quote: "Every cake is a canvas and sugar is my paint.",
    desc: "Priya transforms celebrations into edible art. Her custom cakes have graced weddings, corporate events, and birthdays across the country.",
    img: "/cake.png",
    badge: "🎂 Designer",
    badgeBg: "bg-pink-100 text-pink-800",
  },
  {
    name: "Carlos Rivera",
    role: "Bread & Grain Specialist",
    since: "Since 2016",
    quote: "Good bread needs time. Rushing it is the only crime.",
    desc: "Carlos studied traditional breadmaking in Spain and brings authentic techniques to every loaf. His baguettes sell out before 9 AM every single day.",
    img: "/croissant.png",
    badge: "🍞 Bread Expert",
    badgeBg: "bg-yellow-100 text-yellow-800",
  },
];

const milestones = [
  { year: "1984", event: "Margaret opens Hangary Sweet in her home kitchen on Elm Street.", icon: Home,        iconColor: "#E11D48", iconBg: "#FFF1F2" },
  { year: "1992", event: "First brick-and-mortar bakery opens. Queues form on opening day and never really stop.", icon: Store,       iconColor: "#D97706", iconBg: "#FFFBEB" },
  { year: "1998", event: "James returns from Paris and introduces the artisan pastry program.", icon: Croissant,   iconColor: "#EA580C", iconBg: "#FFF7ED" },
  { year: "2005", event: "Wins first 'Best Bakery' at the City Food Awards — the first of many.", icon: Trophy,      iconColor: "#CA8A04", iconBg: "#FEFCE8" },
  { year: "2012", event: "Custom cake studio opens. Priya Sharma joins and redefines cake art.", icon: Cake,        iconColor: "#DB2777", iconBg: "#FDF2F8" },
  { year: "2018", event: "Online ordering launches. 10,000 orders fulfilled in the very first month.", icon: Smartphone,  iconColor: "#2563EB", iconBg: "#EFF6FF" },
  { year: "2022", event: "50,000 happy customers milestone. Featured on national television.", icon: Tv,          iconColor: "#7C3AED", iconBg: "#F5F3FF" },
  { year: "2024", event: "Second location opens and Hangary Sweet subscription boxes launch nationwide.", icon: Rocket,      iconColor: "#16A34A", iconBg: "#F0FDF4" },
];

const testimonials = [
  {
    name: "Sophie Martin", role: "Wedding Client", avatar: "S", bg: "bg-rose-100 text-rose-700", stars: 5,
    text: "Hangary Sweet made our wedding cake and it was absolutely perfect. Tasted even better than it looked. Our guests still talk about it!",
  },
  {
    name: "David Okafor", role: "Regular Customer", avatar: "D", bg: "bg-blue-100 text-blue-700", stars: 5,
    text: "I've been coming here every Saturday morning for 8 years. The sourdough is incomparable. This place is a genuine community treasure.",
  },
  {
    name: "Aisha Rahman", role: "Food Blogger", avatar: "A", bg: "bg-amber-100 text-amber-700", stars: 5,
    text: "As someone who has reviewed hundreds of bakeries, Hangary Sweet is in a league of its own. Authentic, honest, extraordinary food.",
  },
];

/* ─── Parallax image helper ─── */
function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img src={src} alt={alt} style={{ y }} className="w-full h-full object-cover scale-110" />
    </div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-white font-inter text-[#1A2744] overflow-x-hidden">
      <Navbar />
      <CartSheet />

      {/* ══ HERO ══ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParallaxImage src="/hero-bg.png" alt="Bakery background" className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A0E08]/80 via-[#3E2723]/60 to-[#1A0E08]/88" />
        </div>
        <div className="absolute top-[15%] left-[8%] w-64 h-64 bg-[#D4A373]/15 rounded-full blur-[90px] z-0" />
        <div className="absolute bottom-[10%] right-[12%] w-80 h-80 bg-[#F5ECD7]/8 rounded-full blur-[100px] z-0" />

        {/* Floating bakery images */}
        <motion.img src="/croissant.png" alt=""
          initial={{ opacity: 0, x: -80, rotate: -15 }} animate={{ opacity: 0.16, x: 0, rotate: -12 }}
          transition={{ duration: 1.8 }}
          className="absolute left-[3%] top-[22%] w-44 hidden lg:block z-0 drop-shadow-2xl pointer-events-none"
        />
        <motion.img src="/cake.png" alt=""
          initial={{ opacity: 0, x: 80, rotate: 10 }} animate={{ opacity: 0.16, x: 0, rotate: 8 }}
          transition={{ duration: 1.8, delay: 0.2 }}
          className="absolute right-[3%] bottom-[22%] w-48 hidden lg:block z-0 drop-shadow-2xl pointer-events-none"
        />
        <motion.img src="/bread.png" alt=""
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 0.13, y: 0 }}
          transition={{ duration: 2, delay: 0.4 }}
          className="absolute right-[8%] top-[14%] w-36 hidden xl:block z-0 drop-shadow-2xl pointer-events-none"
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-32 pb-24">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#D4A373]/20 backdrop-blur-sm border border-[#D4A373]/40 text-[#F5ECD7] text-xs font-bold tracking-[0.35em] uppercase px-5 py-2 rounded-full mb-8"
          >
            <span className="w-1.5 h-1.5 bg-[#D4A373] rounded-full animate-pulse" />
            Est. 1984 · Our Story
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }}
            className="font-playfair text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.05] tracking-tight mb-7"
          >
            Baked with<br />
            <span className="text-[#D4A373]">Heart</span>
            <span className="text-white">, Served</span><br />
            <span className="text-[#F5ECD7]/75 italic font-light">with Soul.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }}
            className="text-[#F5ECD7]/70 text-xl max-w-2xl mx-auto leading-relaxed font-light mb-12"
          >
            For over 40 years, Hangary Sweet has been the heartbeat of this community —
            one loaf, one croissant, one celebration cake at a time.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.75 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/menu"
              className="group bg-[#D4A373] hover:bg-[#E8C49A] text-[#2C1810] px-9 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center gap-2 no-underline"
            >
              Explore Our Menu
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#story"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white px-9 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 no-underline"
            >
              Read Our Story ↓
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div variants={stagger} initial="hidden" animate="show" transition={{ delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-20"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp}
                className="bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-2xl py-5 px-4 hover:bg-white/15 transition-all duration-300 cursor-default group"
              >
                <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div className="font-playfair text-3xl md:text-4xl font-bold text-[#D4A373] leading-none">{s.value}</div>
                <div className="text-[#F5ECD7]/55 text-[0.65rem] font-semibold mt-1.5 tracking-widest uppercase">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/35"
        >
          <span className="text-[0.6rem] tracking-widest uppercase font-medium">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/35 to-transparent" />
        </motion.div>
      </section>

      {/* ══ ORIGIN STORY ══ */}
      <section id="story" className="py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Visual side */}
            <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                <img src="/about-baker.png" alt="Margaret Howell - Founder" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#2C1810]/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-playfair text-lg font-bold">Margaret Howell</p>
                  <p className="text-[#D4A373] text-xs tracking-widest uppercase font-semibold mt-0.5">Founder, since 1984</p>
                </div>
              </div>
              {/* Accent cards */}
              <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -6 }} whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -top-7 -left-7 bg-[#3E2723] rounded-2xl px-6 py-5 shadow-2xl"
              >
                <div className="font-playfair text-4xl font-bold text-[#D4A373]">40+</div>
                <div className="text-[#F5ECD7]/70 text-[0.65rem] font-bold tracking-widest uppercase mt-0.5">Years of Craft</div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 6 }} whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-7 -right-7 bg-[#D4A373] rounded-2xl px-6 py-5 shadow-2xl"
              >
                <div className="font-playfair text-4xl font-bold text-[#2C1810]">50K+</div>
                <div className="text-[#2C1810]/70 text-[0.65rem] font-bold tracking-widest uppercase mt-0.5">Happy Customers</div>
              </motion.div>
              {/* Small floating image */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }}
                className="absolute top-1/2 -right-10 -translate-y-1/2 w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden lg:block"
              >
                <img src="/croissant.png" alt="Croissant" className="w-full h-full object-cover" />
              </motion.div>
              {/* Decorative rings */}
              <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full border-2 border-[#D4A373]/20 -z-10" />
              <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full border-2 border-[#3E2723]/10 -z-10" />
            </motion.div>

            {/* Text side */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 text-[#D4A373] text-xs font-bold tracking-[0.3em] uppercase mb-4">
                  <span className="h-px w-8 bg-[#D4A373]" /> How It All Began
                </span>
                <h2 className="font-playfair text-5xl md:text-6xl font-bold text-[#3E2723] leading-[1.1] mb-8">
                  A Kitchen,<br />A Dream, &<br />
                  <span className="text-[#D4A373] italic">A Wooden Spoon.</span>
                </h2>
              </motion.div>
              <motion.p variants={fadeUp} className="text-[#7A5C4F] leading-[1.95] mb-5 text-base">
                In 1984, Margaret Howell started baking bread in her tiny kitchen on Elm Street. She had no commercial equipment, no business plan — just a passion for honest, wholesome food and a wooden spoon that she still keeps on display in our bakery today.
              </motion.p>
              <motion.p variants={fadeUp} className="text-[#7A5C4F] leading-[1.95] mb-5 text-base">
                Word spread fast. Neighbours would knock on her door at 7 AM asking for another loaf. Within a year, Margaret quit her office job and opened Hangary Sweet's first proper location on Market Street. The queue on opening day stretched around the block.
              </motion.p>
              <motion.p variants={fadeUp} className="text-[#7A5C4F] leading-[1.95] mb-10 text-base">
                Today, Hangary Sweet is a multi-award-winning bakery serving over 500 customers daily. But our values haven't changed — the same family recipes, the same locally sourced ingredients, the same dedication to making every single item as perfect as it can be.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col gap-3.5 mb-10">
                {[
                  "Locally sourced flour & dairy from within 50km",
                  "No artificial flavours, colours, or preservatives",
                  "Hand-shaped, slow-fermented sourdough doughs",
                  "Family recipes passed down for 4 generations",
                  "Fresh-baked daily — nothing stored overnight",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[#3E2723] text-sm font-medium">
                    <div className="w-5 h-5 bg-[#D4A373]/15 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 size={13} className="text-[#D4A373]" />
                    </div>
                    {item}
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp}>
                <blockquote className="border-l-4 border-[#D4A373] pl-6 italic text-[#7A5C4F] text-base leading-[1.9]">
                  "I never wanted to run a bakery. I just wanted to feed people food that was honest and made with love. Everything else followed naturally."
                  <footer className="mt-3 not-italic font-bold text-[#3E2723] text-sm">— Margaret Howell, Founder</footer>
                </blockquote>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ OUR VALUES ══ */}
      <section className="py-28 bg-[#FAF6E6]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-[#D4A373] text-xs font-bold tracking-[0.3em] uppercase mb-4">
              <span className="h-px w-8 bg-[#D4A373]" /> What We Stand For <span className="h-px w-8 bg-[#D4A373]" />
            </span>
            <h2 className="font-playfair text-5xl md:text-6xl font-bold text-[#3E2723] mb-4">Our Core Values</h2>
            <p className="text-[#8D6E63] text-lg max-w-xl mx-auto leading-relaxed">
              Everything we do is guided by a simple belief — that good food, made honestly, changes lives.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {values.map((v) => (
              <motion.div key={v.title} variants={fadeUp}
                style={{ borderColor: v.border, backgroundColor: v.bg }}
                className="rounded-2xl border-2 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: v.accent + "18", color: v.accent }}
                >
                  {v.icon}
                </div>
                <h3 className="font-playfair text-xl font-bold mb-3" style={{ color: v.accent }}>{v.title}</h3>
                <p className="text-sm leading-[1.85] text-[#5C4033]">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ BAKING PROCESS ══ */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[#D4A373] text-xs font-bold tracking-[0.3em] uppercase mb-3 block">A Day in Our Bakery</span>
            <h2 className="font-playfair text-5xl md:text-6xl font-bold text-[#3E2723]">From Oven to Table</h2>
            <p className="text-[#8D6E63] mt-4 max-w-xl mx-auto text-lg leading-relaxed">
              What happens before the doors open at 7 AM? A lot. Here's a peek behind the scenes.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#E8DDD3] rounded-3xl overflow-hidden shadow-lg"
          >
            {[
              { time: "3:00 AM", action: "Bakers Arrive",  desc: "Ovens fired up, doughs shaped, sourdoughs scored by hand.", icon: Moon,         step: "01", iconColor: "#6366F1", iconBg: "#EEF2FF" },
              { time: "5:00 AM", action: "First Bake",     desc: "Croissants, loaves, and rolls go into stone-deck ovens.",   icon: Thermometer,  step: "02", iconColor: "#EA580C", iconBg: "#FFF7ED" },
              { time: "6:30 AM", action: "Quality Check",  desc: "Every item tasted, weighed, and inspected before display.", icon: BadgeCheck,   step: "03", iconColor: "#16A34A", iconBg: "#F0FDF4" },
              { time: "7:00 AM", action: "Doors Open",     desc: "Fresh aroma fills the street. The queues form. Every day.", icon: DoorOpen,     step: "04", iconColor: "#D4A373", iconBg: "#FDF8F0" },
            ].map((step, i) => (
              <motion.div key={step.step} variants={fadeUp}
                className={`relative p-8 ${i % 2 === 0 ? "bg-white" : "bg-[#FAF6E6]"} group hover:bg-[#3E2723] transition-colors duration-500 ${i < 3 ? "border-r border-[#E8DDD3]" : ""}`}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-white/15 group-hover:scale-110"
                  style={{ backgroundColor: step.iconBg, color: step.iconColor }}
                >
                  <step.icon size={28} strokeWidth={1.8} />
                </div>
                <div className="font-bold text-[#D4A373] text-xs tracking-widest uppercase mb-1">{step.step}</div>
                <div className="font-playfair text-2xl font-bold text-[#3E2723] group-hover:text-[#D4A373] transition-colors mb-1">{step.action}</div>
                <div className="text-xs font-bold tracking-widest text-[#8D6E63] group-hover:text-[#F5ECD7]/60 mb-4 uppercase transition-colors">{step.time}</div>
                <p className="text-sm text-[#7A5C4F] leading-[1.8] group-hover:text-[#F5ECD7]/75 transition-colors">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ TEAM ══ */}
      <section className="py-28 bg-[#FAF6E6]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[#D4A373] text-xs font-bold tracking-[0.3em] uppercase mb-3 block">The People Behind the Magic</span>
            <h2 className="font-playfair text-5xl md:text-6xl font-bold text-[#3E2723]">Meet Our Team</h2>
            <p className="text-[#8D6E63] mt-4 max-w-xl mx-auto text-lg leading-relaxed">
              Every great bakery is built on passionate people. These are the talented humans who make Hangary Sweet extraordinary.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member) => (
              <motion.div key={member.name} variants={fadeUp}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E8DDD3] hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
              >
                <div className="relative h-56 overflow-hidden bg-[#F5ECD7]">
                  <img src={member.img} alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                    {[Instagram, Twitter, Facebook].map((Icon, j) => (
                      <a key={j} href="#"
                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-[#3E2723] hover:bg-[#D4A373] transition-colors"
                      >
                        <Icon size={14} />
                      </a>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <span className={`inline-block text-[0.6rem] font-bold px-2.5 py-1 rounded-full ${member.badgeBg} mb-3`}>
                    {member.badge}
                  </span>
                  <h3 className="font-playfair text-xl font-bold text-[#3E2723] leading-tight">{member.name}</h3>
                  <p className="text-xs font-bold tracking-widest text-[#D4A373] uppercase mt-1 mb-4">{member.role}</p>
                  <div className="relative mb-4 pl-4 border-l-2 border-[#D4A373]/40">
                    <p className="text-xs italic text-[#8D6E63] leading-[1.8]">"{member.quote}"</p>
                  </div>
                  <p className="text-xs text-[#7A5C4F] leading-[1.85]">{member.desc}</p>
                  <div className="mt-4 pt-4 border-t border-[#E8DDD3] flex items-center justify-between">
                    <span className="text-[0.65rem] text-[#8D6E63] font-medium">{member.since}</span>
                    <ChefHat size={14} className="text-[#D4A373]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ TIMELINE ══ */}
      <section className="py-28 bg-[#FAF6E6] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4A373]/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E11D48]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-[#D4A373] text-xs font-bold tracking-[0.3em] uppercase mb-4">
              <span className="h-px w-8 bg-[#D4A373]" /> 40 Years in the Making <span className="h-px w-8 bg-[#D4A373]" />
            </span>
            <h2 className="font-playfair text-5xl md:text-6xl font-bold text-[#3E2723]">Our Journey</h2>
            <p className="text-[#8D6E63] mt-4 text-lg max-w-xl mx-auto leading-relaxed">
              Every great bakery has a story. Here's ours — told one milestone at a time.
            </p>
          </motion.div>

          {/* Timeline grid */}
          <div className="relative">
            {/* Vertical centre line (desktop) */}
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4A373]/40 to-transparent hidden lg:block" />

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8"
            >
              {milestones.map((m, i) => (
                <motion.div key={m.year} variants={fadeUp}
                  className={`flex gap-5 items-start group ${i % 2 === 0 ? "lg:flex-row lg:pr-12" : "lg:flex-row-reverse lg:pl-12 lg:mt-16"}`}
                >
                  {/* Icon bubble */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: m.iconBg, color: m.iconColor }}
                    >
                      <m.icon size={26} strokeWidth={1.8} />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-2xl border border-[#E8DDD3] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group-hover:border-[#D4A373]/50">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="font-playfair text-3xl font-bold leading-none"
                        style={{ color: m.iconColor }}
                      >
                        {m.year}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-[#E8DDD3] to-transparent" />
                    </div>
                    <p className="text-[#5C4033] text-sm leading-[1.9]">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-28 bg-[#FAF6E6]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[#D4A373] text-xs font-bold tracking-[0.3em] uppercase mb-3 block">What Our Customers Say</span>
            <h2 className="font-playfair text-5xl md:text-6xl font-bold text-[#3E2723]">Loved by Thousands</h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp}
                className="bg-white rounded-3xl p-8 border border-[#E8DDD3] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative"
              >
                <Quote size={40} className="text-[#D4A373]/20 absolute top-6 right-6" />
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={16} className="fill-[#D4A373] text-[#D4A373]" />
                  ))}
                </div>
                <p className="text-[#5C4033] text-base leading-[1.9] mb-7 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.bg} rounded-full flex items-center justify-center font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-[#3E2723] text-sm">{t.name}</p>
                    <p className="text-xs text-[#8D6E63]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ VISIT US ══ */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-3">
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                <span className="text-[#D4A373] text-xs font-bold tracking-[0.3em] uppercase mb-3 block">Come Say Hello</span>
                <h2 className="font-playfair text-5xl md:text-6xl font-bold text-[#3E2723]">Visit Us</h2>
                <p className="text-[#8D6E63] mt-4 text-lg leading-relaxed max-w-lg">
                  We'd love to see you in person. Pull up a chair, smell the bread baking, and let us create something special for you.
                </p>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-5"
              >
                {[
                  { icon: <MapPin size={22} />, title: "Find Us",  lines: ["12 Market Street", "Old Town District", "City Centre, SW1 4AB"], iconBg: "bg-rose-100 text-rose-600",   border: "border-rose-100"  },
                  { icon: <Clock size={22} />,  title: "Hours",    lines: ["Mon–Fri: 7AM – 7PM", "Saturday: 7AM – 5PM", "Sunday: 8AM – 3PM"], iconBg: "bg-amber-100 text-amber-600", border: "border-amber-100" },
                  { icon: <Phone size={22} />,  title: "Contact",  lines: ["+1 (555) 123-4567", "hello@Hangary Sweet.com", "@Hangary Sweet"],          iconBg: "bg-blue-100 text-blue-600",   border: "border-blue-100"  },
                ].map((card) => (
                  <motion.div key={card.title} variants={fadeUp}
                    className={`bg-[#FAF6E6] border-2 ${card.border} rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}
                  >
                    <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4`}>{card.icon}</div>
                    <h3 className="font-playfair text-lg font-bold text-[#3E2723] mb-3">{card.title}</h3>
                    {card.lines.map((line) => (
                      <p key={line} className="text-[#7A5C4F] text-sm leading-[2.1]">{line}</p>
                    ))}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-2 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="/about-baker.png" alt="Visit our bakery" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/65 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-playfair text-xl font-bold text-white mb-1">Come taste the difference.</p>
                  <p className="text-[#F5ECD7]/70 text-sm">Freshly baked every morning at 7 AM.</p>
                </div>
              </div>
              <motion.div animate={{ rotate: [0, 5, -5, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-5 -right-5 bg-[#D4A373] w-24 h-24 rounded-full flex flex-col items-center justify-center text-center shadow-2xl"
              >
                <span className="text-[0.55rem] font-bold tracking-widest text-[#2C1810] uppercase leading-tight">Fresh</span>
                <span className="font-playfair text-2xl font-bold text-[#2C1810]">Daily</span>
                <span className="text-[0.55rem] font-bold tracking-widest text-[#2C1810] uppercase">7:00 AM</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="relative py-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1A0E08]/82" />
        </div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#D4A373]/10 rounded-full blur-[80px] z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#F5ECD7]/8 rounded-full blur-[80px] z-0" />

        <motion.img src="/cake.png" alt="" animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[5%] top-1/2 -translate-y-1/2 w-40 opacity-20 hidden lg:block pointer-events-none"
        />
        <motion.img src="/croissant.png" alt="" animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-[5%] top-1/2 -translate-y-1/2 w-40 opacity-20 hidden lg:block pointer-events-none"
        />

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        >
          <div className="text-6xl mb-6">🎂</div>
          <h2 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
            Ready to Taste<br />
            <span className="text-[#D4A373] italic font-light">the Difference?</span>
          </h2>
          <p className="text-white/65 text-xl leading-relaxed mb-12 font-light">
            Browse our full menu or let us create something extraordinary just for you.
            Life's too short for ordinary bakes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu"
              className="group bg-[#D4A373] hover:bg-[#E8C49A] text-[#2C1810] px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center gap-2 no-underline"
            >
              Browse Our Menu
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/customize-order"
              className="group bg-white/10 hover:bg-white/20 border border-white/25 text-white px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 no-underline backdrop-blur-sm"
            >
              Customize Order
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-5 mt-14">
            {["🏆 Best Artisan Bakery 2024", "🌿 100% Natural Ingredients", "🎂 50,000+ Happy Customers"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-5 py-2.5">
                <span className="text-white/80 text-xs font-semibold tracking-wide">{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <FooterSection />
    </div>
  );
}
