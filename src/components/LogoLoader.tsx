import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/Logo2.png";
import { useEffect, useState } from "react";

export default function LogoLoader({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation to complete before calling onComplete
      setTimeout(onComplete, 1000);
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F5ECD7]"
        >
          {/* Logo Container with Glow */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: 0,
              boxShadow: ["0px 0px 0px rgba(212, 163, 115, 0)", "0px 0px 40px rgba(212, 163, 115, 0.4)", "0px 0px 0px rgba(212, 163, 115, 0)"]
            }}
            transition={{
              scale: { duration: 1, ease: "easeOut" },
              opacity: { duration: 0.8 },
              rotate: { duration: 1, ease: "easeOut" },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
            className="relative w-32 h-32 md:w-40 md:h-40 bg-[#eaccd1] rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden mb-8"
          >
            <motion.img
              src={logo}
              alt="Logo"
              className="w-[90%] h-[90%] object-cover rounded-[1.8rem]"
              initial={{ filter: "brightness(0)" }}
              animate={{ filter: "brightness(1)" }}
              transition={{ delay: 0.3, duration: 1 }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full"
              animate={{ translateX: ["100%", "-100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            />
          </motion.div>

          {/* Text Animation */}
          <div className="flex flex-col items-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-playfair text-3xl md:text-5xl font-bold text-[#1A2744] tracking-tight mb-2"
            >
              Hangry? <span className="text-[#D4A373]">Sweet.</span>
            </motion.h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
              className="h-[2px] bg-[#D4A373]/30 w-48 md:w-64 overflow-hidden"
            >
              <motion.div
                className="h-full bg-[#D4A373] w-full"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="text-[0.7rem] uppercase tracking-[0.4em] text-[#8D6E63] mt-4 font-semibold"
            >
              Crafting Sweetness Since 2024
            </motion.p>
          </div>

          {/* Decorative background elements */}
          <motion.div
            className="absolute top-1/4 -left-20 w-64 h-64 bg-[#D4A373]/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#eaccd1]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
