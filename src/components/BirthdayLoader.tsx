import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, Cake, Gift, Sparkles } from "lucide-react";

export default function BirthdayLoader({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsVisible(false);
    setTimeout(onComplete, 1000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#EBE3D5]"
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: "100vh",
                  x: `${Math.random() * 100}vw`,
                  rotate: 0 
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: "-10vh",
                  rotate: 360,
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                className="absolute text-[#D4A373]/20"
              >
                {i % 3 === 0 ? <Heart size={24} fill="currentColor" /> : 
                 i % 3 === 1 ? <Cake size={24} /> : 
                 <Gift size={24} />}
              </motion.div>
            ))}
          </div>

          {/* Central Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex flex-col items-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, 0],
                y: [0, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8 border-4 border-[#D4A373]/20"
            >
              <Cake size={64} className="text-[#D4A373]" strokeWidth={1.5} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h1 className="font-playfair text-4xl md:text-6xl font-black text-[#2C1810] mb-4 tracking-tighter">
                BIG <span className="text-[#D4A373]">SURPRISE!</span>
              </h1>
              <div className="flex items-center justify-center gap-3 text-[#2C1810]/60 uppercase tracking-[0.4em] text-[0.6rem] font-bold">
                <Sparkles size={12} />
                <span>UNWRAPPING THE MAGIC...</span>
                <Sparkles size={12} />
              </div>

              {/* Progress Line or Button */}
              <div className="mt-8 relative h-14 flex items-center justify-center">
                {!showButton ? (
                  <div className="w-48 h-1 bg-[#2C1810]/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                      className="h-full bg-[#D4A373]"
                    />
                  </div>
                ) : (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpen}
                    className="bg-[#2C1810] text-white px-8 py-4 rounded-full font-bold text-xs tracking-[0.3em] shadow-2xl flex items-center gap-2 hover:bg-[#3E2723] transition-all"
                  >
                    OPEN SURPRISE <Gift size={16} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Background Glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4A373]/10 rounded-full blur-[100px] -z-10"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
