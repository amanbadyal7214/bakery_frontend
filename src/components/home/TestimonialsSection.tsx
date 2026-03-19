import { testimonials } from "./home-data";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-[#FDF6EC]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Testimonials</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-bread-dark mb-4">What Our Customers Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {testimonials.map((t, i) => (
            <motion.blockquote key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-md border border-bread-brown/10 m-0 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="text-gold text-base tracking-wide mb-4">{"★".repeat(t.stars)}</div>
              <p className="text-[#7A5C4F] italic leading-[1.75] mb-6 text-[0.975rem]">"{t.text}"</p>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-bread-brown to-gold text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <strong className="block text-[0.925rem] font-bold text-bread-dark">{t.name}</strong>
                  <span className="block text-[0.78rem] text-[#7A5C4F] mt-0.5">{t.role}</span>
                </div>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
