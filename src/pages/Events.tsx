import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, Calendar, MapPin, Music, Gift, Star, Sparkles, Instagram, Volume2, VolumeX, Music2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/home/FooterSection";
import daman from "@/assets/WhatsApp Image 2026-04-11 at 16.29.18.jpeg";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import BirthdayLoader from "@/components/BirthdayLoader";
import birthdaySong from "@/assets/nastelbom-happy-birthday-471481.mp3";
import wa1 from "@/assets/WhatsApp Image 2026-04-11 at 15.45.52.jpeg";
import wa2 from "@/assets/WhatsApp Image 2026-04-11 at 15.46.32.jpeg";
import wa3 from "@/assets/WhatsApp Image 2026-04-11 at 15.50.00.jpeg";
import wa4 from "@/assets/CS1.png";
import wa5 from "@/assets/CS2.png";
import wa6 from "@/assets/CS3.png";
import wa7 from "@/assets/CS4.png";
import wa8 from "@/assets/girl.png";

import wa10 from "@/assets/WhatsApp Image 2026-04-11 at 16.30.01.jpeg";
import wa11 from "@/assets/WhatsApp Image 2026-04-11 at 16.58.54.jpeg";
import wa12 from "@/assets/cs5.png";



const memories = [
  { src: daman, rotate: "-2deg" },
  { src: wa10, rotate: "3deg" },
  { src: wa4, rotate: "-1deg" },

  { src: wa11, rotate: "1deg" },
  { src: wa12, rotate: "2deg" },
  { src: wa5, rotate: "2deg" },

  { src: wa6, rotate: "4deg" },
  { src: wa1, rotate: "-2deg" },
  { src: wa3, rotate: "3deg" },
  { src: wa2, rotate: "-1deg" },
  { src: wa7, rotate: "1deg" },
  { src: wa8, rotate: "-2deg" },
];
const musicNotes = [Music, Music2, Heart, Star, Sparkles];

