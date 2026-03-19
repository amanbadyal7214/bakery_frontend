import { Star, Truck, Leaf } from "lucide-react";
import bakeryIllustrations from "@/assets/bakery-illustrations.png";
import { motion, Variants } from "framer-motion";

export default function FeatureStrip() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-[#fdfbf7] px-6 py-20">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8"
      >
        <motion.div
          variants={item}
          className="flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
            <img
              src={bakeryIllustrations}
              alt="Baker Icon"
              className="w-10 h-10 object-contain opacity-80"
            />
          </div>
          <h3 className="font-playfair text-xl font-bold text-navy mb-3">
            Professional Baker
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed px-4">
            Our team of expert bakers brings years of experience and passion to
            every loaf.
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
            <Star className="w-8 h-8 text-gold" strokeWidth={1.5} />
          </div>
          <h3 className="font-playfair text-xl font-bold text-navy mb-3">
            Unique Pastry
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed px-4">
            Discover our signature pastries, crafted with creativity and the
            finest ingredients.
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
            <Truck className="w-8 h-8 text-gold" strokeWidth={1.5} />
          </div>
          <h3 className="font-playfair text-xl font-bold text-navy mb-3">
            Door Delivery
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed px-4">
            Freshness delivered straight to your doorstep, ensuring you start
            your day right.
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
            <Leaf className="w-8 h-8 text-gold" strokeWidth={1.5} />
          </div>
          <h3 className="font-playfair text-xl font-bold text-navy mb-3">
            Healthy Food
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed px-4">
            Wholesome, natural ingredients for a healthy and delicious bakery
            experience.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
