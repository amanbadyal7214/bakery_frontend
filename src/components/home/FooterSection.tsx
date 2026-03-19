import { Link } from "react-router-dom";
import { navLinks, useProductActions } from "./home-data";
import { Facebook, Instagram, Twitter, Youtube, ArrowRight } from "lucide-react";
import bakeryIllustrations from "@/assets/bakery-illustrations.png";
import { motion } from "framer-motion";

export default function FooterSection() {
  const { scrollTo } = useProductActions();

  return (
    <footer className="relative bg-[#0F0F0F] text-white pt-12 pb-12 overflow-hidden">
        {/* Background Texture */}
        <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay invert"
            style={{ backgroundImage: `url(${bakeryIllustrations})`, backgroundSize: '500px' }}
        />
        
        <div className="container mx-auto relative z-10 px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-20 ">
                {/* Left: Big Statement */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="max-w-2xl"
                >
                    <h2 className="font-playfair text-7xl md:text-8xl leading-[0.85] mb-10 text-white tracking-tighter">
                        Taste the <br/>
                        <span className="text-gold italic pr-4">Magic</span>
                        <span className="text-4xl align-middle tracking-normal opacity-50 font-sans font-light block mt-4 max-w-md">
                           Artisan pastries baked with passion since 1984.
                        </span>
                    </h2>
                </motion.div>

                {/* Right: Links & Action */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex flex-col gap-12 w-full lg:w-auto min-w-[300px]"
                >
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        {navLinks.map((link, i) => (
                            <motion.button 
                              key={link} 
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + (i * 0.1) }}
                              onClick={() => scrollTo(link)} 
                              className="text-left text-white/50 hover:text-gold transition-colors text-sm font-medium uppercase tracking-widest bg-transparent border-none p-0 cursor-pointer group flex items-center gap-2"
                            >
                                <span className="w-0 group-hover:w-3 h-[1px] bg-gold transition-all duration-300"></span>
                                {link}
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-6 mt-4">
                        <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Newsletter</span>
                        <div className="flex items-center border-b border-white/20 pb-4 focus-within:border-gold transition-colors w-full group">
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="bg-transparent border-none outline-none text-white placeholder:text-white/30 w-full text-lg font-light" 
                            />
                            <button className="bg-transparent border-none cursor-pointer text-white/50 group-focus-within:text-gold hover:text-white transition-colors">
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom: Footer Info */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col md:flex-row justify-between items-end border-t border-white/10 pt-10 gap-8"
            >
                <div className="flex flex-col gap-3">
                    <span className="font-playfair text-3xl font-bold tracking-wider">Hangary Sweet</span>
                    <p className="text-white/30 text-xs tracking-wide">© 2024 Hangary Sweet Inc. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 text-[0.65rem] text-white/20 uppercase tracking-widest">
                         <Link to="/login" className="hover:text-gold transition-colors no-underline">Admin</Link>
                         <a href="#" className="hover:text-gold transition-colors no-underline">Privacy</a>
                         <a href="#" className="hover:text-gold transition-colors no-underline">Terms</a>
                    </div>
                </div>
                
                <div className="flex gap-4">
                     {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                        <a key={i} href="#" className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 group">
                            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </a>
                     ))}
                </div>
            </motion.div>
        </div>
    </footer>
  );
}