export default function Events() {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWishes, setShowWishes] = useState(false);
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setCurrentMemoryIndex((prev) => (prev + 1) % memories.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [loading]);
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
      const attemptPlay = () => {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            removeListeners();
          })
          .catch(e => console.log("Autoplay waiting for interaction...", e));
      };

      const removeListeners = () => {
        window.removeEventListener('click', attemptPlay);
        window.removeEventListener('scroll', attemptPlay);
        window.removeEventListener('touchstart', attemptPlay);
        window.removeEventListener('mousedown', attemptPlay);
      };

      // Initial attempt
      attemptPlay();

      // Listen for the first interaction to start audio if blocked
      window.addEventListener('click', attemptPlay);
      window.addEventListener('scroll', attemptPlay, { passive: true });
      window.addEventListener('touchstart', attemptPlay, { passive: true });
      window.addEventListener('mousedown', attemptPlay);

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

      <main className="relative pt-32 pb-32 px-4 md:px-8">
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
                    Damanjit Kaur Kang
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

                <p className="text-[#2C1810]/70 text-xl md:text-2xl font-medium max-w-lg mb-8 italic leading-relaxed">
                  "May your special day be as sweet as the treats we bake, and as beautiful as the heart you share with the world. Wishing you a year of endless smiles, big dreams, and all the love you deserve. Happy Birthday! 🖤🎂✨"
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWishes(true)}
                    className="bg-[#2C1810] text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest shadow-2xl shadow-[#2C1810]/20 hover:bg-[#3E2723] transition-all"
                  >
                    Click Here
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
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentMemoryIndex}
                        src={memories[currentMemoryIndex].src}
                        initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
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
                  className="absolute -top-10 -right-10 text-[#2C1810]"
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
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-4 border-[#2C1810]/15 rounded-full -z-10 animate-pulse"
              />
            </div>
          </div>
        </div>
      </main>



      <AnimatePresence>
        {showWishes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowWishes(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50, rotate: 5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#FCF8F1] p-8 md:p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 p-4">
                <Heart className="text-[#D4A373]/10" size={120} fill="currentColor" />
              </div>
              <div className="absolute -bottom-8 -left-8">
                <Sparkles className="text-[#D4A373]/20" size={100} />
              </div>

              {/* Header */}
              <div className="relative z-10 text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 bg-[#2C1810] rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl"
                >
                  <Heart size={32} fill="currentColor" />
                </motion.div>
                <h3 className="font-playfair text-3xl md:text-4xl font-bold text-[#2C1810] mb-2">From Mummy & Daddy</h3>
                <div className="w-24 h-1 bg-[#D4A373] mx-auto rounded-full" />
              </div>

              {/* Message */}
              <div className="relative z-10 space-y-6">
                <p className="font-playfair text-xl md:text-2xl text-[#2C1810]/80 italic leading-relaxed text-center">
                  "Puttar, you are the heartbeat of our home. Watching you grow into such a wonderful, kind-hearted soul has been our life's greatest joy."
                </p>
                <p className="text-[#2C1810]/70 text-lg md:text-xl font-medium leading-relaxed text-center">
                  May Waheguru always protect you and shower you with endless happiness. We are always here for you, cheering the loudest for every success.
                </p>
                <div className="pt-6 border-t border-[#2C1810]/10 text-center">
                  <p className="font-playfair text-2xl font-black text-[#2C1810]">Happy Birthday, Beta! 🖤</p>
                  <p className="text-[#2C1810]/40 text-sm uppercase tracking-widest mt-2">With all our love forever</p>
                </div>
              </div>

              {/* Close button with love */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWishes(false)}
                className="mt-10 w-full py-4 bg-[#2C1810] text-white rounded-xl font-bold tracking-widest hover:bg-[#3E2723] transition-all relative z-10 shadow-lg"
              >
                CLOSE WITH LOVE
              </motion.button>

              <div className="absolute -bottom-2 right-8 opacity-10 pointer-events-none">
                <img src={daman} alt="" className="w-32 rotate-12" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Captured Memories Gallery */}
      <section className="py-24 px-4 bg-[#EBE3D5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C1810]/5 border border-[#2C1810]/10 text-[#2C1810] text-[0.7rem] font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles size={14} className="text-[#D4A373]" /> Digital Scrapbook
            </motion.div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#2C1810] mb-4">Captured Memories</h2>
            <p className="text-[#2C1810]/60 max-w-xl mx-auto">A collection of moments that make our bakery more than just a place to eat—it's a place to belong.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-32 pt-20">
            {memories.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [photo.rotate, (parseFloat(photo.rotate) + 2) + "deg", photo.rotate]
                }}
                transition={{
                  y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 },
                  rotate: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 },
                  opacity: { duration: 0.5, delay: index * 0.1 }
                }}
                className="group relative"
              >
                {/* Balloon assembly */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                  <motion.div
                    animate={{
                      rotate: [-5, 5, -5],
                      x: [-2, 2, -2]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg width="50" height="60" viewBox="0 0 30 40" fill={["#D4A373", "#2C1810", "#EBC49F", "#A37B5C"][index % 4]} className="drop-shadow-xl">
                      <path d="M15 0C6.716 0 0 6.716 0 15C0 23.284 6.716 30 15 30C23.284 30 30 23.284 30 15C30 6.716 23.284 0 15 0Z" />
                      <path d="M15 30L12 34H18L15 30Z" />
                    </svg>
                  </motion.div>
                  {/* String */}
                  <div className="w-[1px] h-24 bg-[#2C1810]/20 -mt-2" />
                </div>

                <div className="relative p-3 bg-white shadow-xl rounded-sm transform transition-all duration-500 group-hover:shadow-2xl z-20">
                  <div className="aspect-[4/5] overflow-hidden rounded-sm relative mb-4">
                    <img
                      src={photo.src}
                      alt="Captured Moment"
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-[#2C1810]/10 group-hover:bg-transparent transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
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
                  className="absolute text-[#2C1810]/60"
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
