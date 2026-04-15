import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Star } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import axiosInstance from '@/services/api';
import { api as dashboardApi } from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useToast } from '@/hooks/use-toast';

export default function ContactSection() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [nameValue, setNameValue] = useState<string>('');
  const [phoneValue, setPhoneValue] = useState<string>('');
  const { toast } = useToast();
  // when logged in, autofill name and phone from authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      setNameValue((user as any).name || '');
      const u: any = user;
      const tryKeys = ['phone', 'mobile', 'phoneNumber', 'telephone', 'tel', 'contact', 'contactNumber'];
      let found: string | undefined;
      for (const k of tryKeys) {
        const v = u[k];
        if (v) { found = String(v); break; }
      }
      // nested locations
      if (!found && u.profile && u.profile.phone) found = String(u.profile.phone);
      if (!found && u.attributes && u.attributes.phone) found = String(u.attributes.phone);
      // as last resort, check any value that looks like a phone in the object
      if (!found) {
        const vals = Object.values(u).filter(v => typeof v === 'string');
        for (const v of vals) {
          if (/\d{6,}/.test(v)) { found = v as string; break; }
        }
      }
      if (found) {
        // normalize: remove non-digit except leading +
        const normalized = found.replace(/[^+\d]/g, '');
        setPhoneValue(normalized);
      } else {
        setPhoneValue('');
      }
    }
  }, [isAuthenticated, user]);

  // profile will be populated from backend; start as null so we don't show dummy data
  const [profile, setProfile] = useState<{ address?: string; phone?: string; email?: string; hours?: string; openingTime?: string; closingTime?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/store');
        const data = res?.data || {};
        const p = data.profile || data;
        if (!mounted) return;
        if (p && Object.keys(p).length > 0) {
          setProfile({
            address: p.address,
            phone: p.phone,
            email: p.email,
            hours: p.hours,
            openingTime: p.openingTime,
            closingTime: p.closingTime,
          });
          setError(null);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.debug('Failed to load store profile', err);
        if (!mounted) return;
        setError('Unable to load contact information');
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
    <section id="contact" className="py-12 px-6 bg-[#FEFBF5] relative overflow-hidden">
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
             <span className="text-xs font-playfair tracking-[0.2em] uppercase text-gold flex items-center gap-2">
               <Star className="w-3 h-3 fill-gold" /> Contact Us <Star className="w-3 h-3 fill-gold" />
             </span>
          </div>
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-bread-dark mb-6 leading-tight">
            We&apos;d Love to <span className="text-gold italic">Hear</span> from You
          </h2>
          <p className="text-bread-brown/80 max-w-2xl mx-auto text-md">
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
               
               <h3 className="font-playfair text-lg font-bold text-bread-dark mb-8 relative z-10">Get in Touch</h3>
               
               {/* Only show backend data. If loading, show skeleton. If no profile, show not available message. */}
               {loading ? (
                 <div className="space-y-8 relative z-10 animate-pulse">
                   {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="flex gap-5 items-start">
                       <div className="w-12 h-12 bg-gray-200 rounded-2xl flex-shrink-0" />
                       <div className="space-y-2 w-full pt-2">
                         <div className="h-3 bg-gray-200 rounded w-24"></div>
                         <div className="h-4 bg-gray-200 rounded w-3/4 max-w-[200px]"></div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : profile ? (
                 <motion.div 
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="space-y-8 relative z-10"
                 >
                  { [
                    { icon: MapPin, label: "Visit Us", val: profile.address, color: "text-red-500", bg: "bg-red-50" },
                    { icon: Phone, label: "Call Us", val: profile.phone, color: "text-green-500", bg: "bg-green-50" },
                    { icon: Mail, label: "Email Us", val: profile.email, color: "text-blue-500", bg: "bg-blue-50" },
                    { icon: Clock, label: "Opening Hours", val: profile.hours, color: "text-orange-500", bg: "bg-orange-50" },
                  ].map((c, i) => (
                    <motion.div key={i} variants={item} className="flex gap-5 items-start group/item">
                      <span className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3 shadow-sm`}>
                        <c.icon className={`w-5 h-5 ${c.color}`} />
                      </span>
                      <div>
                        <strong className="block text-xs font-playfair tracking-widest uppercase text-gold mb-1">{c.label}</strong>
                        <div className="text-bread-dark/80 text-[0.95rem] m-0 leading-relaxed whitespace-pre-line font-playfair">{c.val ?? 'Not available'}</div>
                      </div>
                    </motion.div>
                  )) }
                 </motion.div>
               ) : (
                 <div className="py-8 text-center text-gray-500 italic">Contact information is not available.</div>
               )}

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
              onSubmit={async (e) => { 
                e.preventDefault(); 
                if (!isAuthenticated) {
                  toast({ title: 'Login required', description: 'Please log in to submit the contact form.' });
                  return;
                }
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                const payload = {
                  name: fd.get('cf-name')?.toString() || '',
                  phone: fd.get('cf-phone')?.toString() || '',
                  subject: fd.get('cf-subject')?.toString() || '',
                  message: fd.get('cf-message')?.toString() || '',
                };
                try {
                  // basic local validation
                  if (!payload.name || !payload.phone || !payload.message) {
                    toast({ title: 'Please fill required fields', description: 'Name, phone and message are required.' });
                    return;
                  }
                   // post to backend
                   const res = await axiosInstance.post('/contacts', payload);
                   if (res && (res.data?.success || res.status === 201)) {
                    toast({ title: 'Message sent', description: 'We will reply soon.' });
                     form.reset();
                   } else {
                    toast({ title: 'Failed to send message', description: 'Please try again later.' });
                   }
                 } catch (err) {
                   console.error('Contact form submit failed', err);
                   toast({ title: 'Unable to send message', description: 'Try again later.' });
                 }
               }} 
            > 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 group">
                  <label htmlFor="cf-name" className="text-sm font-playfair text-bread-dark ml-1 group-focus-within:text-gold transition-colors">Your Name</label>
                  <input id="cf-name" name="cf-name" type="text" placeholder="Jane Doe" required
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-bread-dark outline-none focus:bg-white focus:border-gold/30 focus:ring-4 focus:ring-gold/10 transition-all duration-300 placeholder:text-gray-400" />
                </div>
                <div className="flex flex-col gap-2 group">
                  <label htmlFor="cf-phone" className="text-sm font-playfair text-bread-dark ml-1 group-focus-within:text-gold transition-colors">Phone Number</label>
                  <input id="cf-phone" name="cf-phone" type="tel" placeholder="(123) 456-7890" required
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-bread-dark outline-none focus:bg-white focus:border-gold/30 focus:ring-4 focus:ring-gold/10 transition-all duration-300 placeholder:text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col gap-2 group">
                <label htmlFor="cf-subject" className="text-sm font-playfair text-bread-dark ml-1 group-focus-within:text-gold transition-colors">Subject</label>
                <select id="cf-subject" name="cf-subject" defaultValue="" 
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-bread-dark outline-none focus:bg-white focus:border-gold/30 focus:ring-4 focus:ring-gold/10 transition-all duration-300 cursor-pointer appearance-none">
                    <option value="" disabled>Select a topic...</option>
                    <option value="order">Custom Order Inquiry</option>
                    <option value="catering">Event Catering</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 group">
                <label htmlFor="cf-message" className="text-sm font-playfair text-bread-dark ml-1 group-focus-within:text-gold transition-colors">Message</label>
                <textarea id="cf-message" name="cf-message" rows={5} placeholder="Tell us what you need…" required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-bread-dark outline-none focus:bg-white focus:border-gold/30 focus:ring-4 focus:ring-gold/10 transition-all duration-300 resize-y placeholder:text-gray-400 min-h-[150px]" />
              </div>

              <button type="submit"
                className="group relative w-full bg-bread-brown text-white border-none py-5 rounded-xl font-playfair text-lg cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-bread-brown/30 mt-2">
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
