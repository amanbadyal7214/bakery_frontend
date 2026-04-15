import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/home/FooterSection";
import axiosInstance from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin, Phone, Mail, Clock, Send,
  Instagram, Facebook, Twitter, CheckCircle2,
  ChevronDown, MessageSquare, ShoppingBag, Cake, Star,
} from "lucide-react";

/* ─── animation helpers (same as About/Gallery) ─── */
const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp   = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };
const fadeLeft = { hidden: { opacity: 0, x: -50 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } } };
const fadeRight= { hidden: { opacity: 0, x:  50 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } } };
const stagger  = { show: { transition: { staggerChildren: 0.12 } } };
const itemV    = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.5 } } };

const infoCards = [
  { icon: MapPin,  label: "Visit Us",       val: "12 Baker Street, Mumbai,\nMH 400001",    color: "text-rose-500",   bg: "bg-rose-50",   border: "border-rose-100"   },
  { icon: Phone,   label: "Call Us",         val: "+91 98765 43210",                         color: "text-emerald-500",bg: "bg-emerald-50",border: "border-emerald-100"},
  { icon: Mail,    label: "Email Us",        val: "hello@Hangary? Sweet..in",                      color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-100"   },
  { icon: Clock,   label: "Opening Hours",   val: "Mon – Sat: 7 AM – 8 PM\nSun: 8 AM – 5 PM",color:"text-amber-500", bg: "bg-amber-50",  border: "border-amber-100"  },
];

const faqs = [
  { q: "Do you take custom cake orders?",          a: "Yes! We love custom orders. Fill the form above or call us directly. We need at least 48 hours notice for custom cakes." },
  { q: "Do you offer same-day delivery?",          a: "We offer same-day delivery for orders placed before 11 AM within a 10 km radius of our bakery." },
  { q: "Are there vegan or gluten-free options?",  a: "Absolutely. We have a dedicated vegan and gluten-free menu. Just ask our team when you visit or mention it in your order." },
  { q: "Can you cater for large events?",          a: "Yes — weddings, corporate events, birthdays. Reach out via the form or email us and we'll send you a custom catering quote." },
];

const quickLinks = [
  { icon: ShoppingBag, label: "View Full Menu",      to: "/menu" },
  { icon: Cake,        label: "Customize Your Order", to: "/customize-order" },
  { icon: Star,        label: "About Us",             to: "/about" },
];

type FormState = { name: string; phone: string; subject: string; message: string };

export default function Contact() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  const [open, setOpen] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", phone: "", subject: "", message: "" });

  const [profile, setProfile] = useState<{ address?: string; phone?: string; email?: string; hours?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Prefill when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const u = user as unknown as Record<string, unknown>;
    const nameVal = typeof u['name'] === 'string' ? (u['name'] as string)
      : typeof u['fullName'] === 'string' ? (u['fullName'] as string)
      : '';

    // phone detection similar to ContactSection
    const tryKeys = ['phone', 'mobile', 'phoneNumber', 'telephone', 'tel', 'contact', 'contactNumber'];
    let found: string | undefined;
    for (const k of tryKeys) {
      const v = u[k];
      if (typeof v === 'string' && v) { found = v; break; }
      if (typeof v === 'number' && !found) { found = String(v); break; }
    }
    // nested locations
    if (!found && typeof u['profile'] === 'object' && u['profile'] !== null) {
      const p = u['profile'] as Record<string, unknown>;
      if (typeof p['phone'] === 'string') found = p['phone'] as string;
    }
    if (!found && typeof u['attributes'] === 'object' && u['attributes'] !== null) {
      const a = u['attributes'] as Record<string, unknown>;
      if (typeof a['phone'] === 'string') found = a['phone'] as string;
    }
    // fallback: any string that looks like phone
    if (!found) {
      const vals = Object.values(u).filter(v => typeof v === 'string') as string[];
      for (const v of vals) {
        if (/\d{6,}/.test(v)) { found = v; break; }
      }
    }

    const normalized = found ? found.replace(/[^+\d]/g, '') : '';
    setForm(f => ({ ...f, name: nameVal || f.name, phone: normalized || f.phone }));
  }, [isAuthenticated, user]);

  // Load store profile
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: 'Login required', description: 'Please log in to submit the contact form.' });
      return;
    }
    if (!form.name || !form.phone || !form.message) {
      toast({ title: 'Please fill required fields', description: 'Name, phone and message are required.' });
      return;
    }
    try {
      const payload = { name: form.name, phone: form.phone, subject: form.subject, message: form.message };
      const res = await axiosInstance.post('/contacts', payload);
      if (res && (res.data?.success || res.status === 201)) {
        setSubmitted(true);
        toast({ title: 'Message sent', description: 'We will reply soon.' });
        setForm({ name: '', phone: '', subject: '', message: '' });
      } else {
        toast({ title: 'Failed to send message', description: 'Please try again later.' });
      }
    } catch (err) {
      console.error('Contact form submit failed', err);
      toast({ title: 'Unable to send message', description: 'Try again later.' });
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative bg-parchment pt-32 pb-16 overflow-hidden">
        {/* watermark */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-playfair font-extrabold tracking-widest text-navy/[0.04] whitespace-nowrap select-none pointer-events-none"
          style={{ fontSize: "clamp(5rem,16vw,14rem)" }}
        >
          CONTACT
        </div>

        {/* spinning stamp */}
        <div aria-hidden className="absolute top-[30%] right-[6%] w-24 h-24 animate-spin-slow hidden md:block">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs><path id="cc" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" /></defs>
            <text fontSize="11" letterSpacing="3.5" fill="#1A2744" fontFamily="Inter,sans-serif">
              <textPath href="#cc">Hangary? Sweet. • ARTISAN • EST.2024 •</textPath>
            </text>
            <text x="60" y="57" textAnchor="middle" fill="#1A2744" fontFamily="Playfair Display,serif" fontWeight="700" fontSize="9" letterSpacing="2">SWEET</text>
            <text x="60" y="70" textAnchor="middle" fill="#1A2744" fontFamily="Playfair Display,serif" fontWeight="700" fontSize="9" letterSpacing="2">BAKE</text>
          </svg>
        </div>

        {/* gold dots */}
        <span className="absolute w-3 h-3 rounded-full bg-gold/50 top-[22%] left-[8%] hidden md:block" />
        <span className="absolute w-2 h-2 rounded-full bg-gold/40 top-[65%] left-[5%] hidden md:block" />
        <span className="absolute w-2 h-2 rounded-full bg-gold/50 bottom-[20%] right-[10%] hidden md:block" />

        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="relative z-10 text-center max-w-2xl mx-auto px-6"
        >
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Get in Touch</p>
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-bread-dark mb-4 leading-tight">
            We'd Love to<br />
            <span className="italic text-gold">Hear</span> from You
          </h1>
          <p className="text-[#7A5C4F] text-base leading-relaxed max-w-xl mx-auto">
            Custom orders, catering enquiries, feedback — whatever's on your mind, we're just a message away.
          </p>
        </motion.div>
      </section>

      {/* ══════════════════ INFO CARDS ══════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {infoCards.map((c) => {
            // prefer backend profile values when available
            let val = c.val;
            if (profile) {
              if (c.label === 'Visit Us' && profile.address) val = profile.address;
              if (c.label === 'Call Us' && profile.phone) val = profile.phone;
              if (c.label === 'Email Us' && profile.email) val = profile.email;
              if (c.label === 'Opening Hours' && profile.hours) val = profile.hours;
            }
            return (
              <motion.div
                key={c.label}
                variants={fadeUp}
                className={`bg-white rounded-3xl p-6 shadow-md border ${c.border} hover:shadow-xl transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                <p className="text-[0.65rem] font-bold tracking-widest uppercase text-gold mb-1">{c.label}</p>
                <p className="text-bread-dark text-sm font-medium leading-relaxed whitespace-pre-line">{val}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══════════════════ FORM + SIDEBAR ══════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* ── LEFT: form ── */}
          <motion.div
            variants={fadeLeft} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="lg:col-span-7"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 shadow-xl border border-bread-brown/5 text-center flex flex-col items-center gap-5"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-bread-dark">Message Sent!</h3>
                <p className="text-[#7A5C4F] text-sm leading-relaxed max-w-sm">
                  Thank you, <strong>{form.name || 'friend'}</strong>! We'll get back to you within 24 hours.
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name:'', phone:'', subject:'', message:'' }); }}
                    className="px-6 py-2.5 rounded-full border border-gold/30 text-bread-brown text-sm font-bold hover:border-bread-brown transition-colors"
                  >
                    Send Another
                  </button>
                  <Link to="/menu" className="px-6 py-2.5 rounded-full bg-bread-brown text-white text-sm font-bold hover:bg-bread-dark transition-colors no-underline">
                    View Menu
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-bread-brown/5 flex flex-col gap-6"
              >
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-bread-dark mb-1">Send Us a Message</h2>
                  <p className="text-[#7A5C4F] text-sm">We read every message and reply within 24 hours.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 group">
                    <label htmlFor="cf-name" className="text-xs font-bold text-bread-dark ml-1 tracking-wide uppercase group-focus-within:text-gold transition-colors">
                      Your Name
                    </label>
                    <input
                      id="cf-name" type="text" placeholder="Jane Doe" required
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3.5 text-bread-dark text-sm outline-none focus:bg-white focus:border-gold/40 focus:ring-4 focus:ring-gold/10 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 group">
                    <label htmlFor="cf-phone" className="text-xs font-bold text-bread-dark ml-1 tracking-wide uppercase group-focus-within:text-gold transition-colors">
                      Phone Number
                    </label>
                    <input
                      id="cf-phone" name="cf-phone" type="tel" placeholder="(123) 456-7890" required
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3.5 text-bread-dark text-sm outline-none focus:bg-white focus:border-gold/40 focus:ring-4 focus:ring-gold/10 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 group">
                  <label htmlFor="cf-subject" className="text-xs font-bold text-bread-dark ml-1 tracking-wide uppercase group-focus-within:text-gold transition-colors">
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      id="cf-subject"
                      value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3.5 text-bread-dark text-sm outline-none focus:bg-white focus:border-gold/40 focus:ring-4 focus:ring-gold/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select a topic…</option>
                      <option value="order">Custom Order Inquiry</option>
                      <option value="catering">Event Catering</option>
                      <option value="delivery">Delivery Question</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A5C4F] pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 group">
                  <label htmlFor="cf-message" className="text-xs font-bold text-bread-dark ml-1 tracking-wide uppercase group-focus-within:text-gold transition-colors">
                    Message
                  </label>
                  <textarea
                    id="cf-message" rows={5} placeholder="Tell us what you need…" required
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3.5 text-bread-dark text-sm outline-none focus:bg-white focus:border-gold/40 focus:ring-4 focus:ring-gold/10 transition-all resize-y placeholder:text-gray-400 min-h-[140px]"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="group relative w-full bg-bread-brown hover:bg-bread-dark text-white py-4 rounded-xl font-bold text-base cursor-pointer overflow-hidden transition-all duration-300 shadow-lg shadow-bread-brown/20 hover:shadow-xl hover:shadow-bread-brown/30"
                >
                  {/* shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-3">
                    Send Message
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </motion.button>

                <p className="text-center text-xs text-[#7A5C4F]">
                  🔒 Your info is safe with us. No spam, ever.
                </p>
              </form>
            )}
          </motion.div>

          {/* ── RIGHT: sidebar ── */}
          <motion.div
            variants={fadeRight} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Quick Links */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-bread-brown/5">
              <h3 className="font-playfair text-lg font-bold text-bread-dark mb-5">Quick Links</h3>
              <div className="flex flex-col gap-3">
                {quickLinks.map(l => (
                  <Link
                    key={l.to} to={l.to}
                    className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-parchment transition-colors group no-underline"
                  >
                    <div className="w-10 h-10 bg-[#FDF6EC] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                      <l.icon size={18} className="text-gold" />
                    </div>
                    <span className="text-bread-dark text-sm font-semibold group-hover:text-bread-brown transition-colors">{l.label}</span>
                    <ChevronDown size={14} className="ml-auto -rotate-90 text-[#7A5C4F] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-[#D4A373] rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div aria-hidden className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
              <div aria-hidden className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/5" />
              <h3 className="font-playfair text-lg font-bold text-white mb-2 relative z-10">Follow Our Journey</h3>
              <p className="text-white/50 text-xs mb-5 relative z-10">Daily bakes, behind-the-scenes & specials on our socials</p>
              <div className="flex gap-3 relative z-10">
                {[
                  { icon: Instagram, label: "@Hangary? Sweet.", color: "hover:bg-pink-500" },
                  { icon: Facebook,  label: "Hangary? Sweet.",  color: "hover:bg-blue-600" },
                  { icon: Twitter,   label: "@Hangary? Sweet.", color: "hover:bg-sky-500" },
                ].map(s => (
                  <button key={s.label} className={`w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white ${s.color} hover:text-white transition-all duration-200 hover:scale-110`}>
                    <s.icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="bg-[#FDF6EC] rounded-3xl p-6 border border-gold/20 relative overflow-hidden">
              <div aria-hidden className="absolute top-3 left-4 font-playfair text-8xl text-gold/10 font-bold leading-none select-none">"</div>
              <MessageSquare size={18} className="text-gold mb-3 relative z-10" />
              <p className="font-playfair italic text-bread-dark text-base leading-relaxed relative z-10">
                Life is uncertain. Eat dessert first.
              </p>
              <p className="text-[#7A5C4F] text-xs mt-3 font-semibold relative z-10">— The Hangary? Sweet. Team 🍰</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ MAP ══════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="bg-white rounded-3xl overflow-hidden shadow-xl border border-bread-brown/5"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-playfair text-xl font-bold text-bread-dark">Find Us Here</h3>
              <p className="text-[#7A5C4F] text-sm mt-0.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-rose-500" /> 12 Baker Street, Mumbai, MH 400001
              </p>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank" rel="noreferrer"
              className="px-5 py-2.5 rounded-full bg-bread-brown text-white text-xs font-bold hover:bg-bread-dark transition-colors no-underline flex items-center gap-2"
            >
              <MapPin size={13} /> Get Directions
            </a>
          </div>
          {/* Embedded map placeholder — matches site's cream palette */}
          <div className="relative h-72 bg-[#F5EAD0] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "linear-gradient(#1A2744 1px,transparent 1px),linear-gradient(90deg,#1A2744 1px,transparent 1px)", backgroundSize: "40px 40px" }}
            />
            <div className="relative z-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 bg-bread-brown rounded-full flex items-center justify-center shadow-lg animate-bob">
                <MapPin size={24} className="text-white" />
              </div>
              <p className="font-playfair font-bold text-bread-dark text-lg">12 Baker Street</p>
              <p className="text-[#7A5C4F] text-sm">Mumbai, MH 400001</p>
              <a
                href="https://maps.google.com"
                target="_blank" rel="noreferrer"
                className="mt-2 px-6 py-2.5 rounded-full bg-[#D4A373] text-white text-xs font-bold hover:bg-[#D4A373]-lt transition-colors no-underline"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">FAQ</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-bread-dark">Common Questions</h2>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="flex flex-col gap-3 max-w-3xl mx-auto"
        >
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              variants={itemV}
              className="bg-white rounded-2xl border border-bread-brown/5 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
              >
                <span className="font-playfair font-bold text-bread-dark text-base group-hover:text-gold transition-colors">{f.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-gold shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-[#7A5C4F] text-sm leading-relaxed">{f.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════ CTA BAND ══════════════════ */}
      <section className="bg-bread-brown py-20 px-6 text-center relative overflow-hidden">
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-playfair font-extrabold text-white/[0.03] whitespace-nowrap pointer-events-none select-none" style={{ fontSize: "clamp(4rem,12vw,11rem)" }}>BAKE</div>
        <div className="relative z-10 max-w-xl mx-auto">
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Ready to Order?</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Something Sweet<br />Awaits You</h2>
          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-md mx-auto">
            Browse our full menu or design your dream cake — we bake it fresh, just for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/menu" className="inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#c49260] text-[#2C1810] font-bold px-8 py-3.5 rounded-full shadow-xl transition-colors text-sm tracking-wide no-underline">
                Explore Menu
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/customize-order" className="inline-flex items-center gap-2 bg-transparent border border-white/30 hover:border-white/60 text-white font-bold px-8 py-3.5 rounded-full transition-colors text-sm tracking-wide no-underline">
                Customize Order
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
