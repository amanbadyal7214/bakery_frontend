import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.13 } } };
const slideLeft = { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } } };

export default function OriginStorySection() {
  const [originStory, setOriginStory] = useState<any | null>(null);
  const [originLoading, setOriginLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const apiBase = (import.meta.env && import.meta.env.VITE_API_URL) || 'https://bakery-bakend.onrender.com';
    setOriginLoading(true);
    fetch(`${apiBase}/api/origin-story`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed')))
      .then((data) => {
        if (!mounted) return;
        if (data && data.ok && data.story) setOriginStory(data.story);
      })
      .catch(() => { })
      .finally(() => { if (mounted) setOriginLoading(false); });

    return () => { mounted = false; };
  }, []);

  return (
    <section id="story" className="py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Visual side */}
          <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img src={originStory?.founder?.img ?? '/about-baker.png'} alt={originStory?.founder?.name ?? 'Founder'} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#2C1810]/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-playfair text-lg font-bold">{originStory?.founder?.name ?? 'Margaret Howell'}</p>
                <p className="text-[#D4A373] text-xs tracking-widest uppercase font-playfair mt-0.5">{originStory?.founder?.since ?? 'Founder, since 2024'}</p>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -6 }} whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -top-7 -left-7 bg-[#3E2723] rounded-2xl px-6 py-5 shadow-2xl"
            >
              <div className="font-playfair text-4xl font-bold text-[#D4A373]">10</div>
              <div className="text-[#F5ECD7]/70 text-[0.65rem] font-playfair tracking-widest uppercase mt-0.5">Years of Craft</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 6 }} whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -bottom-7 -right-7 bg-[#D4A373] rounded-2xl px-6 py-5 shadow-2xl"
            >
              <div className="font-playfair text-4xl font-bold text-[#2C1810]">50K+</div>
              <div className="text-[#2C1810]/70 text-[0.65rem] font-playfair tracking-widest uppercase mt-0.5">Happy Customers</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute top-1/2 -right-10 -translate-y-1/2 w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden lg:block"
            >
              <img src="/croissant.png" alt="Croissant" className="w-full h-full object-cover" />
            </motion.div>

            <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full border-2 border-[#D4A373]/20 -z-10" />
            <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full border-2 border-[#3E2723]/10 -z-10" />
          </motion.div>

          {/* Text side */}
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={fadeUp}>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3E2723] leading-[1.1] mb-4">
                {(originStory?.title ?? 'A Kitchen,\nA Dream, &\nA Wooden Spoon.').split('\n').map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    {i < ((originStory?.title ?? 'A Kitchen,\nA Dream, &\nA Wooden Spoon.').split('\n').length - 1) && <br />}
                  </span>
                ))}
              </h2>

              <div className="inline-flex items-center gap-2 text-[#D4A373] text-xs font-playfair tracking-[0.3em] uppercase mt-3">
                <span className="h-px w-8 bg-[#D4A373]" /> {originStory?.subtitle ?? 'How It All Began'}
              </div>
            </motion.div>

            {originLoading && (
              <motion.p variants={fadeUp} className="text-[#7A5C4F] leading-[1.95] mb-5 text-base">Loading story…</motion.p>
            )}

            {!originLoading && (originStory ? (
              originStory.paragraphs?.map((p: string, idx: number) => (
                <motion.p key={idx} variants={fadeUp} className="text-[#7A5C4F] leading-[1.95] mb-5 text-base">{p}</motion.p>
              ))
            ) : (
              <>
                <motion.p variants={fadeUp} className="text-[#7A5C4F] leading-[1.95] mb-5 text-base">
                  In 2024, Margaret Howell started baking bread in her tiny kitchen on Elm Street. She had no commercial equipment, no business plan — just a passion for honest, wholesome food and a wooden spoon that she still keeps on display in our bakery today.
                </motion.p>
                <motion.p variants={fadeUp} className="text-[#7A5C4F] leading-[1.95] mb-5 text-base">
                  Word spread fast. Neighbours would knock on her door at 7 AM asking for another loaf. Within a year, Margaret quit her office job and opened Hangary? Sweet.'s first proper location on Market Street. The queue on opening day stretched around the block.
                </motion.p>
                <motion.p variants={fadeUp} className="text-[#7A5C4F] leading-[1.95] mb-10 text-base">
                  Today, Hangary? Sweet. is a multi-award-winning bakery serving over 500 customers daily. But our values haven't changed — the same family recipes, the same locally sourced ingredients, the same dedication to making every single item as perfect as it can be.
                </motion.p>
              </>
            ))}

            <motion.div variants={fadeUp} className="flex flex-col gap-3.5 mb-10">
              {[
                "Locally sourced flour & dairy from within 50km",
                "No artificial flavours, colours, or preservatives",
                "Hand-shaped, slow-fermented sourdough doughs",
                "Family recipes passed down for 4 generations",
                "Fresh-baked daily — nothing stored overnight",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[#3E2723] text-sm font-playfair">
                  <div className="w-5 h-5 bg-[#D4A373]/15 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={13} className="text-[#D4A373]" />
                  </div>
                  {item}
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <blockquote className="border-l-4 border-[#D4A373] pl-6 italic text-[#7A5C4F] text-base leading-[1.9]">
                "{originStory?.founder?.quote ?? 'I never wanted to run a bakery. I just wanted to feed people food that was honest and made with love. Everything else followed naturally.'}"
                <footer className="mt-3 not-italic font-playfair text-[#3E2723] text-sm">— {originStory?.founder?.name ?? 'Margaret Howell'}, Founder</footer>
              </blockquote>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
