import { useProductActions } from "./home-data";
import { motion } from "framer-motion";

export default function CtaBannerSection() {
  const { scrollTo } = useProductActions();

  return (
    <section className="bg-gradient-to-br from-bread-dark to-bread-brown py-20 px-6 text-center relative overflow-hidden">
      <motion.div 
        initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
        whileInView={{ rotate: 10, scale: 1, opacity: 0.04 }}
        transition={{ duration: 1.5 }}
        aria-hidden="true" 
        className="absolute -top-8 right-[5%] text-[12rem] pointer-events-none"
      >
        🧁
      </motion.div>
      <div className="max-w-2xl mx-auto relative">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-3xl md:text-5xl text-white font-bold mb-4 leading-tight"
        >
          Ready to Order Something Delicious?
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/70 text-lg mb-8"
        >
          Visit us in-store or call ahead. Custom orders welcome!
        </motion.p>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollTo("Contact")}
            className="bg-white text-bread-dark border-2 border-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#FDF6EC] shadow-lg transition-all cursor-pointer"
          >
            Get in Touch
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollTo("Menu")}
            className="bg-transparent text-white border-2 border-white/50 px-8 py-3.5 rounded-full font-semibold transition-all cursor-pointer"
          >
            View Menu
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
