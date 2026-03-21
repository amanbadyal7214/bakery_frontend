import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/home/FooterSection";
import { X, ChevronLeft, ChevronRight, ArrowRight, Star } from "lucide-react";
import cakeJpg      from "../assets/cake.jpg";
import chocolateJpg from "../assets/choclate.jpg";
import pastryJpg    from "../assets/pastery.jpg";
import doJpg        from "../assets/DO.jpg";
import GEpng        from "../assets/GE.png";
import { api } from "@/services/api";

/* ─────────────────── types ─────────────────── */
interface GalleryItem {
  id: number | string;
  _id?: string;
  imgBase64?: string;
  src?: string;
  alt?: string;
  category?: string;
  title?: string;
  desc?: string;
  badge?: string;
  price?: string;
}

/* ─────────────────── data ──────────────────── */
const galleryItems: GalleryItem[] = [
  { id: 1,  src: "/cake.png",        alt: "Strawberry Dream Cake",  category: "Cakes",              title: "Strawberry Dream Cake",    desc: "Handcrafted with fresh strawberries & Belgian cream",        badge: "Bestseller", price: "$28" },
  { id: 2,  src: "/croissant.png",   alt: "Butter Croissants",      category: "Pastries",           title: "Golden Butter Croissants", desc: "72 flaky layers of pure French butter perfection",           badge: "Fresh",      price: "$3.50" },
  { id: 3,  src: "/bread.png",       alt: "Rustic Sourdough",       category: "Breads",             title: "Rustic Sourdough Loaf",    desc: "72-hour cold-fermented artisan sourdough",                  badge: "Artisan",    price: "$9" },
  { id: 4,  src: cakeJpg,            alt: "Blueberry Muffin",       category: "Muffins",            title: "Blueberry Morning Muffin", desc: "Bursting with wild blueberries, baked fresh daily",         badge: "New",        price: "$3" },
  { id: 5,  src: "/hero-bg.png",     alt: "Bakery Kitchen",         category: "Behind the Scenes",  title: "Our Craft Kitchen",        desc: "Where every morning magic begins at 3 AM",                               },
  { id: 6,  src: chocolateJpg,       alt: "Choco Chip Cookies",     category: "Cookies",            title: "Choco Chip Cookies",       desc: "Crispy edges, gooey warm centre — always irresistible",     badge: "Classic",    price: "$2.50" },
  { id: 7,  src: pastryJpg,          alt: "Cinnamon Swirl",         category: "Pastries",           title: "Cinnamon Swirl Roll",      desc: "Rolled in brown sugar, glazed with cream cheese drizzle",   badge: "Hot",        price: "$4" },
  { id: 8,  src: doJpg,              alt: "NY Cheesecake",          category: "Cakes",              title: "New York Cheesecake",      desc: "Velvety smooth, baked slow on a buttery graham crust",      badge: "Creamy",     price: "$5" },
  { id: 9,  src: "/about-baker.png", alt: "Baker at work",          category: "Behind the Scenes",  title: "Artisan at Work",          desc: "Passion dusted in flour — our baker every sunrise",                      },
  { id: 10, src: GEpng,              alt: "Chef's Special Pastry",  category: "Pastries",           title: "Chef's Seasonal Special",  desc: "A limited creation with seasonal fruits & florals",         badge: "Limited",    price: "$6" },
  { id: 11, src: "/cake.png",        alt: "Custom Birthday Cake",   category: "Cakes",              title: "Custom Birthday Cake",     desc: "Personalised cakes designed just the way you dream",        badge: "Custom",     price: "$35" },
  { id: 12, src: "/croissant.png",   alt: "Almond Croissant",       category: "Pastries",           title: "Almond Croissant",         desc: "Twice-baked with almond cream & toasted flake topping",     badge: "Popular",    price: "$4.50" },
];

const CATEGORIES = ["All", "Cakes", "Pastries", "Breads", "Cookies", "Muffins", "Behind the Scenes"];

