import { useProductActions } from "./home-data";
import { motion } from "framer-motion";

export default function FreshBreadSection() {
  const { scrollTo } = useProductActions();

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left Column */}
        <div className="flex flex-col gap-12">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-playfair text-5xl md:text-6xl text-navy leading-[1.1]"
          >
            Serving Fresh Bread <span className="italic block mt-2">Every Day</span>
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-xl overflow-hidden h-[400px]"
          >
              <img src="/bread.png" alt="Bread basket" className="w-full h-full object-cover bg-[#F5F5F5]" />
          </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="rounded-xl overflow-hidden h-[500px]"
            >
              <img src="/about-baker.png" alt="Bakery atmosphere" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-16 md:pt-20">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-[#7A5C4F] text-lg italic mb-6 leading-relaxed">
              From the first crackle of the crust to the soft, airy center, every loaf is a testament to our slow-fermentation process and stone-ground heritage flour.
            </p>
            <p className="text-[#7A5C4F] text-sm leading-relaxed mb-8 opacity-80">
              We believe that true bread takes time. Our master bakers hand-shape every single loaf using artisanal techniques and natural leaven, ensuring a depth of flavor and nutritional richness that commercial bread simply cannot match. It’s not just baking; it’s a commitment to the craft.
            </p>
            {/* Signature */}
            <div className="font-playfair font-bold text-3xl text-navy opacity-60 font-cursive" style={{ fontFamily: 'cursive' }}>
              Margaret Howell
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, rotate: 3 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="rounded-xl overflow-hidden h-[300px]"
          >
            <img src="/cake.png" alt="Delicious cake" className="w-full h-full object-cover bg-[#F5F5F5]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="font-playfair text-4xl md:text-5xl text-navy mb-6">Experience Quality</h2>
            <p className="text-[#7A5C4F] leading-relaxed mb-8">
              Experience the aroma of fresh baking and the warmth of our community kitchen. Whether you're stopping by for your morning sourdough or checking our daily specials, we're here to make every moment authentic and delicious.
            </p>
            <button 
              onClick={() => scrollTo("menu")} // Corrected to scroll to "menu" (lowercase) which is the id in MenuSection
              className="bg-navy text-white px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-navy/90 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              View Menu
            </button>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
