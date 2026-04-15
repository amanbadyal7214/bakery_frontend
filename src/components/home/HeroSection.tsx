import { useProductActions } from "./home-data";
import { useState, useEffect } from "react";
import cake1 from "../../assets/cake1.png";
import cake2 from "../../assets/cake 2.png";
import cake3 from "../../assets/cake 3.png";
import cake4 from "../../assets/cake 4.png";
import cake5 from "../../assets/cake 5.png";
import cake6 from "../../assets/cake 6.png";
import cake7 from "../../assets/cake 7.png";
import hangryImage from "../../assets/Hangry_22.png";
import sweetImage from "../../assets/sweetsa.png";

const cakeImages = [cake1, cake2, cake3, cake4, cake5, cake6, cake7];

// Preload all images once so they are cached by the browser
const preloadedImages: HTMLImageElement[] = cakeImages.map((src) => {
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

  // Wait until all images are fully loaded before starting the slideshow
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

  return (
    <section id="home" className="relative min-h-screen bg-parchment flex flex-col justify-center overflow-hidden pt-[72px]">
      {/* Watermark */}
      {/* <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] font-playfair font-bold tracking-widest text-[#D4A373]/[0.04] whitespace-nowrap select-none pointer-events-none"
        style={{ fontSize: "clamp(6rem, 16vw, 16rem)" }}
      >
        BAKERY
      </div> */}

      {/* Stamp */}
      <div aria-hidden="true" className="absolute top-[18%] right-[8%] w-28 h-28 animate-spin-slow hidden md:block">
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
      </div>

      {/* Title row */}
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-6 md:px-12 py-8">
        <h1 className="flex items-center justify-between w-full gap-4 leading-none m-0">

          {/* Left word */}
          <img
            src={hangryImage}
            alt="Hangry?"
            className="flex-shrink-0 self-start mt-12 animate-fade-up object-contain"
            style={{ height: "clamp(8rem, 12vw, 14rem)" }}
          />

          {/* Centre images */}
          <div
            className="relative flex-1 flex items-center justify-center"
            style={{ height: "clamp(400px, 55vw, 700px)" }}
            aria-hidden="true"
          >
            {/* Main centre item — all images stacked, only active one is visible */}
            {cakeImages.map((src, i) => {
              const isActive = i === displayIndex;
              return (
                <img
                  key={i}
                  src={src}
                  alt={`Cake ${i + 1}`}
                  className="absolute object-contain drop-shadow-2xl pointer-events-none mix-blend-multiply"
                  style={{
                    width: "clamp(350px,45vw,650px)",
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

            {/* Float bob keyframes */}
            <style>{`
              @keyframes floatBob {
                0%   { transform: translate(-50%, -50%) scale(1) translateY(0px); }
                50%  { transform: translate(-50%, -50%) scale(1) translateY(-14px); }
                100% { transform: translate(-50%, -50%) scale(1) translateY(0px); }
              }
            `}</style>

            {/* Seed dots */}
            <span className="absolute w-2.5 h-2.5 rounded-full bg-[#1A2744]/40" style={{ top: "20%", left: "22%" }} />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-[#1A2744]/40" style={{ top: "65%", left: "15%" }} />
            <span className="absolute w-3   h-3   rounded-full bg-[#1A2744]/25" style={{ bottom: "25%", right: "28%" }} />
            <span className="absolute w-2   h-2   rounded-full bg-[#1A2744]/40" style={{ top: "30%", right: "22%" }} />
          </div>

          {/* Right word */}
          <img
            src={sweetImage}
            alt="Sweet."
            className="flex-shrink-0 self-end mb-6 animate-fade-up object-contain"
            style={{ height: "clamp(8rem, 12vw, 14rem)", animationDelay: "0.2s" }}
          />
        </h1>
      </div>

      {/* Bottom-left info card */}
      <div className="absolute bottom-[5%] left-[5%] z-20 bg-[#D4A373] text-white rounded-xl p-4 hidden sm:flex items-center gap-4 max-w-sm shadow-2xl shadow-[#D4A373]/40 animate-fade-up">
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
            className="bg-transparent border-none text-gold text-[0.7rem] font-playfair tracking-widest uppercase cursor-pointer p-0 hover:opacity-75 transition-opacity"
          >
            READ MORE →
          </button>
        </div>
      </div>

      {/* Scroll arrow */}
      <button
        onClick={() => scrollTo("Menu")}
        aria-label="Scroll down"
        className="absolute bottom-[5%] right-[5%] z-20 w-12 h-12 bg-[#D4A373] text-white rounded-xl text-xl flex items-center justify-center border-none cursor-pointer shadow-xl shadow-[#D4A373]/30 hover:bg-[#D4A373]-lt hover:-translate-y-1 transition-all animate-bob"
      >
        ↓
      </button>
    </section>
  );
}
