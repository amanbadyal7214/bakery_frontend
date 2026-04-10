import { useProductActions } from "./home-data";
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import cake1 from "../../assets/cake1.png";
import cake2 from "../../assets/cake 2.png";
import cake3 from "../../assets/cake 3.png";
import cake4 from "../../assets/cake 4.png";
import cake5 from "../../assets/cake 5.png";
import cake6 from "../../assets/cake 6.png";
import cake7 from "../../assets/cake 7.png";
import hangryImg from "../../assets/Hangry.png";
import sweetImg from "../../assets/sweet.png";

const cakeImages = [cake1, cake2, cake3, cake4, cake5, cake6, cake7];

// Preload all images once so they are cached by the browser
const preloadedImages: HTMLImageElement[] = [...cakeImages, hangryImg, sweetImg].map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

export default function HeroSection() {
  const { scrollTo } = useProductActions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const [showBlast, setShowBlast] = useState(false);

  // Animation controls
  const hangryControls = useAnimation();
  const sweetControls = useAnimation();
  const restControls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload logic
  useEffect(() => {
    let loaded = 0;
    preloadedImages.forEach((img) => {
      if (img.complete) {
        loaded++;
        if (loaded === preloadedImages.length) setImagesReady(true);
      } else {
        img.onload = () => {
          loaded++;
          if (loaded === preloadedImages.length) setImagesReady(true);
        };
      }
    });
  }, []);

  // Slideshow logic
  useEffect(() => {
    if (!imagesReady) return;
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setDisplayIndex((prev) => (prev + 1) % cakeImages.length);
        setCurrentIndex((prev) => (prev + 1) % cakeImages.length);
        setAnimating(false);
      }, 700);
    }, 7000);
    return () => clearInterval(interval);
  }, [imagesReady]);

  // The "IMAGE WOW" Entry Animation Sequence
  useEffect(() => {
    const runAnimation = async () => {
      // 1. Initial State - Starting precisely from the Top-Left Navbar Logo position
      await Promise.all([
        hangryControls.set({
          x: "-50vw", y: "-50vh", opacity: 0, scale: 0.1, rotate: -90, filter: "brightness(2)"
        }),
        sweetControls.set({
          x: "-50vw", y: "-50vh", opacity: 0, scale: 0.1, rotate: -90, filter: "brightness(2)"
        }),
        restControls.set({ opacity: 0, y: 30, filter: "blur(12px)" })
      ]);

      // 2. Flight In - Sequential (One by One) - Snappier
      await hangryControls.start({
        x: 0, y: 0, opacity: 1, scale: 1, rotate: 0, filter: "brightness(1)",
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
      });

      await new Promise(r => setTimeout(r, 200));

      await sweetControls.start({
        x: 0, y: 0, opacity: 1, scale: 1, rotate: 0, filter: "brightness(1)",
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
      });

      await new Promise(r => setTimeout(r, 300));

      // 3. Meet in Center - Fast Side-by-Side Merge
      await Promise.all([
        hangryControls.start({
          x: "115%", 
          y: 0,
          rotate: 0,
          scale: 1.05,
          transition: { duration: 0.6, ease: [0.6, 0.05, 0.1, 0.9] }
        }),
        sweetControls.start({
          x: "-115%", 
          y: 0,
          rotate: 0,
          scale: 1.05,
          transition: { duration: 0.6, ease: [0.6, 0.05, 0.1, 0.9] }
        })
      ]);

      // 4. THE BLAST
      setShowBlast(true);
      await Promise.all([
        hangryControls.start({
          scale: 1.3,
          filter: "brightness(1.5)",
          transition: { duration: 0.2, ease: "easeOut" }
        }),
        sweetControls.start({
          scale: 1.3,
          filter: "brightness(1.5)",
          transition: { duration: 0.2, ease: "easeOut" }
        })
      ]);

      await new Promise(r => setTimeout(r, 400));
      setShowBlast(false);

      // 5. Final Banner Reveal - Snappy Settlement
      await Promise.all([
        hangryControls.start({
          x: 0, scale: 1, rotate: 0, filter: "brightness(1)",
          transition: { 
            duration: 0.8, ease: [0.175, 0.885, 0.32, 1.2] 
          } 
        }),
        sweetControls.start({
          x: 0, scale: 1, rotate: 0, filter: "brightness(1)",
          transition: { 
            duration: 0.8, ease: [0.175, 0.885, 0.32, 1.2] 
          }
        }),
        restControls.start({
          opacity: 1, y: 0, filter: "blur(0px)",
          transition: { duration: 0.8, ease: "easeOut" }
        })
      ]);
    };

    runAnimation();
  }, [hangryControls, sweetControls, restControls]);

  return (
    <section id="home" ref={containerRef} className="relative min-h-screen bg-parchment flex flex-col justify-center overflow-hidden pt-[72px]">

      {/* Dynamic Blast Effect */}
      <AnimatePresence>
        {showBlast && (
          <motion.div
            initial={{ scale: 0, opacity: 1, filter: "blur(0px)" }}
            animate={{ scale: 10, opacity: 0, filter: "blur(40px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-gold/50 via-white to-gold/50 rounded-full z-[35] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Watermark */}
      <motion.div
        animate={restControls}
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] font-playfair font-extrabold tracking-widest text-navy/[0.04] whitespace-nowrap select-none pointer-events-none"
        style={{ fontSize: "clamp(6rem, 16vw, 16rem)" }}
      >
        BAKERY
      </motion.div>

      {/* Stamp */}
      <motion.div
        animate={restControls}
        aria-hidden="true"
        className="absolute top-[18%] right-[8%] w-28 h-28 animate-spin-slow hidden md:block"
      >
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <defs>
            <path id="sc" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
          </defs>
          <text fontSize="11" letterSpacing="3.5" fill="#1A2744" fontFamily="Inter,sans-serif">
            <textPath href="#sc">HANGRY • SWEET • EST.2024 •</textPath>
          </text>
          <text x="60" y="57" textAnchor="middle" fill="#1A2744" fontFamily="Playfair Display,serif" fontWeight="700" fontSize="9" letterSpacing="2">HANGRY?</text>
          <text x="60" y="70" textAnchor="middle" fill="#1A2744" fontFamily="Playfair Display,serif" fontWeight="700" fontSize="9" letterSpacing="2">SWEET.</text>
        </svg>
      </motion.div>

      {/* Title row */}
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-6 md:px-12 py-8">
        <h1 className="flex items-center justify-between w-full gap-4 leading-none m-0">

          {/* Left word image */}
          <motion.img
            animate={hangryControls}
            src={hangryImg}
            alt="Hangry?"
            className="w-[clamp(180px,28vw,370px)] h-auto object-contain flex-shrink-0 self-start mt-6 relative z-40 drop-shadow-xl"
          />

          {/* Centre images */}
          <motion.div
            animate={restControls}
            className="relative flex-1 flex items-center justify-center p-4"
            style={{ height: "clamp(300px, 44vw, 500px)" }}
            aria-hidden="true"
          >
            {/* Main centre item */}
            {cakeImages.map((src, i) => {
              const isActive = i === displayIndex;
              return (
                <img
                  key={i}
                  src={src}
                  alt={`Cake ${i + 1}`}
                  className="absolute object-contain drop-shadow-2xl pointer-events-none mix-blend-multiply"
                  style={{
                    width: "clamp(350px,45vw,700px)",
                    top: "50%",
                    left: "50%",
                    opacity: isActive ? (animating ? 0 : 1) : 0,
                    filter: isActive ? (animating ? "blur(8px)" : "blur(0px)") : "blur(4px)",
                    transform: isActive
                      ? animating
                        ? "translate(-50%, -45%) scale(0.95)"
                        : "translate(-50%, -50%) scale(1.05)"
                      : "translate(-50%, -60%) scale(0.85)",
                    transition: isActive
                      ? animating
                        ? "opacity 0.4s ease-in, transform 0.4s ease-in, filter 0.4s ease-in"
                        : "opacity 0.6s cubic-bezier(0.34,1.56,0.64,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1), filter 0.6s ease-out"
                      : "opacity 0.4s ease-in, transform 0.4s ease-in, filter 0.4s ease-in",
                    zIndex: isActive ? 30 : 20,
                    animation: isActive && !animating ? "floatBob 3s ease-in-out infinite" : "none",
                  }}
                />
              );
            })}

            <style>{`
              @keyframes floatBob {
                0%   { transform: translate(-50%, -50%) scale(1) translateY(0px); }
                50%  { transform: translate(-50%, -50%) scale(1) translateY(-14px); }
                100% { transform: translate(-50%, -50%) scale(1) translateY(0px); }
              }
            `}</style>
          </motion.div>

          {/* Right word image */}
          <motion.img
            animate={sweetControls}
            src={sweetImg}
            alt="Sweet."
            className="w-[clamp(180px,28vw,370px)] h-auto object-contain flex-shrink-0 self-end mb-6 relative z-40 drop-shadow-xl"
          />
        </h1>
      </div>

      {/* Bottom-left info card */}
      <motion.div
        animate={restControls}
        className="absolute bottom-[5%] left-[5%] z-20 bg-navy text-white rounded-xl p-4 hidden sm:flex items-center gap-4 max-w-sm shadow-2xl shadow-navy/40"
      >
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img src="/bread.png" alt="Organic bread" className="w-full h-full object-cover brightness-[0.65]" />
          <button
            className="absolute inset-0 flex items-center justify-center bg-white/15 hover:bg-white/28 border-none text-white text-lg cursor-pointer transition-colors"
            aria-label="Play video"
          >▶</button>
        </div>
        <div>
          <h3 className="font-playfair font-bold text-[0.95rem] m-0 mb-1 text-white">Natural Organic Product</h3>
          <p className="text-[0.75rem] text-white/65 m-0 mb-2 leading-relaxed">
            Baked fresh every morning from locally sourced, organic ingredients.
          </p>
          <button
            onClick={() => scrollTo("About")}
            className="bg-transparent border-none text-gold text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer p-0 hover:opacity-75 transition-opacity"
          >
            READ MORE →
          </button>
        </div>
      </motion.div>

      {/* Scroll arrow */}
      <motion.button
        animate={restControls}
        onClick={() => scrollTo("Menu")}
        aria-label="Scroll down"
        className="absolute bottom-[5%] right-[5%] z-20 w-12 h-12 bg-navy text-white rounded-xl text-xl flex items-center justify-center border-none cursor-pointer shadow-xl shadow-navy/30 hover:bg-navy-lt hover:-translate-y-1 transition-all"
      >
        ↓
      </motion.button>
    </section>
  );
}