/* ─────────────────── framer variants ──────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

const cardV = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: EASE, delay: i * 0.07 },
  }),
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

/* ═══════════════════════════════════════════════════════ */
export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightbox,     setLightbox]     = useState<number | string | null>(null);
  // use items state fetched from backend; start with static seed
  const [items, setItems] = useState<GalleryItem[]>(galleryItems);
  const objectUrlsRef = useRef<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchItems = async () => {
      try {
        const res = await api.gallery.getAll() as any;
        const data = Array.isArray(res) ? res : (res && (res.data || res)) || [];

        // revoke previously created URLs
        objectUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { /* ignore revoke error */ } });
        objectUrlsRef.current = [];

        const normalized = (data as unknown[]).map(itRaw => {
          const it = itRaw as Record<string, unknown>;
          const id = (it._id as string) || (it.id as string) || Math.random().toString();

          // prefer imgBase64 field when backend provides full data URI or base64
          const imgBase64 = it.imgBase64 as unknown;
          const srcVal = it.src as unknown;
          let src: string | undefined;

          if (typeof imgBase64 === 'string' && imgBase64.trim()) {
            src = imgBase64;
            if (!src.startsWith('data:')) src = `data:image/png;base64,${src}`;
          } else if (typeof srcVal === 'string') {
            src = srcVal;
            if (!src.startsWith('data:') && !src.startsWith('/') && !src.startsWith('http')) {
              src = `data:image/png;base64,${src}`;
            }
          } else if (srcVal && typeof srcVal === 'object') {
            const maybe = srcVal as { data?: number[] };
            if (Array.isArray(maybe.data)) {
              try {
                const u8 = new Uint8Array(maybe.data);
                const blob = new Blob([u8], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                objectUrlsRef.current.push(url);
                src = url;
              } catch (e) { src = undefined; }
            }
          }

          return {
            id,
            _id: it._id as string | undefined,
            imgBase64: typeof imgBase64 === 'string' ? imgBase64 : undefined,
            src,
            alt: it.alt as string | undefined,
            category: it.category as string | undefined,
            title: it.title as string | undefined,
            desc: it.desc as string | undefined,
            badge: it.badge as string | undefined,
            price: it.price as string | undefined,
          } as GalleryItem;
        });

        if (mounted) setItems(normalized.length ? normalized : galleryItems);
      } catch (e) {
        // keep static fallback
        setItems(galleryItems);
      }
    };
    fetchItems();
    return () => {
      mounted = false;
      objectUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { /* ignore revoke error */ } });
      objectUrlsRef.current = [];
    };
  }, []);
  
  // compute category counts from current items and show only categories present
  const categoryCounts = items.reduce((acc: Record<string, number>, it) => {
    const c = (it.category || 'Misc') as string;
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const availableCategories = ['All', ...Object.keys(categoryCounts).filter(c => categoryCounts[c] > 0)];

  const filtered = activeFilter === "All" ? items : items.filter(i => i.category === activeFilter);
  const lbIdx  = lightbox !== null ? filtered.findIndex(i => i.id === lightbox) : -1;
  const lbItem = lbIdx !== -1 ? filtered[lbIdx] : null;

  const openLb  = useCallback((id: number | string) => setLightbox(id), []);
  const closeLb = useCallback(() => setLightbox(null), []);
  const prevLb  = () => lbIdx > 0 && setLightbox(filtered[lbIdx - 1].id);
  const nextLb  = () => lbIdx < filtered.length - 1 && setLightbox(filtered[lbIdx + 1].id);
  const handleLbKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft")  prevLb();
    if (e.key === "ArrowRight") nextLb();
    if (e.key === "Escape")     closeLb();
  };

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />

      {/* ══════ HERO — same watermark style as HeroSection ══════ */}
      <section className="relative bg-parchment pt-32 pb-16 overflow-hidden">
        {/* large watermark */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-playfair font-extrabold tracking-widest text-navy/[0.04] whitespace-nowrap select-none pointer-events-none"
          style={{ fontSize: "clamp(6rem,18vw,16rem)" }}
        >
          GALLERY
        </div>

        {/* spinning stamp — same as HeroSection */}
        <div aria-hidden className="absolute top-[10%] right-[6%] w-24 h-24 animate-spin-slow hidden md:block">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <path id="gc" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
            </defs>
            <text fontSize="11" letterSpacing="3.5" fill="#1A2744" fontFamily="Inter,sans-serif">
              <textPath href="#gc">Hangary? Sweet. • ARTISAN • EST.1984 •</textPath>
            </text>
            <text x="60" y="57" textAnchor="middle" fill="#1A2744" fontFamily="Playfair Display,serif" fontWeight="700" fontSize="9" letterSpacing="2">SWEET</text>
            <text x="60" y="70" textAnchor="middle" fill="#1A2744" fontFamily="Playfair Display,serif" fontWeight="700" fontSize="9" letterSpacing="2">BAKE</text>
          </svg>
        </div>

        {/* header — exact same pattern as MenuSection / AboutSection */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center max-w-2xl mx-auto px-6"
        >
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Our Gallery</p>
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-bread-dark mb-4 leading-tight">
            Baked with Love,<br />Shot with Pride
          </h1>
          <p className="text-[#7A5C4F] text-base leading-relaxed max-w-xl mx-auto">
            Every photo is a story of craft, warmth, and the irresistible aromas that fill our kitchen each morning.
          </p>
        </motion.div>

        {/* decorative dots — same as HeroSection seed dots */}
        <span className="absolute w-3 h-3 rounded-full bg-gold/50 top-[20%] left-[8%] hidden md:block" />
        <span className="absolute w-2 h-2 rounded-full bg-gold/40 top-[60%] left-[5%] hidden md:block" />
        <span className="absolute w-2 h-2 rounded-full bg-gold/50 bottom-[20%] right-[10%] hidden md:block" />
      </section>

      {/* ══════ FILTER BAR ══════ */}
      <div className="sticky top-[72px] z-30 bg-parchment/95 backdrop-blur-sm border-y border-gold/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(cat => {
              const count = cat === 'All' ? items.length : (categoryCounts[cat] || 0);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold tracking-[0.12em] uppercase transition-all duration-300 flex items-center gap-2 ${
                    activeFilter === cat
                      ? "bg-bread-brown text-white shadow-md shadow-bread-brown/20 ring-1 ring-bread-brown/30"
                      : "bg-white text-navy border border-gold/20 hover:border-bread-brown hover:text-bread-brown"
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-gold/80" />
                  {cat} {count > 0 ? <span className="text-xs opacity-80">({count})</span> : null}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#7A5C4F]">
            <span className="font-bold text-navy">{filtered.length}</span> item{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* ══════ GRID — same card style as MenuSection ══════ */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, idx) => (
              <motion.article
                key={item.id}
                layout
                custom={idx}
                variants={cardV}
                initial="hidden"
                animate="show"
                exit="exit"
                onClick={() => openLb(item.id)}
                className="group relative h-[420px] rounded-3xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-transparent hover:border-white/10"
              >
                {/* full-bleed background image */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a] via-[#3E2723]/40 to-transparent opacity-60" />

                {/* content — always visible with smooth transitions */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                  <div className="transform transition-all duration-300 translate-y-0">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex flex-col gap-1">
                        {item.badge && (
                          <span className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#D4A373] text-[#2C1810] text-[0.7rem] font-bold uppercase tracking-wider mb-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2C1810]" />
                            {item.badge}
                          </span>
                        )}
                        <h3 className="font-playfair text-xl font-bold leading-tight transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      {item.price && (
                        <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
                          {item.price}
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed mb-3 transition-opacity duration-300">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-3 transition-opacity duration-300">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className="text-gold fill-gold" />
                        ))}
                      </div>
                      <span className="text-white/70 text-xs">{item.category}</span>
                    </div>
                  </div>
                </div>
               </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="py-28 text-center"
          >
            <div className="text-5xl mb-4">🍰</div>
            <p className="font-playfair text-xl font-bold text-bread-dark">Nothing here yet</p>
            <p className="text-[#7A5C4F] text-sm mt-2">Try another category</p>
          </motion.div>
        )}
      </main>

      {/* ══════ CTA — same style as AboutSection button / CtaBanner ══════ */}
      <section className="bg-navy py-20 px-6 text-center relative overflow-hidden">
        {/* watermark */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-playfair font-extrabold text-white/[0.03] whitespace-nowrap pointer-events-none select-none"
          style={{ fontSize: "clamp(5rem,14vw,13rem)" }}
        >
          ORDER
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Order Today</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            See Something<br />You Love?
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-lg mx-auto">
            Every item here is available fresh. Walk in, order online, or customise it your way.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/menu")}
              className="inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#c49260] text-[#2C1810] font-bold px-8 py-3.5 rounded-full shadow-xl transition-all text-sm tracking-wide"
            >
              Explore Full Menu <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/customize-order")}
              className="inline-flex items-center gap-2 bg-transparent border border-white/30 hover:border-white/60 text-white font-bold px-8 py-3.5 rounded-full transition-all text-sm tracking-wide"
            >
              Customize Your Order
            </motion.button>
          </div>
        </div>
      </section>

      <FooterSection />

      {/* ════════════ LIGHTBOX ════════════ */}
      <AnimatePresence>
        {lightbox !== null && lbItem && (
          <motion.div
            key="lb"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#1a0f0a]/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLb}
            onKeyDown={handleLbKey}
            tabIndex={0}
          >
            <motion.div
              key={lbItem.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row bg-[#1a0f0a]"
            >
              {/* image */}
              <div className="relative flex-1 min-h-[280px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={lbItem.id}
                    src={lbItem.src} alt={lbItem.alt}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a]/40 to-transparent pointer-events-none" />

                {lbIdx > 0 && (
                  <button onClick={prevLb} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-[#C9952A] text-white flex items-center justify-center transition-colors backdrop-blur-sm">
                    <ChevronLeft size={20} />
                  </button>
                )}
                {lbIdx < filtered.length - 1 && (
                  <button onClick={nextLb} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-[#C9952A] text-white flex items-center justify-center transition-colors backdrop-blur-sm">
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {/* info panel */}
              <div className="md:w-64 p-7 flex flex-col justify-between shrink-0">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[0.65rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/30">
                      {lbItem.category}
                    </span>
                    {lbItem.badge && (
                      <span className="text-[0.65rem] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-[#D4A373] text-[#2C1810]">
                        {lbItem.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-playfair text-2xl font-bold text-white mb-2 leading-tight">{lbItem.title}</h3>
                  {lbItem.price && (
                    <p className="text-[#D4A373] font-bold text-lg mb-3">{lbItem.price}</p>
                  )}
                  <p className="text-white/55 text-sm leading-relaxed">{lbItem.desc}</p>

                  {/* dots */}
                  <div className="flex flex-wrap gap-1.5 mt-6">
                    {filtered.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(filtered[i].id)}
                        className={`rounded-full transition-all duration-200 ${i === lbIdx ? "w-5 h-2 bg-gold" : "w-2 h-2 bg-white/20 hover:bg-white/50"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { closeLb(); navigate("/menu"); }}
                    className="w-full bg-[#D4A373] hover:bg-[#c49260] text-[#2C1810] font-bold py-3 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Order Now <ArrowRight size={14} />
                  </motion.button>
                  <p className="text-center text-white/25 text-xs font-mono">{lbIdx + 1} / {filtered.length}</p>
                </div>
              </div>

              <button
                onClick={closeLb}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm z-10"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
