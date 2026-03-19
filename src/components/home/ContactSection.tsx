import { MapPin, Phone, Mail, Clock, Send, Star } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function ContactSection() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-[#FEFBF5] relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, 20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"
      ></motion.div>
      <motion.div 
         animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          y: [0, -20, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"
      ></motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-2 px-4 rounded-full bg-white border border-gold/20 shadow-sm mb-4">
             <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold flex items-center gap-2">
               <Star className="w-3 h-3 fill-gold" /> Contact Us <Star className="w-3 h-3 fill-gold" />
             </span>
          </div>
          <h2 className="font-playfair text-4xl md:text-6xl font-bold text-bread-dark mb-6 leading-tight">
            We&apos;d Love to <span className="text-gold italic">Hear</span> from You
          </h2>
          <p className="text-bread-brown/80 max-w-2xl mx-auto text-lg">
            Have a custom order in mind? Or just want to say hello? Drop us a line and let&apos;s bake something special together!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-bread-brown/5 border border-bread-brown/5 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDF6EC] rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
               
               <h3 className="font-playfair text-2xl font-bold text-bread-dark mb-8 relative z-10">Get in Touch</h3>
               
               <motion.div 
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="space-y-8 relative z-10"
               >
                {[
                  { icon: MapPin, label: "Visit Us", val: "12 Baker Street, Mumbai,\nMH 400001", color: "text-red-500", bg: "bg-red-50" },
                  { icon: Phone, label: "Call Us", val: "+91 98765 43210", color: "text-green-500", bg: "bg-green-50" },
                  { icon: Mail, label: "Email Us", val: "hello@Hangary Sweet.in", color: "text-blue-500", bg: "bg-blue-50" },
                  { icon: Clock, label: "Opening Hours", val: "Mon – Sat: 7 AM – 8 PM\nSun: 8 AM – 5 PM", color: "text-orange-500", bg: "bg-orange-50" },
                ].map((c, i) => (
                  <motion.div key={i} variants={item} className="flex gap-5 items-start group/item">
                    <span className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3 shadow-sm`}>
                      <c.icon className={`w-5 h-5 ${c.color}`} />
                    </span>
                    <div>
                      <strong className="block text-xs font-bold tracking-widest uppercase text-gold mb-1">{c.label}</strong>
                      <div className="text-bread-dark/80 text-[0.95rem] m-0 leading-relaxed whitespace-pre-line font-medium">{c.val}</div>
                    </div>
                  </motion.div>
                ))}
               </motion.div>

               <div className="mt-10 pt-8 border-t border-gray-100">
                  <p className="text-sm text-center text-gray-500 italic">
                    "Life is uncertain. Eat dessert first." 🍰
                  </p>
               </div>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="lg:col-span-7"
          >
            <form
              className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-bread-brown/5 border border-bread-brown/5 flex flex-col gap-6 relative"
              onSubmit={(e) => { e.preventDefault(); alert("Message sent! We'll get back to you soon. 🧁"); }}
            > 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 group">
                  <label htmlFor="cf-name" className="text-sm font-bold text-bread-dark ml-1 group-focus-within:text-gold transition-colors">Your Name</label>
                  <input id="cf-name" type="text" placeholder="Jane Doe" required
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-bread-dark outline-none focus:bg-white focus:border-gold/30 focus:ring-4 focus:ring-gold/10 transition-all duration-300 placeholder:text-gray-400" />
                </div>
                <div className="flex flex-col gap-2 group">
                  <label htmlFor="cf-email" className="text-sm font-bold text-bread-dark ml-1 group-focus-within:text-gold transition-colors">Email Address</label>
                  <input id="cf-email" type="email" placeholder="jane@example.com" required
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-bread-dark outline-none focus:bg-white focus:border-gold/30 focus:ring-4 focus:ring-gold/10 transition-all duration-300 placeholder:text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col gap-2 group">
                <label htmlFor="cf-subject" className="text-sm font-bold text-bread-dark ml-1 group-focus-within:text-gold transition-colors">Subject</label>
                <select id="cf-subject" 
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-bread-dark outline-none focus:bg-white focus:border-gold/30 focus:ring-4 focus:ring-gold/10 transition-all duration-300 cursor-pointer appearance-none">
                    <option value="" disabled selected>Select a topic...</option>
                    <option value="order">Custom Order Inquiry</option>
                    <option value="catering">Event Catering</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 group">
                <label htmlFor="cf-message" className="text-sm font-bold text-bread-dark ml-1 group-focus-within:text-gold transition-colors">Message</label>
                <textarea id="cf-message" rows={5} placeholder="Tell us what you need…" required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-bread-dark outline-none focus:bg-white focus:border-gold/30 focus:ring-4 focus:ring-gold/10 transition-all duration-300 resize-y placeholder:text-gray-400 min-h-[150px]" />
              </div>

              <button type="submit"
                className="group relative w-full bg-bread-brown text-white border-none py-5 rounded-xl font-bold text-lg cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-bread-brown/30 mt-2">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative flex items-center justify-center gap-3 transition-transform group-hover:-translate-y-0.5">
                  Send Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
