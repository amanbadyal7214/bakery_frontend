import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, Calendar, MapPin, Music, Gift, Star, Sparkles, Instagram, Volume2, VolumeX, Music2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/home/FooterSection";
import daman from "@/assets/girl.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import BirthdayLoader from "@/components/BirthdayLoader";
import birthdaySong from "@/assets/nastelbom-happy-birthday-471481.mp3";

const memories = [
  "/bestie1.png",
  "/bestie2.png",
  "/bestie3.png",
  "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535141123063-3bb615822649?q=80&w=2069&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop",
  "/birthday.png",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop",
  "/bestie1.png",
];
const musicNotes = [Music, Music2, Heart, Star, Sparkles];

export default function Events() {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => {
    const a = new Audio(birthdaySong);
    a.loop = true;
    return a;
  });

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
    };
    audio.addEventListener('error', handleError as any);
    return () => {
      audio.removeEventListener('error', handleError as any);
      audio.pause();
    };
  }, [audio]);

  const toggleMusic = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error("Playback failed:", e);
          // Try a fallback if anything goes wrong
          audio.src = "https://cdn.pixabay.com/audio/2022/11/22/audio_feb6866170.mp3";
          audio.play().then(() => setIsPlaying(true)).catch(err => console.error("Fallback failed:", err));
        });
    }
  };

  useEffect(() => {
    if (!loading) {
      // Confetti burst on load
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
          origin: { y: 0.7 },
          zIndex: 100,
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

      // Side Sprinklers (Fountain effect)
      const end = Date.now() + 3 * 1000;
      const colors = ["#D4A373", "#2C1810", "#FFFFFF"];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [loading]);

  if (loading) {
    return <BirthdayLoader onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#EBE3D5] selection:bg-black selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="relative pt-16 pb-32 px-4 md:px-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[#2C1810]/60 hover:text-[#2C1810] transition-colors mb-6 group"
        >
          <div className="p-2 rounded-full border border-[#2C1810]/10 group-hover:bg-[#2C1810] group-hover:text-white transition-all">
            <ChevronLeft size={16} />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase">Go Back</span>
        </Link>

        {/* The Dedication Layout */}
        <div className="max-w-7xl mx-auto relative mt-0">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12">
            
            {/* Left Side: Dedication Text */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-[#2C1810] rounded-full flex items-center justify-center text-white mb-8 mx-auto lg:mx-0 shadow-xl"
                >
                  <Heart size={32} fill="currentColor" />
                </motion.div>
                
                <h2 className={`font-playfair text-3xl md:text-4xl italic mb-2 transition-all duration-700 ${isPlaying ? 'text-[#D4A373] scale-110 drop-shadow-[0_0_15px_rgba(212,163,115,0.5)]' : 'text-[#2C1810]/60'}`}>Happy Birthday</h2>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#2C1810] tracking-tighter mb-8 leading-none"> 
                  <span className="relative inline-block">
                    Damanjeet Kaur Kang
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: isPlaying ? "120%" : "110%" }}
                      transition={{ 
                        width: { delay: 1.2, duration: 1 },
                        scale: isPlaying ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}
                      }}
                      className={`absolute -bottom-2 -left-[5%] h-3 -z-10 transition-colors duration-700 ${isPlaying ? 'bg-[#D4A373]' : 'bg-[#D4A373]/50'}`}
                    />
                  </span>
                </h1>

                <p className="text-[#2C1810]/70 text-xl md:text-2xl font-medium max-w-lg mb-8 italic">
                  "Wish you all the best!! 🖤🖤🖤"
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#2C1810] text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest shadow-2xl shadow-[#2C1810]/20 hover:bg-[#3E2723] transition-all"
                  >
                    SEND LOVE
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMusic}
                    className="w-14 h-14 rounded-full border-2 border-[#2C1810]/10 flex items-center justify-center text-[#2C1810] hover:bg-[#2C1810] hover:text-white transition-all shadow-lg bg-white/50 backdrop-blur-sm"
                  >
                    {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                  </motion.button>

                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#EBE3D5] overflow-hidden bg-white shadow-lg">
                        <img src={daman} alt="Friend" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Larger Photo (overlapping vibe) */}
            <div className="lg:w-1/2 relative group">
              <motion.div
                initial={{ opacity: 0, y: 100, rotate: 5 }}
                animate={{ opacity: 1, y: 0, rotate: 2 }}
                transition={{ delay: 0.8, duration: 1 }}
                whileHover={{ rotate: 0 }}
                className="relative z-20 w-fit mx-auto lg:ml-auto"
              >
                <div className="relative p-4 bg-white shadow-2xl rounded-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-700">
                  <div className="w-[300px] h-[400px] md:w-[400px] md:h-[550px] overflow-hidden rounded-xl relative">
                    <img 
                      src={daman} 
                      alt="Best Friends" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/40 to-transparent" />
                    
                    {/* Retro Badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-[0.6rem] font-black uppercase tracking-[0.2em]">
                      <Sparkles size={10} /> Moments
                    </div>
                  </div>
                </div>

                {/* Floating Heart Decorations (Hand-drawn look/vibe) */}
                <motion.div 
                  animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-10 -right-10 text-[#D4A373]"
                >
                  <Heart size={80} strokeWidth={1} />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-10 -left-10 text-[#2C1810]"
                >
                  <Heart size={60} strokeWidth={1} fill="currentColor" />
                </motion.div>
              </motion.div>

              {/* Decorative Element Behind */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-4 border-[#2C1810]/5 rounded-full -z-10 animate-pulse"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Birthday Celebration Info Section */}
      <section className="bg-white py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="font-playfair text-4xl font-bold text-[#2C1810] mb-4 underline decoration-[#D4A373]/30 underline-offset-8">Birthday Celebration Event</h3>
            <p className="text-[#2C1810]/60 uppercase tracking-[0.3em] text-xs font-black">August 12th, 2024 • 12:00 PM onwards</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-3xl bg-[#EBE3D5] flex items-center justify-center text-[#2C1810] mb-6 group-hover:bg-[#2C1810] group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                <Star size={32} />
              </div>
              <h4 className="font-playfair text-2xl font-bold mb-3">Red Carpet Entry</h4>
              <p className="text-[#2C1810]/70 leading-relaxed">Join us for a glamorous entrance at the main bakery lounge with specialized photo ops.</p>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-3xl bg-[#EBE3D5] flex items-center justify-center text-[#2C1810] mb-6 group-hover:bg-[#2C1810] group-hover:text-white transition-all duration-500 transform group-hover:-rotate-12">
                <Gift size={32} />
              </div>
              <h4 className="font-playfair text-2xl font-bold mb-3">Bespoke Gifting</h4>
              <p className="text-[#2C1810]/70 leading-relaxed">Customized gift boxes for all attendees featuring our founder's favorite treats.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-3xl bg-[#EBE3D5] flex items-center justify-center text-[#2C1810] mb-6 group-hover:bg-[#2C1810] group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                <Music size={32} />
              </div>
              <h4 className="font-playfair text-2xl font-bold mb-3">The After Party</h4>
              <p className="text-[#2C1810]/70 leading-relaxed">Live acoustic band performing until midnight with signature mocktails and dessert bar.</p>
            </div>
          </div>
          
          <div className="mt-20 p-12 bg-[#2C1810] rounded-[3rem] text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="font-playfair text-4xl md:text-5xl text-white font-bold mb-6">Want to Book a Similar Event?</h2>
              <p className="text-white/60 mb-10 max-w-2xl mx-auto">We specialize in making your special days unforgettable. From intimate birthday dinners to grand celebrations.</p>
              <button className="bg-[#D4A373] text-[#2C1810] px-12 py-4 rounded-full font-bold text-sm tracking-widest hover:bg-white hover:scale-110 transition-all duration-500">
                GET IN TOUCH
              </button>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />

      {/* Rhythmic Music Animations */}
      <AnimatePresence>
        {isPlaying && (
          <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {[...Array(15)].map((_, i) => {
              const Icon = musicNotes[i % musicNotes.length];
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    y: "110vh", 
                    x: `${Math.random() * 100}vw`,
                    scale: 0.5,
                    rotate: 0 
                  }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    y: "-10vh",
                    x: `${(Math.random() * 100) + (Math.sin(i) * 20)}vw`,
                    scale: [0.5, 1.2, 0.8],
                    rotate: 360 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "linear"
                  }}
                  className="absolute text-[#D4A373]/40"
                >
                  <Icon size={Math.random() * 20 + 20} fill={i % 2 === 0 ? "currentColor" : "none"} />
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
